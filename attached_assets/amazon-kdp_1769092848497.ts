/**
 * Amazon KDP (Kindle Direct Publishing) Connector
 * For low-content books: journals, planners, coloring books, puzzle books
 * 
 * NOTE: KDP has no public API. This provides:
 * 1. Book generation utilities
 * 2. Manuscript formatting
 * 3. Cover creation specs
 * 4. Pricing calculations
 * 
 * Upload is manual via kdp.amazon.com
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface KDPBook {
  title: string;
  subtitle?: string;
  author: string;
  description: string;
  keywords: string[]; // Max 7
  categories: string[]; // Max 2 BISAC codes
  
  // Book specs
  bookType: KDPBookType;
  trimSize: KDPTrimSize;
  paperType: 'white' | 'cream';
  coverFinish: 'matte' | 'glossy';
  
  // Content
  interiorPdfPath?: string;
  coverPdfPath?: string;
  pageCount: number;
  
  // Pricing
  listPrice: number;
  currency: 'USD' | 'GBP' | 'EUR';
  
  // Publishing
  territories: 'worldwide' | 'specific';
  adultContent: boolean;
}

export type KDPBookType = 
  | 'journal' | 'notebook' | 'planner' | 'coloring-book'
  | 'puzzle-book' | 'activity-book' | 'log-book' | 'workbook'
  | 'recipe-book' | 'address-book' | 'guest-book' | 'sketchbook';

export type KDPTrimSize = 
  | '5x8' | '5.06x7.81' | '5.25x8' | '5.5x8.5' 
  | '6x9' | '6.14x9.21' | '6.69x9.61' | '7x10'
  | '7.44x9.69' | '7.5x9.25' | '8x10' | '8.25x6'
  | '8.25x8.25' | '8.5x8.5' | '8.5x11';

// Trim size dimensions in inches
const TRIM_DIMENSIONS: Record<KDPTrimSize, { width: number; height: number }> = {
  '5x8': { width: 5, height: 8 },
  '5.06x7.81': { width: 5.06, height: 7.81 },
  '5.25x8': { width: 5.25, height: 8 },
  '5.5x8.5': { width: 5.5, height: 8.5 },
  '6x9': { width: 6, height: 9 },
  '6.14x9.21': { width: 6.14, height: 9.21 },
  '6.69x9.61': { width: 6.69, height: 9.61 },
  '7x10': { width: 7, height: 10 },
  '7.44x9.69': { width: 7.44, height: 9.69 },
  '7.5x9.25': { width: 7.5, height: 9.25 },
  '8x10': { width: 8, height: 10 },
  '8.25x6': { width: 8.25, height: 6 },
  '8.25x8.25': { width: 8.25, height: 8.25 },
  '8.5x8.5': { width: 8.5, height: 8.5 },
  '8.5x11': { width: 8.5, height: 11 },
};

// Bleed settings
const BLEED = {
  outer: 0.125,  // inches
  inner: 0,      // no bleed on spine side
};

// Page count limits
const PAGE_LIMITS = {
  min: 24,
  max: 828,
  colorMax: 550,
};

// Royalty rates
const ROYALTY_RATES = {
  '60%': {
    minPrice: 0.99,
    maxPrice: 250,
    printingCostMultiplier: 1.0,
  },
  '40%': {
    minPrice: 0.99,
    maxPrice: 250,
    printingCostMultiplier: 0.6, // Expanded distribution
  },
};

// Printing costs (approximations, actual varies by page count and marketplace)
const PRINTING_COSTS = {
  fixedCost: 0.85, // Base cost USD
  perPageBlackWhite: 0.012,
  perPageColor: 0.07,
};

export interface KDPConfig {
  supabaseUrl: string;
  supabaseKey: string;
  authorName: string;
  publisherName?: string;
}

export class KDPConnector {
  private supabase: SupabaseClient;
  private authorName: string;
  private publisherName?: string;
  
  constructor(config: KDPConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.authorName = config.authorName;
    this.publisherName = config.publisherName;
  }
  
  /**
   * Calculate cover dimensions based on trim size and page count
   */
  calculateCoverDimensions(trimSize: KDPTrimSize, pageCount: number, paperType: 'white' | 'cream'): {
    fullCoverWidth: number;
    fullCoverHeight: number;
    spineWidth: number;
    frontCoverWidth: number;
    backCoverWidth: number;
    bleed: number;
    pixelWidth: number;
    pixelHeight: number;
  } {
    const dims = TRIM_DIMENSIONS[trimSize];
    
    // Spine width calculation
    const pageThickness = paperType === 'white' ? 0.002252 : 0.0025;
    const spineWidth = pageCount * pageThickness;
    
    // Full cover dimensions (with bleed)
    const fullCoverWidth = dims.width * 2 + spineWidth + (BLEED.outer * 2);
    const fullCoverHeight = dims.height + (BLEED.outer * 2);
    
    // Pixels at 300 DPI
    const pixelWidth = Math.ceil(fullCoverWidth * 300);
    const pixelHeight = Math.ceil(fullCoverHeight * 300);
    
    return {
      fullCoverWidth,
      fullCoverHeight,
      spineWidth,
      frontCoverWidth: dims.width + BLEED.outer,
      backCoverWidth: dims.width + BLEED.outer,
      bleed: BLEED.outer,
      pixelWidth,
      pixelHeight,
    };
  }
  
  /**
   * Calculate interior page dimensions
   */
  calculateInteriorDimensions(trimSize: KDPTrimSize, hasBleed: boolean): {
    pageWidth: number;
    pageHeight: number;
    pixelWidth: number;
    pixelHeight: number;
    safeMargin: number;
  } {
    const dims = TRIM_DIMENSIONS[trimSize];
    
    const pageWidth = hasBleed ? dims.width + (BLEED.outer * 2) : dims.width;
    const pageHeight = hasBleed ? dims.height + (BLEED.outer * 2) : dims.height;
    
    return {
      pageWidth,
      pageHeight,
      pixelWidth: Math.ceil(pageWidth * 300),
      pixelHeight: Math.ceil(pageHeight * 300),
      safeMargin: 0.25, // inches from edge for text
    };
  }
  
  /**
   * Calculate printing cost and royalty
   */
  calculateRoyalty(
    listPrice: number,
    pageCount: number,
    isColor: boolean,
    royaltyRate: '60%' | '40%' = '60%'
  ): {
    printingCost: number;
    royaltyAmount: number;
    royaltyPercent: number;
    minimumPrice: number;
    profitable: boolean;
  } {
    // Calculate printing cost
    const perPageCost = isColor ? PRINTING_COSTS.perPageColor : PRINTING_COSTS.perPageBlackWhite;
    const printingCost = PRINTING_COSTS.fixedCost + (pageCount * perPageCost);
    
    // Calculate royalty
    const rate = royaltyRate === '60%' ? 0.6 : 0.4;
    const royaltyAmount = Math.max(0, (listPrice * rate) - printingCost);
    const royaltyPercent = listPrice > 0 ? (royaltyAmount / listPrice) * 100 : 0;
    
    // Minimum profitable price (royalty > $0)
    const minimumPrice = printingCost / rate;
    
    return {
      printingCost: Math.round(printingCost * 100) / 100,
      royaltyAmount: Math.round(royaltyAmount * 100) / 100,
      royaltyPercent: Math.round(royaltyPercent * 10) / 10,
      minimumPrice: Math.ceil(minimumPrice * 100) / 100,
      profitable: royaltyAmount > 0,
    };
  }
  
  /**
   * Suggest pricing for a book
   */
  suggestPricing(
    pageCount: number,
    isColor: boolean,
    competitorPrices?: number[]
  ): {
    minimumPrice: number;
    recommendedPrice: number;
    premiumPrice: number;
    estimatedRoyalty: number;
  } {
    const { minimumPrice } = this.calculateRoyalty(10, pageCount, isColor);
    
    // Add margin to minimum
    let recommendedPrice: number;
    if (isColor) {
      recommendedPrice = Math.max(minimumPrice + 5, pageCount * 0.15);
    } else {
      recommendedPrice = Math.max(minimumPrice + 3, 6.99);
    }
    
    // Round to .99
    recommendedPrice = Math.ceil(recommendedPrice) - 0.01;
    
    // Adjust based on competitors
    if (competitorPrices && competitorPrices.length > 0) {
      const avgCompetitor = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
      // Price slightly below average if profitable
      if (avgCompetitor - 1 > minimumPrice) {
        recommendedPrice = Math.ceil(avgCompetitor - 1) - 0.01;
      }
    }
    
    const premiumPrice = recommendedPrice + 4;
    
    const { royaltyAmount } = this.calculateRoyalty(recommendedPrice, pageCount, isColor);
    
    return {
      minimumPrice: Math.ceil(minimumPrice * 100) / 100,
      recommendedPrice,
      premiumPrice,
      estimatedRoyalty: royaltyAmount,
    };
  }
  
  /**
   * Generate book metadata for a niche
   */
  generateBookMetadata(
    niche: string,
    bookType: KDPBookType,
    subNiche?: string
  ): {
    titleSuggestions: string[];
    keywordSuggestions: string[];
    descriptionTemplate: string;
    recommendedTrimSize: KDPTrimSize;
    recommendedPageCount: number;
  } {
    const nicheKeywords: Record<string, string[]> = {
      'fitness': ['workout log', 'exercise tracker', 'gym planner', 'fitness journal', 'weight loss'],
      'gratitude': ['gratitude journal', 'daily gratitude', 'thankful', 'mindfulness', 'self care'],
      'budget': ['budget planner', 'expense tracker', 'financial planner', 'money management', 'savings'],
      'travel': ['travel journal', 'adventure log', 'vacation planner', 'trip diary', 'wanderlust'],
      'recipe': ['recipe book', 'cookbook', 'meal planner', 'kitchen', 'homemade'],
      'garden': ['garden planner', 'plant journal', 'gardening log', 'seed tracker', 'harvest'],
      'reading': ['reading log', 'book tracker', 'bibliophile', 'book lover', 'reading journal'],
      'baby': ['baby book', 'milestone tracker', 'memory book', 'first year', 'new mom'],
      'wedding': ['wedding planner', 'bride journal', 'guest book', 'bridal shower', 'wedding day'],
      'password': ['password book', 'password keeper', 'internet log', 'security', 'organizer'],
    };
    
    const bookTypeSpecs: Record<KDPBookType, { trimSize: KDPTrimSize; pageCount: number }> = {
      'journal': { trimSize: '6x9', pageCount: 120 },
      'notebook': { trimSize: '6x9', pageCount: 110 },
      'planner': { trimSize: '8.5x11', pageCount: 150 },
      'coloring-book': { trimSize: '8.5x11', pageCount: 50 },
      'puzzle-book': { trimSize: '6x9', pageCount: 100 },
      'activity-book': { trimSize: '8.5x11', pageCount: 80 },
      'log-book': { trimSize: '6x9', pageCount: 120 },
      'workbook': { trimSize: '8.5x11', pageCount: 100 },
      'recipe-book': { trimSize: '8.5x11', pageCount: 100 },
      'address-book': { trimSize: '5.5x8.5', pageCount: 60 },
      'guest-book': { trimSize: '8.25x6', pageCount: 80 },
      'sketchbook': { trimSize: '8.5x11', pageCount: 110 },
    };
    
    const keywords = nicheKeywords[niche] || ['journal', 'planner', 'tracker', 'organizer', 'gift'];
    const specs = bookTypeSpecs[bookType];
    
    const subNicheText = subNiche ? ` ${subNiche}` : '';
    
    return {
      titleSuggestions: [
        `${this.capitalize(niche)}${subNicheText} ${this.capitalize(bookType)}`,
        `My ${this.capitalize(niche)}${subNicheText} ${this.capitalize(bookType)}`,
        `The Ultimate ${this.capitalize(niche)}${subNicheText} ${this.capitalize(bookType)}`,
        `Daily ${this.capitalize(niche)}${subNicheText} Tracker`,
        `${this.capitalize(niche)}${subNicheText}: A Personal ${this.capitalize(bookType)}`,
      ],
      keywordSuggestions: keywords.slice(0, 7),
      descriptionTemplate: this.generateDescription(niche, bookType),
      recommendedTrimSize: specs.trimSize,
      recommendedPageCount: specs.pageCount,
    };
  }
  
  /**
   * Generate book description
   */
  private generateDescription(niche: string, bookType: string): string {
    return `**Track Your ${this.capitalize(niche)} Journey**

This beautifully designed ${bookType} is perfect for anyone who wants to organize and track their ${niche} activities.

**Features:**
• Premium quality paper
• Thoughtfully designed pages
• Plenty of space for notes
• Portable and convenient size
• Makes a perfect gift

Whether you're just starting out or you're a seasoned pro, this ${bookType} will help you stay organized and motivated.

**Perfect for:**
✓ Personal use
✓ Gift giving
✓ Starting a new habit
✓ Staying organized

Order your copy today and start your journey!`;
  }
  
  /**
   * Validate book before submission
   */
  validateBook(book: KDPBook): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Title validation
    if (book.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
    if (book.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    
    // Keywords validation
    if (book.keywords.length > 7) {
      errors.push('Maximum 7 keywords allowed');
    }
    for (const keyword of book.keywords) {
      if (keyword.length > 50) {
        errors.push(`Keyword "${keyword.substring(0, 20)}..." exceeds 50 characters`);
      }
    }
    
    // Page count validation
    if (book.pageCount < PAGE_LIMITS.min) {
      errors.push(`Minimum page count is ${PAGE_LIMITS.min}`);
    }
    if (book.pageCount > PAGE_LIMITS.max) {
      errors.push(`Maximum page count is ${PAGE_LIMITS.max}`);
    }
    
    // Description validation
    if (book.description.length > 4000) {
      errors.push('Description must be 4000 characters or less');
    }
    if (book.description.length < 50) {
      warnings.push('Description should be at least 50 characters for better visibility');
    }
    
    // Pricing validation
    if (book.listPrice < 0.99) {
      errors.push('Minimum price is $0.99');
    }
    if (book.listPrice > 250) {
      errors.push('Maximum price is $250');
    }
    
    // Check profitability
    const { profitable, minimumPrice } = this.calculateRoyalty(
      book.listPrice,
      book.pageCount,
      false
    );
    if (!profitable) {
      warnings.push(`Price too low for profit. Minimum profitable price: $${minimumPrice}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * Save book to database for tracking
   */
  async saveBook(book: KDPBook, asin?: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('kdp_books')
      .insert({
        title: book.title,
        subtitle: book.subtitle,
        author: book.author,
        book_type: book.bookType,
        trim_size: book.trimSize,
        page_count: book.pageCount,
        list_price: book.listPrice,
        keywords: book.keywords,
        asin,
        status: asin ? 'published' : 'draft',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  /**
   * Helper: Capitalize string
   */
  private capitalize(str: string): string {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

export default KDPConnector;
