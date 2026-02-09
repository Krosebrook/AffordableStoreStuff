/**
 * Etsy Marketplace Connector
 *
 * Implements OAuth 2.0 flow for Etsy API v3
 * Features:
 * - OAuth authentication with PKCE
 * - Shop management and listing creation
 * - AI-generated content optimization
 * - Bulk listing management
 * - Rate limiting compliance (100 req/min)
 * - Retry logic for failed operations
 * - Platform-specific tag and taxonomy optimization
 */

import { createLogger, withRetry, CircuitBreaker, recordMetric, trackError } from '../lib/observability';
import { db } from '../db';
import { platformConnections } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { AIProvider } from './ai-service';
import { aiService } from './ai-service';
import { listingTemplates, type TemplateData } from './listing-templates';

const logger = createLogger('EtsyConnector');

export interface EtsyCredentials {
  apiKey: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  shopId: string;
}

export interface EtsyShopInfo {
  shop_id: number;
  shop_name: string;
  user_id: number;
  create_date: number;
  title: string;
  announcement?: string;
  currency_code: string;
  is_vacation: boolean;
  vacation_message?: string;
  sale_message?: string;
  digital_sale_message?: string;
  listing_active_count: number;
}

export interface EtsyListingImage {
  listing_id: number;
  listing_image_id: number;
  url_570xN: string;
  url_fullxfull: string;
  full_height: number;
  full_width: number;
  rank: number;
}

export interface EtsyListingDraft {
  title: string;
  description: string;
  price: number;
  quantity: number;
  taxonomy_id: number;
  tags: string[];
  who_made: 'i_did' | 'someone_else' | 'collective';
  when_made: 'made_to_order' | '2020_2024' | '2010_2019' | '2000_2009' | 'before_2000' | '1990s' | '1980s' | '1970s' | '1960s' | '1950s' | '1940s' | '1930s' | '1920s' | '1910s' | '1900s' | '1800s' | '1700s' | 'before_1700';
  is_supply: boolean;
  shipping_profile_id?: number;
  return_policy_id?: number;
  materials?: string[];
  processing_min?: number;
  processing_max?: number;
  images?: string[];
  videos?: string[];
  is_personalizable?: boolean;
  personalization_is_required?: boolean;
  personalization_char_count_max?: number;
  personalization_instructions?: string;
  production_partner_ids?: number[];
  type?: 'physical' | 'download' | 'both';
  is_customizable?: boolean;
  should_auto_renew?: boolean;
  is_taxable?: boolean;
}

export interface EtsyListing {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  description: string;
  state: 'active' | 'inactive' | 'sold_out' | 'draft' | 'expired';
  creation_timestamp: number;
  ending_timestamp: number;
  original_creation_timestamp: number;
  last_modified_timestamp: number;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  quantity: number;
  sku: string[];
  tags: string[];
  taxonomy_id: number;
  url: string;
  num_favorers: number;
  views: number;
}

export interface BulkListingResult {
  success: boolean;
  listing_id?: number;
  url?: string;
  error?: string;
  title: string;
}

export interface EtsyTaxonomy {
  id: number;
  name: string;
  parent_id?: number;
  level: number;
  children?: number[];
}

export interface AIOptimizedContent {
  title: string;
  description: string;
  tags: string[];
  materials: string[];
  suggestedTaxonomy?: number;
}

