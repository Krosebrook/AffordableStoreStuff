/**
 * Amazon SP-API Connector
 *
 * Implements Amazon Selling Partner API integration for:
 * - Handmade products
 * - Kindle Direct Publishing (KDP) listings
 * - Product catalog management
 * - Category mapping and taxonomy
 * - OAuth 2.0 LWA (Login with Amazon) authentication
 *
 * Features:
 * - SP-API credential management
 * - Product listing creation and updates
 * - Category and browse node mapping
 * - Inventory synchronization
 * - Rate limiting compliance (variable by endpoint)
 * - Retry logic with exponential backoff
 * - Error handling and circuit breaker pattern
 */

import {
  createLogger,
  withRetry,
  CircuitBreaker,
  recordMetric,
  trackError,
} from '../lib/observability';
import { db } from '../db';
import { platformConnections } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { listingTemplates, type TemplateData } from './listing-templates';
import type { AIProvider } from './ai-service';

const logger = createLogger('AmazonConnector');

export interface AmazonCredentials {
  sellingPartnerId: string;
  marketplaceId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  tokenExpiry?: Date;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  roleArn?: string;
  region?: string;
}

export interface AmazonProduct {
  sku: string;
  productType: 'HANDMADE' | 'BOOK' | 'DIGITAL';
  condition?: 'New' | 'Used' | 'Collectible' | 'Refurbished';
  conditionNote?: string;

  // Product details
  title: string;
  description: string;
  bulletPoints?: string[];
  brand?: string;
  manufacturer?: string;

  // Categorization
  browseNodes?: string[];
  category?: string;
  subcategory?: string;
  productTypeDefinitions?: Record<string, any>;

  // Pricing
  price: number;
  salePrice?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;

  // Inventory
  quantity: number;
  fulfillmentChannel?: 'DEFAULT' | 'AMAZON_NA';

  // Images
  mainImageUrl: string;
  additionalImages?: string[];

  // Handmade specific
  isHandmade?: boolean;
  madeToOrder?: boolean;
  personalizationInstructions?: string;

  // KDP specific
  isKDP?: boolean;
  author?: string;
  isbn?: string;
  publicationDate?: Date;
  language?: string;
  numberOfPages?: number;

  // Search terms
  searchTerms?: string[];

  // Attributes (category-specific)
  attributes?: Record<string, any>;
}

export interface AmazonListingResult {
  success: boolean;
  sku: string;
  asin?: string;
  listingId?: string;
  errors?: AmazonError[];
  warnings?: AmazonWarning[];
}

export interface AmazonError {
  code: string;
  message: string;
  details?: string;
}

export interface AmazonWarning {
  code: string;
  message: string;
}

export interface AmazonBrowseNode {
  id: string;
  name: string;
  parentId?: string;
  path?: string[];
  refinements?: string[];
}

export interface AmazonCategoryMapping {
  internalCategory: string;
  browseNodeId: string;
  productType: string;
  requiredAttributes: string[];
  recommendedAttributes: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

class AmazonConnector {
  private readonly spApiBaseUrl = 'https://sellingpartnerapi-na.amazon.com';
  private readonly lwaBaseUrl = 'https://api.amazon.com/auth/o2/token';
  private circuitBreaker: CircuitBreaker;
  private rateLimitWindow: Map<string, { count: number; resetAt: number }> = new Map();

