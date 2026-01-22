/**
 * Redbubble Platform Connector
 * 
 * NOTE: Redbubble does not have a public API for programmatic uploads.
 * This connector uses browser automation (Playwright) for uploads.
 * 
 * Requires: npm install playwright
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RedbubbleCredentials {
  email: string;
  password: string;
  artistName: string;
}

export interface RedbubbleProduct {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  products: RedbubbleProductType[];
  defaultMarkup: number;
}

export type RedbubbleProductType = 
  | 'sticker' | 'poster' | 'art-print' | 'canvas' | 'framed-print'
  | 't-shirt' | 'hoodie' | 'tank-top' | 'long-sleeve' | 'fitted-scoop'
  | 'mug' | 'travel-mug' | 'water-bottle' | 'coaster'
  | 'phone-case' | 'laptop-sleeve' | 'laptop-skin'
  | 'tote-bag' | 'drawstring-bag' | 'backpack'
  | 'throw-pillow' | 'floor-pillow' | 'duvet-cover' | 'shower-curtain'
  | 'clock' | 'magnet' | 'pin' | 'notebook' | 'greeting-card';

export interface RedbubbleConfig {
  supabaseUrl: string;
  supabaseKey: string;
  credentials: RedbubbleCredentials;
  headless?: boolean;
  defaultMarkup?: number;
}

// Redbubble markup percentages
const MARKUP_TIERS = {
  economy: 15,
  standard: 20,
  premium: 30,
};

// Product category mappings
const PRODUCT_CATEGORIES: Record<string, string[]> = {
  'wall-art': ['poster', 'art-print', 'canvas', 'framed-print', 'clock'],
  'apparel': ['t-shirt', 'hoodie', 'tank-top', 'long-sleeve', 'fitted-scoop'],
  'stickers': ['sticker', 'magnet', 'pin'],
  'home-decor': ['throw-pillow', 'floor-pillow', 'duvet-cover', 'shower-curtain'],
  'drinkware': ['mug', 'travel-mug', 'water-bottle', 'coaster'],
  'accessories': ['phone-case', 'laptop-sleeve', 'laptop-skin', 'tote-bag', 'backpack'],
  'stationery': ['notebook', 'greeting-card'],
};

export class RedbubbleConnector {
  private supabase: SupabaseClient;
  private credentials: RedbubbleCredentials;
  private headless: boolean;
  private defaultMarkup: number;
  private isLoggedIn: boolean = false;
  
  constructor(config: RedbubbleConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.credentials = config.credentials;
    this.headless = config.headless ?? true;
    this.defaultMarkup = config.defaultMarkup ?? MARKUP_TIERS.standard;
  }
  
  /**
   * Upload a design to Redbubble using browser automation
   * NOTE: Requires Playwright to be installed
   */
  async uploadDesign(product: RedbubbleProduct): Promise<{
    success: boolean;
    workId?: string;
    url?: string;
    error?: string;
  }> {
    // Dynamic import for Playwright (optional dependency)
    let playwright;
    try {
      playwright = await import('playwright');
    } catch {
      return {
        success: false,
        error: 'Playwright not installed. Run: npm install playwright',
      };
    }
    
    const browser = await playwright.chromium.launch({ headless: this.headless });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Login if not already
      if (!this.isLoggedIn) {
        await this.login(page);
      }
      
      // Navigate to upload page
      await page.goto('https://www.redbubble.com/portfolio/images/new');
      await page.waitForLoadState('networkidle');
      
      // Upload image
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error('Could not find file upload input');
      }
      
      // Download image locally first, then upload
      const imageBuffer = await this.downloadImage(product.imageUrl);
      const tempPath = `/tmp/rb_upload_${Date.now()}.png`;
      const fs = await import('fs');
      fs.writeFileSync(tempPath, imageBuffer);
      
      await fileInput.setInputFiles(tempPath);
      
      // Wait for upload to complete
      await page.waitForSelector('[data-testid="upload-complete"]', { timeout: 60000 });
      
      // Fill in details
      await page.fill('input[name="title"]', product.title);
      await page.fill('textarea[name="description"]', product.description);
      
      // Add tags
      for (const tag of product.tags.slice(0, 15)) { // Redbubble limit: 15 tags
        await page.fill('input[name="tags"]', tag);
        await page.keyboard.press('Enter');
      }
      
      // Set markup
      const markupInput = await page.$('input[name="markup"]');
      if (markupInput) {
        await markupInput.fill(String(product.defaultMarkup || this.defaultMarkup));
      }
      
      // Enable selected products
      for (const productType of product.products) {
        const checkbox = await page.$(`input[data-product="${productType}"]`);
        if (checkbox) {
          await checkbox.check();
        }
      }
      
      // Submit
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/works\/\d+/, { timeout: 30000 });
      
      // Extract work ID from URL
      const url = page.url();
      const workIdMatch = url.match(/\/works\/(\d+)/);
      const workId = workIdMatch ? workIdMatch[1] : undefined;
      
      // Log to database
      await this.logActivity('upload', {
        workId,
        title: product.title,
        products: product.products,
      });
      
      // Cleanup
      fs.unlinkSync(tempPath);
      await browser.close();
      
      return {
        success: true,
        workId,
        url,
      };
    } catch (error) {
      await browser.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Login to Redbubble
   */
  private async login(page: any): Promise<void> {
    await page.goto('https://www.redbubble.com/auth/login');
    await page.fill('input[name="email"]', this.credentials.email);
    await page.fill('input[name="password"]', this.credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('https://www.redbubble.com/portfolio/manage_works');
    this.isLoggedIn = true;
  }
  
  /**
   * Download image from URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  /**
   * Get earnings data (scraping required)
   */
  async getEarnings(dateRange?: { start: Date; end: Date }): Promise<{
    totalEarnings: number;
    pendingEarnings: number;
    thisMonthEarnings: number;
  }> {
    // This would require browser automation to scrape earnings page
    // Placeholder for now
    return {
      totalEarnings: 0,
      pendingEarnings: 0,
      thisMonthEarnings: 0,
    };
  }
  
  /**
   * Log activity to database
   */
  private async logActivity(action: string, details: Record<string, any>): Promise<void> {
    try {
      await this.supabase.from('platform_activity_log').insert({
        platform: 'redbubble',
        action,
        details,
        status: 'success',
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log Redbubble activity:', error);
    }
  }
  
  /**
   * Get recommended products for a niche
   */
  static getRecommendedProducts(niche: string): RedbubbleProductType[] {
    const recommendations: Record<string, RedbubbleProductType[]> = {
      'gaming': ['sticker', 't-shirt', 'poster', 'mug', 'phone-case', 'mousepad'],
      'pets': ['sticker', 't-shirt', 'mug', 'tote-bag', 'throw-pillow', 'magnet'],
      'quotes': ['poster', 'art-print', 'sticker', 't-shirt', 'mug', 'notebook'],
      'art': ['poster', 'art-print', 'canvas', 'framed-print', 'sticker', 't-shirt'],
      'humor': ['sticker', 't-shirt', 'mug', 'phone-case', 'magnet', 'greeting-card'],
      'default': ['sticker', 't-shirt', 'poster', 'mug', 'phone-case', 'tote-bag'],
    };
    
    return recommendations[niche] || recommendations['default'];
  }
  
  /**
   * Calculate estimated revenue
   */
  static calculateRevenue(basePrice: number, markup: number): number {
    return basePrice * (markup / 100);
  }
}

export default RedbubbleConnector;