class EtsyConnector {
  private readonly baseUrl = 'https://openapi.etsy.com/v3';
  private readonly authUrl = 'https://www.etsy.com/oauth';
  private circuitBreaker: CircuitBreaker;
  private rateLimitWindow: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly maxRequestsPerMinute = 100;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('etsy', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });
  }

  // ============================================================================
  // OAUTH FLOW
  // ============================================================================

  /**
   * Generate OAuth authorization URL with PKCE
   */
  generateAuthUrl(params: {
    clientId: string;
    redirectUri: string;
    state: string;
    codeVerifier: string;
  }): string {
    const codeChallenge = this.generateCodeChallenge(params.codeVerifier);
    const scopes = [
      'listings_r',
      'listings_w',
      'shops_r',
      'shops_w',
      'profile_r',
      'email_r',
      'transactions_r',
    ].join('%20');

    return `${this.authUrl}/connect?response_type=code&client_id=${params.clientId}&redirect_uri=${encodeURIComponent(params.redirectUri)}&scope=${scopes}&state=${params.state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private generateCodeChallenge(verifier: string): string {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(params: {
    clientId: string;
    code: string;
    redirectUri: string;
    codeVerifier: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    logger.info('Exchanging authorization code for access token');

    try {
      const response = await fetch(`${this.authUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: params.clientId,
          redirect_uri: params.redirectUri,
          code: params.code,
          code_verifier: params.codeVerifier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
      }

      const data = await response.json();
      logger.info('Access token obtained successfully');
      recordMetric('etsy.oauth.success', 1, {});

      return data;
    } catch (error: any) {
      logger.error('OAuth token exchange failed', error);
      trackError(error, { operation: 'exchangeCodeForToken' });
      recordMetric('etsy.oauth.error', 1, {});
      throw error;
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(params: {
    clientId: string;
    refreshToken: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    logger.info('Refreshing access token');

    try {
      const response = await fetch(`${this.authUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: params.clientId,
          refresh_token: params.refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
      }

      const data = await response.json();
      logger.info('Access token refreshed successfully');
      recordMetric('etsy.token.refresh.success', 1, {});

      return data;
    } catch (error: any) {
      logger.error('Token refresh failed', error);
      trackError(error, { operation: 'refreshAccessToken' });
      recordMetric('etsy.token.refresh.error', 1, {});
      throw error;
    }
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  /**
   * Check and enforce rate limits (100 requests per minute)
   */
  private async checkRateLimit(shopId: string): Promise<void> {
    const key = `etsy_${shopId}`;
    const now = Date.now();
    const window = this.rateLimitWindow.get(key);

    if (!window || now > window.resetAt) {
      this.rateLimitWindow.set(key, {
        count: 1,
        resetAt: now + 60000, // 1 minute
      });
      return;
    }

    if (window.count >= this.maxRequestsPerMinute) {
      const waitTime = window.resetAt - now;
      logger.warn('Rate limit reached, waiting', { waitTime, shopId });
      recordMetric('etsy.rate_limit.wait', 1, { shopId });
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitWindow.set(key, {
        count: 1,
        resetAt: now + 60000,
      });
    } else {
      window.count++;
    }
  }

  // ============================================================================
  // API REQUESTS
  // ============================================================================

  /**
   * Make authenticated API request with retry logic
   */
  private async makeRequest<T>(params: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
    credentials: EtsyCredentials;
    body?: any;
    isFileUpload?: boolean;
  }): Promise<T> {
    await this.checkRateLimit(params.credentials.shopId);

    return await this.circuitBreaker.execute(async () => {
      return await withRetry(
        async () => {
          const url = `${this.baseUrl}${params.endpoint}`;
          const headers: Record<string, string> = {
            'x-api-key': params.credentials.apiKey,
            'Authorization': `Bearer ${params.credentials.accessToken}`,
          };

          if (!params.isFileUpload) {
            headers['Content-Type'] = 'application/json';
          }

          const response = await fetch(url, {
            method: params.method,
            headers,
            body: params.body ? (params.isFileUpload ? params.body : JSON.stringify(params.body)) : undefined,
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: errorText };
            }

            // Handle rate limit errors
            if (response.status === 429) {
              const retryAfter = response.headers.get('Retry-After');
              const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
              logger.warn('Rate limited by Etsy API', { retryAfter, waitTime });
              await new Promise(resolve => setTimeout(resolve, waitTime));
              throw new Error('Rate limited - will retry');
            }

            throw new Error(`Etsy API error: ${response.status} - ${errorData.error || errorText}`);
          }

          const data = await response.json();
          recordMetric('etsy.api.request', 1, { method: params.method, status: 'success' });
          return data;
        },
        {
          maxAttempts: 3,
          baseDelayMs: 1000,
          maxDelayMs: 10000,
          shouldRetry: (error) => {
            return error.message?.includes('Rate limited') ||
                   error.message?.includes('ECONNRESET') ||
                   error.message?.includes('ETIMEDOUT') ||
                   error.message?.includes('503') ||
                   error.message?.includes('502');
          },
          onRetry: (error, attempt, delayMs) => {
            logger.warn('Retrying Etsy API request', { attempt, delayMs, error: error.message });
            recordMetric('etsy.api.retry', 1, { attempt: String(attempt) });
          },
        }
      );
    });
  }

  // ============================================================================
  // SHOP MANAGEMENT
  // ============================================================================

  /**
   * Get shop information
   */
  async getShop(credentials: EtsyCredentials): Promise<EtsyShopInfo> {
    logger.info('Fetching shop information', { shopId: credentials.shopId });

    try {
      const data = await this.makeRequest<EtsyShopInfo>({
        method: 'GET',
        endpoint: `/application/shops/${credentials.shopId}`,
        credentials,
      });

      logger.info('Shop information retrieved', { shopName: data.shop_name });
      return data;
    } catch (error: any) {
      logger.error('Failed to fetch shop information', error);
      trackError(error, { operation: 'getShop', shopId: credentials.shopId });
      throw error;
    }
  }

  /**
   * Get shop's active listings
   */
  async getShopListings(
    credentials: EtsyCredentials,
    options?: { limit?: number; offset?: number; state?: 'active' | 'inactive' | 'draft' | 'expired' }
  ): Promise<{ listings: EtsyListing[]; count: number }> {
    logger.info('Fetching shop listings', { shopId: credentials.shopId, options });

    try {
      const queryParams = new URLSearchParams({
        limit: String(options?.limit || 25),
        offset: String(options?.offset || 0),
        ...(options?.state && { state: options.state }),
      });

      const data = await this.makeRequest<{ results: EtsyListing[]; count: number }>({
        method: 'GET',
        endpoint: `/application/shops/${credentials.shopId}/listings?${queryParams}`,
        credentials,
      });

      logger.info('Shop listings retrieved', { count: data.count });
      return { listings: data.results, count: data.count };
    } catch (error: any) {
      logger.error('Failed to fetch shop listings', error);
      trackError(error, { operation: 'getShopListings', shopId: credentials.shopId });
      throw error;
    }
  }

  // ============================================================================
  // AI-POWERED CONTENT GENERATION
  // ============================================================================

  /**
   * Generate optimized listing content using AI
   */
  async generateOptimizedContent(params: {
    productName: string;
    productDescription?: string;
    category?: string;
    materials?: string[];
    targetAudience?: string;
    brandVoice?: string;
    aiProvider?: AIProvider;
  }): Promise<AIOptimizedContent> {
    logger.info('Generating AI-optimized content for Etsy listing', { productName: params.productName });

    try {
      const systemPrompt = `You are an expert Etsy listing copywriter. Create compelling, SEO-optimized content for handmade and vintage items that follows Etsy's best practices.

Key guidelines:
- Title: 140 characters max, front-load important keywords
- Description: Engaging, detailed, includes materials, dimensions, care instructions
- Tags: 13 max, 20 characters each, use long-tail keywords
- Materials: List all materials used (max 13)
- Focus on benefits and unique selling points
- Use natural language that appeals to buyers
${params.brandVoice ? `\n- Brand voice: ${params.brandVoice}` : ''}
${params.targetAudience ? `\n- Target audience: ${params.targetAudience}` : ''}`;

      const userPrompt = `Create an optimized Etsy listing for:
Product: ${params.productName}
${params.productDescription ? `Description: ${params.productDescription}` : ''}
${params.category ? `Category: ${params.category}` : ''}
${params.materials && params.materials.length > 0 ? `Materials: ${params.materials.join(', ')}` : ''}

Return a JSON object with:
{
  "title": "SEO-optimized title (140 chars max)",
  "description": "Compelling multi-paragraph description with sections",
  "tags": ["tag1", "tag2", ...] (13 tags, 20 chars each),
  "materials": ["material1", "material2", ...] (if applicable)
}`;

      const result = await aiService.generateText({
        provider: params.aiProvider || 'openai',
        prompt: userPrompt,
        systemPrompt,
        model: params.aiProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
        maxTokens: 2000,
      });

      // Parse AI response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const optimizedContent = JSON.parse(jsonMatch[0]) as AIOptimizedContent;

      // Validate and trim to Etsy limits
      optimizedContent.title = optimizedContent.title.slice(0, 140);
      optimizedContent.tags = optimizedContent.tags
        .map(tag => tag.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim())
        .filter(tag => tag.length > 0 && tag.length <= 20)
        .slice(0, 13);

      if (optimizedContent.materials) {
        optimizedContent.materials = optimizedContent.materials
          .filter(m => m.length > 0)
          .slice(0, 13);
      }

      logger.info('AI content generated successfully', {
        titleLength: optimizedContent.title.length,
        tagCount: optimizedContent.tags.length,
      });

      recordMetric('etsy.ai.content.generated', 1, {
        provider: params.aiProvider || 'openai',
      });

      return optimizedContent;
    } catch (error: any) {
      logger.error('Failed to generate AI content', error);
      trackError(error, { operation: 'generateOptimizedContent' });
      throw error;
    }
  }

  // ============================================================================
  // TAXONOMY & CATEGORIES
  // ============================================================================

  /**
   * Get Etsy taxonomy (categories)
   */
  async getTaxonomy(): Promise<EtsyTaxonomy[]> {
    logger.info('Fetching Etsy taxonomy');

    try {
      const credentials = { apiKey: process.env.ETSY_API_KEY || '' } as EtsyCredentials;

      const data = await this.makeRequest<{ results: EtsyTaxonomy[] }>({
        method: 'GET',
        endpoint: '/application/seller-taxonomy/nodes',
        credentials,
      });

      logger.info('Taxonomy retrieved', { count: data.results.length });
      return data.results;
    } catch (error: any) {
      logger.error('Failed to fetch taxonomy', error);
      trackError(error, { operation: 'getTaxonomy' });
      throw error;
    }
  }

  /**
   * Find best matching taxonomy ID for product category
   */
  async findTaxonomyId(categoryName: string): Promise<number | null> {
    try {
      const taxonomies = await this.getTaxonomy();
      const normalizedCategory = categoryName.toLowerCase();

      // Try exact match first
      let match = taxonomies.find(t => t.name.toLowerCase() === normalizedCategory);

      // Try partial match
      if (!match) {
        match = taxonomies.find(t =>
          t.name.toLowerCase().includes(normalizedCategory) ||
          normalizedCategory.includes(t.name.toLowerCase())
        );
      }

      return match?.id || null;
    } catch (error: any) {
      logger.error('Failed to find taxonomy ID', error);
      return null;
    }
  }

  // ============================================================================
  // LISTING CREATION & MANAGEMENT
  // ============================================================================

  /**
   * Create a new listing
   */
  async createListing(
    credentials: EtsyCredentials,
    listingData: EtsyListingDraft
  ): Promise<EtsyListing> {
    logger.info('Creating Etsy listing', { title: listingData.title });

    try {
      // Validate required fields
      if (!listingData.title || !listingData.description || !listingData.price || !listingData.quantity) {
        throw new Error('Missing required fields: title, description, price, quantity');
      }

      // Prepare listing payload
      const payload: any = {
        quantity: listingData.quantity,
        title: listingData.title.slice(0, 140), // Etsy limit
        description: listingData.description,
        price: listingData.price,
        who_made: listingData.who_made,
        when_made: listingData.when_made,
        taxonomy_id: listingData.taxonomy_id,
        is_supply: listingData.is_supply || false,
        ...(listingData.shipping_profile_id && { shipping_profile_id: listingData.shipping_profile_id }),
        ...(listingData.return_policy_id && { return_policy_id: listingData.return_policy_id }),
        ...(listingData.materials && { materials: listingData.materials }),
        ...(listingData.tags && { tags: listingData.tags.slice(0, 13) }),
        ...(listingData.processing_min && { processing_min: listingData.processing_min }),
        ...(listingData.processing_max && { processing_max: listingData.processing_max }),
        ...(listingData.type && { type: listingData.type }),
        ...(listingData.is_personalizable && { is_personalizable: listingData.is_personalizable }),
        ...(listingData.is_customizable && { is_customizable: listingData.is_customizable }),
        ...(listingData.should_auto_renew && { should_auto_renew: listingData.should_auto_renew }),
      };

      const data = await this.makeRequest<EtsyListing>({
        method: 'POST',
        endpoint: `/application/shops/${credentials.shopId}/listings`,
        credentials,
        body: payload,
      });

      logger.info('Listing created successfully', { listingId: data.listing_id, url: data.url });
      recordMetric('etsy.listing.created', 1, { shopId: credentials.shopId });

      // Upload images if provided
      if (listingData.images && listingData.images.length > 0) {
        await this.uploadListingImages(credentials, data.listing_id, listingData.images);
      }

      return data;
    } catch (error: any) {
      logger.error('Failed to create listing', error, { title: listingData.title });
      trackError(error, { operation: 'createListing', title: listingData.title });
      recordMetric('etsy.listing.error', 1, { shopId: credentials.shopId });
      throw error;
    }
  }

  /**
   * Upload images to a listing
   */
  async uploadListingImages(
    credentials: EtsyCredentials,
    listingId: number,
    imageUrls: string[]
  ): Promise<EtsyListingImage[]> {
    logger.info('Uploading images to listing', { listingId, imageCount: imageUrls.length });

    const uploadedImages: EtsyListingImage[] = [];

    try {
      for (let i = 0; i < Math.min(imageUrls.length, 10); i++) { // Etsy max 10 images
        const imageUrl = imageUrls[i];

        // Download image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          logger.warn('Failed to download image', { imageUrl });
          continue;
        }

        const imageBlob = await imageResponse.blob();
        const formData = new FormData();
        formData.append('image', imageBlob, `image_${i}.jpg`);
        formData.append('rank', String(i + 1));

        const uploadedImage = await this.makeRequest<EtsyListingImage>({
          method: 'POST',
          endpoint: `/application/shops/${credentials.shopId}/listings/${listingId}/images`,
          credentials,
          body: formData,
          isFileUpload: true,
        });

        uploadedImages.push(uploadedImage);
        logger.info('Image uploaded', { listingId, imageId: uploadedImage.listing_image_id, rank: i + 1 });
      }

      recordMetric('etsy.images.uploaded', uploadedImages.length, { listingId: String(listingId) });
      return uploadedImages;
    } catch (error: any) {
      logger.error('Failed to upload images', error, { listingId });
      trackError(error, { operation: 'uploadListingImages', listingId });
      throw error;
    }
  }

  /**
   * Update an existing listing
   */
  async updateListing(
    credentials: EtsyCredentials,
    listingId: number,
    updates: Partial<EtsyListingDraft>
  ): Promise<EtsyListing> {
    logger.info('Updating listing', { listingId });

    try {
      const data = await this.makeRequest<EtsyListing>({
        method: 'PATCH',
        endpoint: `/application/shops/${credentials.shopId}/listings/${listingId}`,
        credentials,
        body: updates,
      });

      logger.info('Listing updated successfully', { listingId });
      recordMetric('etsy.listing.updated', 1, { shopId: credentials.shopId });

      return data;
    } catch (error: any) {
      logger.error('Failed to update listing', error, { listingId });
      trackError(error, { operation: 'updateListing', listingId });
      throw error;
    }
  }

  /**
   * Delete a listing
   */
  async deleteListing(credentials: EtsyCredentials, listingId: number): Promise<void> {
    logger.info('Deleting listing', { listingId });

    try {
      await this.makeRequest({
        method: 'DELETE',
        endpoint: `/application/shops/${credentials.shopId}/listings/${listingId}`,
        credentials,
      });

      logger.info('Listing deleted successfully', { listingId });
      recordMetric('etsy.listing.deleted', 1, { shopId: credentials.shopId });
    } catch (error: any) {
      logger.error('Failed to delete listing', error, { listingId });
      trackError(error, { operation: 'deleteListing', listingId });
      throw error;
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Generate listing from template
   */
  async createListingFromTemplate(
    credentials: EtsyCredentials,
    templateId: string,
    templateData: TemplateData,
    listingData: Partial<EtsyListingDraft>,
    options?: {
      useAI?: boolean;
      aiProvider?: AIProvider;
      brandVoice?: string;
    }
  ): Promise<EtsyListing> {
    logger.info('Creating Etsy listing from template', { templateId });

    try {
      // Generate listing content from template
      const generated = options?.useAI
        ? await listingTemplates.renderTemplateWithAI(templateId, templateData, {
            aiProvider: options.aiProvider,
            enhanceTitle: true,
            enhanceDescription: true,
            generateTags: true,
            brandVoice: options.brandVoice,
          })
        : listingTemplates.renderTemplate(templateId, templateData);

      // Find appropriate taxonomy ID
      const taxonomyId = listingData.taxonomy_id ||
        (await this.findTaxonomyId(templateData.category || '')) ||
        1; // Default taxonomy

      // Build complete listing draft
      const completeListing: EtsyListingDraft = {
        title: generated.title,
        description: generated.description,
        tags: generated.tags || [],
        ...listingData,
        taxonomy_id: taxonomyId,
      };

      // Create the listing
      const listing = await this.createListing(credentials, completeListing);

      logger.info('Listing created from template successfully', {
        templateId,
        listingId: listing.listing_id,
      });

      recordMetric('etsy.template.listing_created', 1, {
        templateId,
        aiUsed: String(options?.useAI || false),
      });

      return listing;
    } catch (error: any) {
      logger.error('Failed to create listing from template', error, { templateId });
      trackError(error, { operation: 'createListingFromTemplate', templateId });
      throw error;
    }
  }

  /**
   * Create multiple listings in bulk with error handling
   */
  async createBulkListings(
    credentials: EtsyCredentials,
    listings: EtsyListingDraft[],
    options?: {
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<BulkListingResult[]> {
    logger.info('Starting bulk listing creation', { count: listings.length });

    const concurrency = options?.concurrency || 3;
    const results: BulkListingResult[] = [];
    let completed = 0;

    // Process in batches
    for (let i = 0; i < listings.length; i += concurrency) {
      const batch = listings.slice(i, i + concurrency);

      const batchResults = await Promise.allSettled(
        batch.map(listing => this.createListing(credentials, listing))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const listing = batch[j];

        if (result.status === 'fulfilled') {
          results.push({
            success: true,
            listing_id: result.value.listing_id,
            url: result.value.url,
            title: listing.title,
          });
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error',
            title: listing.title,
          });
        }

        completed++;
        options?.onProgress?.(completed, listings.length);
      }

      // Small delay between batches to avoid rate limiting
      if (i + concurrency < listings.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info('Bulk listing creation completed', {
      total: listings.length,
      successful: successCount,
      failed: listings.length - successCount,
    });

    recordMetric('etsy.bulk.create', results.length, {
      successful: String(successCount),
      failed: String(listings.length - successCount),
    });

    return results;
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Save connection credentials to database
   */
  async saveConnection(userId: string, credentials: EtsyCredentials): Promise<void> {
    logger.info('Saving Etsy connection', { userId, shopId: credentials.shopId });

    try {
      const [existing] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, 'etsy'));

      if (existing) {
        await db
          .update(platformConnections)
          .set({
            userId,
            credentials: {
              apiKey: credentials.apiKey,
              shopId: credentials.shopId,
            },
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            tokenExpiry: credentials.tokenExpiry,
            status: 'connected',
            errorMessage: null,
            updatedAt: new Date(),
          })
          .where(eq(platformConnections.id, existing.id));
      } else {
        await db
          .insert(platformConnections)
          .values({
            userId,
            platform: 'etsy',
            credentials: {
              apiKey: credentials.apiKey,
              shopId: credentials.shopId,
            },
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            tokenExpiry: credentials.tokenExpiry,
            status: 'connected',
          });
      }

      logger.info('Etsy connection saved successfully');
      recordMetric('etsy.connection.saved', 1, {});
    } catch (error: any) {
      logger.error('Failed to save Etsy connection', error);
      trackError(error, { operation: 'saveConnection', userId });
      throw error;
    }
  }

  /**
   * Get connection credentials from database
   */
  async getConnection(userId: string): Promise<EtsyCredentials | null> {
    try {
      const [connection] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, 'etsy'));

      if (!connection || connection.status !== 'connected') {
        return null;
      }

      return {
        apiKey: (connection.credentials as any)?.apiKey,
        accessToken: connection.accessToken || '',
        refreshToken: connection.refreshToken || '',
        tokenExpiry: connection.tokenExpiry || new Date(),
        shopId: (connection.credentials as any)?.shopId,
      };
    } catch (error: any) {
      logger.error('Failed to get Etsy connection', error);
      return null;
    }
  }
}

export const etsyConnector = new EtsyConnector();