  // Rate limits vary by endpoint - these are conservative defaults
  private readonly defaultRateLimit = 10; // requests per second
  private readonly burstLimit = 20;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('amazon', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });
  }

  // ============================================================================
  // AUTHENTICATION & TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Generate authorization URL for OAuth flow
   */
  generateAuthUrl(params: {
    clientId: string;
    redirectUri: string;
    state: string;
  }): string {
    const scopes = [
      'sellingpartnerapi::migration',
      'sellingpartnerapi::notifications',
    ].join('%20');

    return `https://sellingcentral.amazon.com/apps/authorize/consent?application_id=${params.clientId}&redirect_uri=${encodeURIComponent(params.redirectUri)}&state=${params.state}&version=beta`;
  }

  /**
   * Exchange authorization code for refresh token
   */
  async exchangeCodeForToken(params: {
    clientId: string;
    clientSecret: string;
    code: string;
    redirectUri: string;
  }): Promise<TokenResponse> {
    logger.info('Exchanging authorization code for tokens');

    try {
      const response = await fetch(this.lwaBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: params.code,
          client_id: params.clientId,
          client_secret: params.clientSecret,
          redirect_uri: params.redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
      }

      const data = await response.json();
      logger.info('Tokens obtained successfully');
      recordMetric('amazon.oauth.success', 1, {});

      return data;
    } catch (error: any) {
      logger.error('OAuth token exchange failed', error);
      trackError(error, { operation: 'exchangeCodeForToken' });
      recordMetric('amazon.oauth.error', 1, {});
      throw error;
    }
  }

  /**
   * Get access token using refresh token (LWA token exchange)
   */
  async getAccessToken(credentials: AmazonCredentials): Promise<string> {
    // Check if we have a valid cached token
    if (credentials.accessToken && credentials.tokenExpiry) {
      const now = new Date();
      const expiry = new Date(credentials.tokenExpiry);

      // Refresh if token expires in less than 5 minutes
      if (expiry.getTime() - now.getTime() > 5 * 60 * 1000) {
        return credentials.accessToken;
      }
    }

    logger.info('Refreshing Amazon access token');

    try {
      const response = await fetch(this.lwaBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
      }

      const data = await response.json();
      const accessToken = data.access_token;
      const expiresIn = data.expires_in;

      // Update credentials in database
      const tokenExpiry = new Date(Date.now() + expiresIn * 1000);
      await this.updateStoredCredentials(credentials, accessToken, tokenExpiry);

      logger.info('Access token refreshed successfully');
      recordMetric('amazon.token.refresh.success', 1, {});

      return accessToken;
    } catch (error: any) {
      logger.error('Token refresh failed', error);
      trackError(error, { operation: 'getAccessToken' });
      recordMetric('amazon.token.refresh.error', 1, {});
      throw error;
    }
  }

  /**
   * Update stored credentials with new access token
   */
  private async updateStoredCredentials(
    credentials: AmazonCredentials,
    accessToken: string,
    tokenExpiry: Date
  ): Promise<void> {
    try {
      await db
        .update(platformConnections)
        .set({
          accessToken,
          tokenExpiry,
          updatedAt: new Date(),
        })
        .where(eq(platformConnections.platform, 'amazon'));
    } catch (error: any) {
      logger.warn('Failed to update stored credentials', { error: error.message });
    }
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  /**
   * Check and enforce rate limits
   */
  private async checkRateLimit(endpoint: string, limit: number = this.defaultRateLimit): Promise<void> {
    const key = `amazon_${endpoint}`;
    const now = Date.now();
    const window = this.rateLimitWindow.get(key);

    if (!window || now > window.resetAt) {
      this.rateLimitWindow.set(key, {
        count: 1,
        resetAt: now + 1000, // 1 second window
      });
      return;
    }

    if (window.count >= limit) {
      const waitTime = window.resetAt - now;
      logger.warn('Rate limit reached, waiting', { waitTime, endpoint });
      recordMetric('amazon.rate_limit.wait', 1, { endpoint });
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitWindow.set(key, {
        count: 1,
        resetAt: now + 1000,
      });
    } else {
      window.count++;
    }
  }

  // ============================================================================
  // API REQUEST SIGNING (AWS Signature Version 4)
  // ============================================================================

  /**
   * Generate AWS Signature Version 4 for SP-API requests
   */
  private generateSignature(params: {
    method: string;
    url: string;
    headers: Record<string, string>;
    payload: string;
    credentials: AmazonCredentials;
  }): Record<string, string> {
    const { method, url, headers, payload, credentials } = params;

    if (!credentials.awsAccessKeyId || !credentials.awsSecretAccessKey) {
      // If no AWS credentials, return headers as-is (for LWA-only authentication)
      return headers;
    }

    const region = credentials.region || 'us-east-1';
    const service = 'execute-api';
    const urlObj = new URL(url);

    // Create canonical request
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.slice(0, 8);

    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
      .join('\n');

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

    const canonicalRequest = [
      method,
      urlObj.pathname,
      urlObj.search.slice(1),
      canonicalHeaders,
      '',
      signedHeaders,
      payloadHash,
    ].join('\n');

    // Create string to sign
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${credentials.awsSecretAccessKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    // Add authorization header
    const authorization = `AWS4-HMAC-SHA256 Credential=${credentials.awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      ...headers,
      'Authorization': authorization,
      'x-amz-date': timestamp,
    };
  }

  // ============================================================================
  // API REQUESTS
  // ============================================================================

  /**
   * Make authenticated SP-API request with retry logic
   */
  private async makeRequest<T>(params: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
    credentials: AmazonCredentials;
    body?: any;
    queryParams?: Record<string, string>;
    rateLimit?: number;
  }): Promise<T> {
    await this.checkRateLimit(params.endpoint, params.rateLimit);

    return await this.circuitBreaker.execute(async () => {
      return await withRetry(
        async () => {
          // Get fresh access token
          const accessToken = await this.getAccessToken(params.credentials);

          // Build URL
          const url = new URL(`${this.spApiBaseUrl}${params.endpoint}`);
          if (params.queryParams) {
            Object.entries(params.queryParams).forEach(([key, value]) => {
              url.searchParams.append(key, value);
            });
          }

          // Build headers
          const headers: Record<string, string> = {
            'x-amz-access-token': accessToken,
            'Content-Type': 'application/json',
            'User-Agent': 'AffordableStoreStuff/1.0',
          };

          const payload = params.body ? JSON.stringify(params.body) : '';

          // Sign request if AWS credentials are available
          const signedHeaders = this.generateSignature({
            method: params.method,
            url: url.toString(),
            headers,
            payload,
            credentials: params.credentials,
          });

          const response = await fetch(url.toString(), {
            method: params.method,
            headers: signedHeaders,
            body: payload || undefined,
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
              const retryAfter = response.headers.get('x-amzn-RateLimit-Limit');
              const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
              logger.warn('Rate limited by Amazon API', { retryAfter, waitTime });
              await new Promise(resolve => setTimeout(resolve, waitTime));
              throw new Error('Rate limited - will retry');
            }

            // Handle quota exceeded
            if (response.status === 403 && errorData.code === 'QuotaExceeded') {
              throw new Error('Amazon API quota exceeded - cannot retry');
            }

            throw new Error(`Amazon API error: ${response.status} - ${errorData.message || errorText}`);
          }

          const data = await response.json();
          recordMetric('amazon.api.request', 1, { method: params.method, status: 'success' });
          return data;
        },
        {
          maxAttempts: 3,
          baseDelayMs: 1000,
          maxDelayMs: 10000,
          shouldRetry: (error) => {
            if (error.message?.includes('QuotaExceeded')) return false;
            return error.message?.includes('Rate limited') ||
                   error.message?.includes('ECONNRESET') ||
                   error.message?.includes('ETIMEDOUT') ||
                   error.message?.includes('503') ||
                   error.message?.includes('502');
          },
          onRetry: (error, attempt, delayMs) => {
            logger.warn('Retrying Amazon API request', { attempt, delayMs, error: error.message });
            recordMetric('amazon.api.retry', 1, { attempt: String(attempt) });
          },
        }
      );
    });
  }

  // ============================================================================
  // CATEGORY & BROWSE NODE MAPPING
  // ============================================================================

  /**
   * Get category tree for marketplace
   */
  async getCategoryTree(credentials: AmazonCredentials): Promise<AmazonBrowseNode[]> {
    logger.info('Fetching Amazon category tree');

    try {
      const data = await this.makeRequest<any>({
        method: 'GET',
        endpoint: `/catalog/2022-04-01/items/categories`,
        credentials,
        queryParams: {
          marketplaceIds: credentials.marketplaceId,
        },
      });

      logger.info('Category tree retrieved');
      return data.categories || [];
    } catch (error: any) {
      logger.error('Failed to fetch category tree', error);
      trackError(error, { operation: 'getCategoryTree' });
      throw error;
    }
  }

  /**
   * Map internal category to Amazon browse node
   */
  async mapCategoryToBrowseNode(
    category: string,
    productType: 'HANDMADE' | 'BOOK' | 'DIGITAL'
  ): Promise<AmazonCategoryMapping | null> {
    // Predefined mappings for common categories
    const handmadeMappings: Record<string, AmazonCategoryMapping> = {
      'jewelry': {
        internalCategory: 'jewelry',
        browseNodeId: '2516784011',
        productType: 'JEWELRY',
        requiredAttributes: ['material_type', 'target_gender'],
        recommendedAttributes: ['color', 'size'],
      },
      'clothing': {
        internalCategory: 'clothing',
        browseNodeId: '14324871',
        productType: 'SHIRTS',
        requiredAttributes: ['size_name', 'color_name'],
        recommendedAttributes: ['material_type', 'care_instructions'],
      },
      'home-decor': {
        internalCategory: 'home-decor',
        browseNodeId: '3733551',
        productType: 'HOME',
        requiredAttributes: ['item_dimensions'],
        recommendedAttributes: ['color', 'material_type'],
      },
      'art': {
        internalCategory: 'art',
        browseNodeId: '4991425011',
        productType: 'ART',
        requiredAttributes: ['item_dimensions'],
        recommendedAttributes: ['medium', 'subject'],
      },
    };

    const bookMappings: Record<string, AmazonCategoryMapping> = {
      'fiction': {
        internalCategory: 'fiction',
        browseNodeId: '17',
        productType: 'BOOK',
        requiredAttributes: ['author', 'binding', 'number_of_pages'],
        recommendedAttributes: ['publication_date', 'publisher'],
      },
      'non-fiction': {
        internalCategory: 'non-fiction',
        browseNodeId: '53',
        productType: 'BOOK',
        requiredAttributes: ['author', 'binding', 'number_of_pages'],
        recommendedAttributes: ['publication_date', 'publisher'],
      },
    };

    const mappings = productType === 'BOOK' ? bookMappings : handmadeMappings;
    const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    return mappings[normalizedCategory] || null;
  }

  /**
   * Search for product type definitions
   */
  async getProductTypeDefinitions(
    credentials: AmazonCredentials,
    productType: string
  ): Promise<any> {
    logger.info('Fetching product type definitions', { productType });

    try {
      const data = await this.makeRequest<any>({
        method: 'GET',
        endpoint: `/definitions/2020-09-01/productTypes/${productType}`,
        credentials,
        queryParams: {
          marketplaceIds: credentials.marketplaceId,
        },
      });

      logger.info('Product type definitions retrieved');
      return data.schema;
    } catch (error: any) {
      logger.error('Failed to fetch product type definitions', error);
      trackError(error, { operation: 'getProductTypeDefinitions', productType });
      throw error;
    }
  }

  // ============================================================================
  // LISTING MANAGEMENT
  // ============================================================================

  /**
   * Create or update product listing
   */
  async createListing(
    credentials: AmazonCredentials,
    product: AmazonProduct
  ): Promise<AmazonListingResult> {
    logger.info('Creating Amazon listing', { sku: product.sku });

    try {
      // Validate required fields
      if (!product.sku || !product.title || !product.price || !product.quantity) {
        throw new Error('Missing required fields: sku, title, price, quantity');
      }

      // Build product attributes based on product type
      const attributes = await this.buildProductAttributes(product, credentials);

      // Prepare listing payload
      const payload = {
        productType: product.productType,
        requirements: 'LISTING',
        attributes,
      };

      const data = await this.makeRequest<any>({
        method: 'PUT',
        endpoint: `/listings/2021-08-01/items/${credentials.sellingPartnerId}/${product.sku}`,
        credentials,
        queryParams: {
          marketplaceIds: credentials.marketplaceId,
        },
        body: payload,
        rateLimit: 5, // Listings API has stricter rate limit
      });

      logger.info('Listing created successfully', { sku: product.sku });
      recordMetric('amazon.listing.created', 1, {});

      return {
        success: true,
        sku: product.sku,
        asin: data.asin,
        listingId: data.listingId,
      };
    } catch (error: any) {
      logger.error('Failed to create listing', error, { sku: product.sku });
      trackError(error, { operation: 'createListing', sku: product.sku });
      recordMetric('amazon.listing.error', 1, {});

      return {
        success: false,
        sku: product.sku,
        errors: [{
          code: 'CREATE_FAILED',
          message: error.message,
        }],
      };
    }
  }

  /**
   * Build product attributes based on type and category
   */
  private async buildProductAttributes(
    product: AmazonProduct,
    credentials: AmazonCredentials
  ): Promise<Record<string, any>> {
    const attributes: Record<string, any> = {
      condition_type: [{ value: product.condition || 'New', marketplace_id: credentials.marketplaceId }],
      item_name: [{ value: product.title, marketplace_id: credentials.marketplaceId }],
      description: [{ value: product.description, marketplace_id: credentials.marketplaceId }],
      brand: [{ value: product.brand || 'Generic', marketplace_id: credentials.marketplaceId }],
      list_price: [{
        value: product.price,
        currency: 'USD',
        marketplace_id: credentials.marketplaceId,
      }],
      quantity: product.quantity,
      fulfillment_availability: [{
        fulfillment_channel_code: product.fulfillmentChannel || 'DEFAULT',
        quantity: product.quantity,
      }],
      main_product_image_locator: [{
        media_location: product.mainImageUrl,
        marketplace_id: credentials.marketplaceId,
      }],
    };

    // Add bullet points
    if (product.bulletPoints && product.bulletPoints.length > 0) {
      attributes.bullet_point = product.bulletPoints.map(point => ({
        value: point,
        marketplace_id: credentials.marketplaceId,
      }));
    }

    // Add additional images
    if (product.additionalImages && product.additionalImages.length > 0) {
      attributes.other_product_image_locator = product.additionalImages.map(url => ({
        media_location: url,
        marketplace_id: credentials.marketplaceId,
      }));
    }

    // Add search terms
    if (product.searchTerms && product.searchTerms.length > 0) {
      attributes.generic_keyword = product.searchTerms.map(term => ({
        value: term,
        marketplace_id: credentials.marketplaceId,
      }));
    }

    // Add handmade-specific attributes
    if (product.isHandmade) {
      attributes.is_handmade = [{ value: true, marketplace_id: credentials.marketplaceId }];

      if (product.madeToOrder) {
        attributes.is_customizable = [{ value: true, marketplace_id: credentials.marketplaceId }];
      }

      if (product.personalizationInstructions) {
        attributes.customization_description = [{
          value: product.personalizationInstructions,
          marketplace_id: credentials.marketplaceId,
        }];
      }
    }

    // Add KDP-specific attributes
    if (product.isKDP) {
      if (product.author) {
        attributes.author = [{ value: product.author, marketplace_id: credentials.marketplaceId }];
      }
      if (product.isbn) {
        attributes.external_product_id = [{
          external_product_id_type: 'ISBN',
          value: product.isbn,
          marketplace_id: credentials.marketplaceId,
        }];
      }
      if (product.publicationDate) {
        attributes.publication_date = [{
          value: product.publicationDate.toISOString().split('T')[0],
          marketplace_id: credentials.marketplaceId,
        }];
      }
      if (product.language) {
        attributes.language = [{ value: product.language, marketplace_id: credentials.marketplaceId }];
      }
      if (product.numberOfPages) {
        attributes.number_of_pages = [{ value: product.numberOfPages, marketplace_id: credentials.marketplaceId }];
      }
    }

    // Add browse nodes
    if (product.browseNodes && product.browseNodes.length > 0) {
      attributes.recommended_browse_nodes = product.browseNodes.map(node => ({
        value: node,
        marketplace_id: credentials.marketplaceId,
      }));
    }

    // Merge custom attributes
    if (product.attributes) {
      Object.entries(product.attributes).forEach(([key, value]) => {
        attributes[key] = Array.isArray(value)
          ? value.map(v => ({ value: v, marketplace_id: credentials.marketplaceId }))
          : [{ value, marketplace_id: credentials.marketplaceId }];
      });
    }

    return attributes;
  }

  /**
   * Get listing details
   */
  async getListing(credentials: AmazonCredentials, sku: string): Promise<any> {
    logger.info('Fetching listing details', { sku });

    try {
      const data = await this.makeRequest<any>({
        method: 'GET',
        endpoint: `/listings/2021-08-01/items/${credentials.sellingPartnerId}/${sku}`,
        credentials,
        queryParams: {
          marketplaceIds: credentials.marketplaceId,
        },
        rateLimit: 5,
      });

      logger.info('Listing details retrieved', { sku });
      return data;
    } catch (error: any) {
      logger.error('Failed to fetch listing', error, { sku });
      trackError(error, { operation: 'getListing', sku });
      throw error;
    }
  }

  /**
   * Update listing inventory
   */
  async updateInventory(
    credentials: AmazonCredentials,
    sku: string,
    quantity: number
  ): Promise<AmazonListingResult> {
    logger.info('Updating listing inventory', { sku, quantity });

    try {
      const payload = {
        productType: 'PRODUCT',
        patches: [{
          op: 'replace',
          path: '/attributes/fulfillment_availability',
          value: [{
            fulfillment_channel_code: 'DEFAULT',
            quantity,
          }],
        }],
      };

      await this.makeRequest<any>({
        method: 'PATCH',
        endpoint: `/listings/2021-08-01/items/${credentials.sellingPartnerId}/${sku}`,
        credentials,
        queryParams: {
          marketplaceIds: credentials.marketplaceId,
        },
        body: payload,
        rateLimit: 5,
      });

      logger.info('Inventory updated successfully', { sku, quantity });
      recordMetric('amazon.inventory.updated', 1, {});

      return {
        success: true,
        sku,
      };
    } catch (error: any) {
      logger.error('Failed to update inventory', error, { sku });
      trackError(error, { operation: 'updateInventory', sku });

      return {
        success: false,
        sku,
        errors: [{
          code: 'INVENTORY_UPDATE_FAILED',
          message: error.message,
        }],
      };
    }
  }

  /**
   * Delete listing
   */
  async deleteListing(credentials: AmazonCredentials, sku: string): Promise<AmazonListingResult> {
    logger.info('Deleting listing', { sku });

    try {
      await this.makeRequest<any>({
        method: 'DELETE',
        endpoint: `/listings/2021-08-01/items/${credentials.sellingPartnerId}/${sku}`,
        credentials,
        queryParams: {
          marketplaceIds: credentials.marketplaceId,
        },
        rateLimit: 5,
      });

      logger.info('Listing deleted successfully', { sku });
      recordMetric('amazon.listing.deleted', 1, {});

      return {
        success: true,
        sku,
      };
    } catch (error: any) {
      logger.error('Failed to delete listing', error, { sku });
      trackError(error, { operation: 'deleteListing', sku });

      return {
        success: false,
        sku,
        errors: [{
          code: 'DELETE_FAILED',
          message: error.message,
        }],
      };
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Create listing from template
   */
  async createListingFromTemplate(
    credentials: AmazonCredentials,
    templateId: string,
    templateData: TemplateData,
    productData: Partial<AmazonProduct>,
    options?: {
      useAI?: boolean;
      aiProvider?: AIProvider;
      brandVoice?: string;
    }
  ): Promise<AmazonListingResult> {
    logger.info('Creating Amazon listing from template', { templateId });

    try {
      // Generate listing content from template
      const generated = options?.useAI
        ? await listingTemplates.renderTemplateWithAI(templateId, templateData, {
            aiProvider: options.aiProvider,
            enhanceTitle: true,
            enhanceDescription: true,
            brandVoice: options.brandVoice,
          })
        : listingTemplates.renderTemplate(templateId, templateData);

      // Map category to browse node
      const categoryMapping = await this.mapCategoryToBrowseNode(
        templateData.category || '',
        productData.productType || 'HANDMADE'
      );

      // Build complete product
      const completeProduct: AmazonProduct = {
        sku: productData.sku || `AMZN-${Date.now()}`,
        productType: productData.productType || 'HANDMADE',
        title: generated.title,
        description: generated.description,
        bulletPoints: generated.bulletPoints,
        searchTerms: generated.tags,
        browseNodes: categoryMapping ? [categoryMapping.browseNodeId] : undefined,
        ...productData,
      };

      // Create the listing
      const result = await this.createListing(credentials, completeProduct);

      logger.info('Listing created from template successfully', {
        templateId,
        sku: completeProduct.sku,
      });

      recordMetric('amazon.template.listing_created', 1, {
        templateId,
        aiUsed: String(options?.useAI || false),
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to create listing from template', error, { templateId });
      trackError(error, { operation: 'createListingFromTemplate', templateId });

      return {
        success: false,
        sku: productData.sku || 'unknown',
        errors: [{
          code: 'TEMPLATE_CREATE_FAILED',
          message: error.message,
        }],
      };
    }
  }

  /**
   * Create multiple listings in bulk
   */
  async createBulkListings(
    credentials: AmazonCredentials,
    products: AmazonProduct[],
    options?: {
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<AmazonListingResult[]> {
    logger.info('Starting bulk listing creation', { count: products.length });

    const concurrency = options?.concurrency || 2; // Conservative for Amazon
    const results: AmazonListingResult[] = [];
    let completed = 0;

    for (let i = 0; i < products.length; i += concurrency) {
      const batch = products.slice(i, i + concurrency);

      const batchResults = await Promise.allSettled(
        batch.map(product => this.createListing(credentials, product))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];

        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const product = batch[j];
          results.push({
            success: false,
            sku: product.sku,
            errors: [{
              code: 'BULK_CREATE_FAILED',
              message: result.reason?.message || 'Unknown error',
            }],
          });
        }

        completed++;
        options?.onProgress?.(completed, products.length);
      }

      // Delay between batches
      if (i + concurrency < products.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info('Bulk listing creation completed', {
      total: products.length,
      successful: successCount,
      failed: products.length - successCount,
    });

    recordMetric('amazon.bulk.create', results.length, {
      successful: String(successCount),
      failed: String(products.length - successCount),
    });

    return results;
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Save connection credentials to database
   */
  async saveConnection(userId: string, credentials: AmazonCredentials): Promise<void> {
    logger.info('Saving Amazon connection', { userId, marketplaceId: credentials.marketplaceId });

    try {
      const [existing] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, 'amazon'));

      const credentialsData = {
        sellingPartnerId: credentials.sellingPartnerId,
        marketplaceId: credentials.marketplaceId,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        awsAccessKeyId: credentials.awsAccessKeyId,
        awsSecretAccessKey: credentials.awsSecretAccessKey,
        roleArn: credentials.roleArn,
        region: credentials.region,
      };

      if (existing) {
        await db
          .update(platformConnections)
          .set({
            userId,
            credentials: credentialsData,
            refreshToken: credentials.refreshToken,
            accessToken: credentials.accessToken,
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
            platform: 'amazon',
            credentials: credentialsData,
            refreshToken: credentials.refreshToken,
            accessToken: credentials.accessToken,
            tokenExpiry: credentials.tokenExpiry,
            status: 'connected',
          });
      }

      logger.info('Amazon connection saved successfully');
      recordMetric('amazon.connection.saved', 1, {});
    } catch (error: any) {
      logger.error('Failed to save Amazon connection', error);
      trackError(error, { operation: 'saveConnection', userId });
      throw error;
    }
  }

  /**
   * Get connection credentials from database
   */
  async getConnection(userId: string): Promise<AmazonCredentials | null> {
    try {
      const [connection] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, 'amazon'));

      if (!connection || connection.status !== 'connected') {
        return null;
      }

      const creds = connection.credentials as any;

      return {
        sellingPartnerId: creds.sellingPartnerId,
        marketplaceId: creds.marketplaceId,
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        refreshToken: connection.refreshToken || '',
        accessToken: connection.accessToken || undefined,
        tokenExpiry: connection.tokenExpiry || undefined,
        awsAccessKeyId: creds.awsAccessKeyId,
        awsSecretAccessKey: creds.awsSecretAccessKey,
        roleArn: creds.roleArn,
        region: creds.region || 'us-east-1',
      };
    } catch (error: any) {
      logger.error('Failed to get Amazon connection', error);
      return null;
    }
  }

  /**
   * Test connection
   */
  async testConnection(credentials: AmazonCredentials): Promise<{ success: boolean; message: string }> {
    try {
      // Test by getting seller account info
      const data = await this.makeRequest<any>({
        method: 'GET',
        endpoint: '/sellers/v1/marketplaceParticipations',
        credentials,
      });

      logger.info('Amazon connection test successful');
      recordMetric('amazon.connection.test', 1, { success: 'true' });

      return {
        success: true,
        message: `Connected to Amazon marketplace: ${credentials.marketplaceId}`,
      };
    } catch (error: any) {
      logger.error('Amazon connection test failed', error);
      trackError(error, { operation: 'testConnection' });
      recordMetric('amazon.connection.test', 1, { success: 'false' });

      return {
        success: false,
        message: error.message || 'Connection test failed',
      };
    }
  }
}

export const amazonConnector = new AmazonConnector();
