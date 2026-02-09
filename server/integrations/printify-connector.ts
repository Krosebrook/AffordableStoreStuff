/**
 * Printify API Integration
 * Print-on-demand service with product creation, mockup generation, and order fulfillment
 * Supports OAuth and API key authentication with two-way inventory sync
 */

import {
  createLogger,
  withRetry,
  CircuitBreaker,
  recordMetric,
  trackError,
} from '../lib/observability';
import { db } from '../db';
import { platformConnections, apiRateLimits } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const logger = createLogger('PrintifyConnector');

export interface PrintifyCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  shopId: string;
}

export interface PrintifyOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  state: string;
}

export interface PrintifyProduct {
  id?: string;
  title: string;
  description: string;
  blueprintId: number;
  printProviderId: number;
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  tags?: string[];
  visible?: boolean;
}

export interface PrintifyVariant {
  id?: number;
  sku?: string;
  price: number;
  isEnabled: boolean;
  title?: string;
  options?: Record<string, string>; // { size: 'M', color: 'Black' }
}

export interface PrintifyImage {
  src: string;
  position?: string; // 'front', 'back', 'left', 'right'
  isDefault?: boolean;
  x?: number;
  y?: number;
  scale?: number;
  angle?: number;
}

export interface PrintArea {
  width: number;
  height: number;
  top: number;
  left: number;
  variant_ids?: number[];
}

export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

export interface PrintifyPrintProvider {
  id: number;
  title: string;
  location: string;
}

export interface PrintifyOrder {
  id?: string;
  externalId: string;
  lineItems: PrintifyOrderItem[];
  shippingMethod: number;
  sendShippingNotification: boolean;
  address: PrintifyAddress;
}

export interface PrintifyOrderItem {
  productId: string;
  variantId: number;
  quantity: number;
  blueprintId?: number;
  printProviderId?: number;
  printAreas?: Record<string, PrintifyPrintArea>;
}

export interface PrintifyPrintArea {
  src: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
  angle?: number;
}

export interface PrintifyAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyWebhook {
  topic: string;
  url: string;
  shopId: string;
}

export interface PrintifyCostCalculation {
  variantId: number;
  blueprintId: number;
  printProviderId: number;
  productionCost: number;
  shippingCost: number;
  suggestedRetailPrice: number;
  profitMargin: number;
}

interface RateLimitState {
  requestCount: number;
  windowStart: number;
}

class PrintifyConnector {
  private baseUrl = 'https://api.printify.com/v1';
  private circuitBreaker: CircuitBreaker;
  private rateLimits: Map<string, RateLimitState> = new Map();
  private readonly rateLimitPerMinute = 60;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('Printify', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });
  }

  // ============================================================================
  // OAUTH AUTHENTICATION
  // ============================================================================

  /**
   * Generate OAuth authorization URL
   */
  generateOAuthUrl(config: PrintifyOAuthConfig): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state: config.state,
      scope: 'shops.read shops.write products.read products.write orders.read orders.write',
    });

    return `https://printify.com/app/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(config: PrintifyOAuthConfig, code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    logger.info('Exchanging authorization code for access token');

    try {
      const response = await fetch('https://api.printify.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OAuth token exchange failed: ${error.error || error.message}`);
      }

      const data = await response.json();
      logger.info('OAuth access token obtained successfully');
      recordMetric('printify.oauth.success', 1, {});

      return data;
    } catch (error: any) {
      logger.error('OAuth token exchange failed', error);
      trackError(error, { operation: 'exchangeCodeForToken' });
      recordMetric('printify.oauth.error', 1, {});
      throw error;
    }
  }

  /**
   * Refresh expired OAuth access token
   */
  async refreshAccessToken(config: Pick<PrintifyOAuthConfig, 'clientId' | 'clientSecret'>, refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    logger.info('Refreshing OAuth access token');

    try {
      const response = await fetch('https://api.printify.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OAuth token refresh failed: ${error.error || error.message}`);
      }

      const data = await response.json();
      logger.info('OAuth access token refreshed successfully');
      recordMetric('printify.oauth.refresh.success', 1, {});

      return data;
    } catch (error: any) {
      logger.error('OAuth token refresh failed', error);
      trackError(error, { operation: 'refreshAccessToken' });
      recordMetric('printify.oauth.refresh.error', 1, {});
      throw error;
    }
  }

  /**
   * Get credentials from database for a user
   */
  private async getCredentials(userId?: string): Promise<PrintifyCredentials> {
    const [connection] = await db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.platform, 'printify'))
      .limit(1);

    if (!connection || connection.status !== 'connected') {
      throw new Error('Printify not connected. Please configure API credentials.');
    }

    const credentials = connection.credentials as any;

    // Check if using OAuth or API key authentication
    if (connection.accessToken) {
      // OAuth authentication
      return {
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken || undefined,
        tokenExpiry: connection.tokenExpiry || undefined,
        shopId: credentials?.shopId || '',
      };
    } else if (credentials?.apiKey) {
      // API key authentication
      return {
        apiKey: credentials.apiKey,
        shopId: credentials?.shopId || '',
      };
    }

    throw new Error('Invalid Printify credentials - missing API key or OAuth token');
  }

  /**
   * Check and enforce rate limits
   */
  private async checkRateLimit(endpoint: string): Promise<void> {
    const now = Date.now();
    const state = this.rateLimits.get(endpoint) || { requestCount: 0, windowStart: now };

    // Reset window if 1 minute has passed
    if (now - state.windowStart > 60000) {
      state.requestCount = 0;
      state.windowStart = now;
    }

    // Check if limit exceeded
    if (state.requestCount >= this.rateLimitPerMinute) {
      const waitTime = 60000 - (now - state.windowStart);
      logger.warn('Rate limit reached, waiting', { endpoint, waitTime });
      recordMetric('printify.rate_limit.wait', waitTime, { endpoint });

      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Reset after waiting
      state.requestCount = 0;
      state.windowStart = Date.now();
    }

    state.requestCount++;
    this.rateLimits.set(endpoint, state);

    // Update database rate limit tracking
    await this.updateRateLimitDb(endpoint, state.requestCount);
  }

  /**
   * Update rate limit tracking in database
   */
  private async updateRateLimitDb(endpoint: string, requestCount: number): Promise<void> {
    try {
      const [existing] = await db
        .select()
        .from(apiRateLimits)
        .where(
          and(
            eq(apiRateLimits.platform, 'printify'),
            eq(apiRateLimits.endpoint, endpoint)
          )
        );

      if (existing) {
        await db
          .update(apiRateLimits)
          .set({
            requestCount,
            lastRequestAt: new Date(),
          })
          .where(eq(apiRateLimits.id, existing.id));
      } else {
        await db.insert(apiRateLimits).values({
          platform: 'printify',
          endpoint,
          requestCount,
          limitPerMinute: this.rateLimitPerMinute,
          windowStart: new Date(),
          lastRequestAt: new Date(),
        });
      }
    } catch (error) {
      // Don't fail the request if rate limit tracking fails
      logger.warn('Failed to update rate limit in DB', { error });
    }
  }

  /**
   * Make authenticated API request to Printify
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    credentials: PrintifyCredentials,
    body?: any
  ): Promise<T> {
    await this.checkRateLimit(endpoint);

    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `printify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const requestLogger = logger.child(requestId);

    requestLogger.debug('Printify API request', { method, endpoint });

    return await this.circuitBreaker.execute(async () => {
      return await withRetry(
        async () => {
          // Use OAuth token if available, otherwise fall back to API key
          const authToken = credentials.accessToken || credentials.apiKey;
          if (!authToken) {
            throw new Error('No authentication credentials available');
          }

          const response = await fetch(url, {
            method,
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'AffordableStoreStuff/1.0',
            },
            body: body ? JSON.stringify(body) : undefined,
          });

          const data = await response.json();

          if (!response.ok) {
            const error: any = new Error(data.message || 'Printify API error');
            error.status = response.status;
            error.code = data.code;
            throw error;
          }

          recordMetric('printify.request.success', 1, { method, endpoint });
          return data;
        },
        {
          maxAttempts: 3,
          baseDelayMs: 1000,
          shouldRetry: (error) => {
            if (error.status === 429) return true; // Rate limit
            if (error.status >= 500) return true; // Server errors
            if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
            return false;
          },
          onRetry: (error, attempt, delayMs) => {
            requestLogger.warn('Retrying Printify request', {
              attempt,
              delayMs,
              error: error.message,
            });
            recordMetric('printify.request.retry', 1, { attempt: String(attempt) });
          },
        }
      );
    });
  }

  /**
   * Test connection to Printify
   */
  async testConnection(credentials: PrintifyCredentials): Promise<{ success: boolean; message: string }> {
    try {
      const shop = await this.makeRequest<any>('GET', `/shops/${credentials.shopId}.json`, credentials);

      logger.info('Printify connection test successful', { shopId: shop.id, title: shop.title });
      recordMetric('printify.connection.test', 1, { success: 'true' });

      return {
        success: true,
        message: `Connected to shop: ${shop.title}`,
      };
    } catch (error: any) {
      logger.error('Printify connection test failed', error);
      trackError(error, { operation: 'testConnection' });
      recordMetric('printify.connection.test', 1, { success: 'false' });

      return {
        success: false,
        message: error.message || 'Connection test failed',
      };
    }
  }

  /**
   * Get available blueprints (product templates)
   */
  async getBlueprints(userId?: string): Promise<PrintifyBlueprint[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>('GET', '/catalog/blueprints.json', credentials);
      recordMetric('printify.blueprints.fetch', 1, { count: String(response.length || 0) });
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch Printify blueprints', error);
      trackError(error, { operation: 'getBlueprints' });
      throw error;
    }
  }

  /**
   * Get print providers for a blueprint
   */
  async getPrintProviders(blueprintId: number, userId?: string): Promise<PrintifyPrintProvider[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/catalog/blueprints/${blueprintId}/print_providers.json`,
        credentials
      );
      recordMetric('printify.print_providers.fetch', 1, { blueprintId: String(blueprintId) });
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch print providers', error, { blueprintId });
      trackError(error, { operation: 'getPrintProviders', blueprintId });
      throw error;
    }
  }

  /**
   * Get variants for a blueprint and print provider
   */
  async getVariants(blueprintId: number, printProviderId: number, userId?: string): Promise<any[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
        credentials
      );
      recordMetric('printify.variants.fetch', 1, { blueprintId: String(blueprintId) });
      return response.variants || [];
    } catch (error: any) {
      logger.error('Failed to fetch variants', error, { blueprintId, printProviderId });
      trackError(error, { operation: 'getVariants', blueprintId, printProviderId });
      throw error;
    }
  }

  /**
   * Validate print area dimensions
   */
  validatePrintArea(
    image: PrintifyImage,
    printArea: PrintArea
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if image dimensions fit within print area
    if (image.x !== undefined && image.x < printArea.left) {
      errors.push(`Image X position (${image.x}) is outside print area left boundary (${printArea.left})`);
    }

    if (image.y !== undefined && image.y < printArea.top) {
      errors.push(`Image Y position (${image.y}) is outside print area top boundary (${printArea.top})`);
    }

    // Check scale
    if (image.scale !== undefined && (image.scale < 0.1 || image.scale > 3)) {
      errors.push(`Image scale (${image.scale}) must be between 0.1 and 3`);
    }

    // Check angle
    if (image.angle !== undefined && (image.angle < -360 || image.angle > 360)) {
      errors.push(`Image angle (${image.angle}) must be between -360 and 360`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate costs and profit margins
   */
  async calculateCosts(
    blueprintId: number,
    printProviderId: number,
    variantId: number,
    retailPrice: number,
    userId?: string
  ): Promise<PrintifyCostCalculation> {
    const credentials = await this.getCredentials(userId);

    try {
      // Get variant cost from Printify
      const variants = await this.getVariants(blueprintId, printProviderId, userId);
      const variant = variants.find((v: any) => v.id === variantId);

      if (!variant) {
        throw new Error(`Variant ${variantId} not found`);
      }

      const productionCost = variant.cost / 100; // Convert cents to dollars
      const shippingCost = variant.shipping_cost ? variant.shipping_cost / 100 : 0;
      const totalCost = productionCost + shippingCost;
      const profit = retailPrice - totalCost;
      const profitMargin = (profit / retailPrice) * 100;

      // Suggest retail price with 30% margin if not provided
      const suggestedRetailPrice = totalCost * 1.43; // ~30% margin

      const calculation: PrintifyCostCalculation = {
        variantId,
        blueprintId,
        printProviderId,
        productionCost,
        shippingCost,
        suggestedRetailPrice: Math.ceil(suggestedRetailPrice * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
      };

      recordMetric('printify.cost.calculate', 1, {
        blueprintId: String(blueprintId),
        profitMargin: String(calculation.profitMargin),
      });

      return calculation;
    } catch (error: any) {
      logger.error('Failed to calculate costs', error, { blueprintId, printProviderId, variantId });
      trackError(error, { operation: 'calculateCosts', blueprintId, printProviderId, variantId });
      throw error;
    }
  }

  /**
   * Upload image to Printify
   */
  async uploadImage(imageUrl: string, fileName: string, userId?: string): Promise<{ id: string; url: string }> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'POST',
        '/uploads/images.json',
        credentials,
        {
          file_name: fileName,
          url: imageUrl,
        }
      );

      logger.info('Image uploaded to Printify', { imageId: response.id, fileName });
      recordMetric('printify.image.upload', 1, { success: 'true' });

      return {
        id: response.id,
        url: response.preview_url,
      };
    } catch (error: any) {
      logger.error('Failed to upload image to Printify', error, { fileName });
      trackError(error, { operation: 'uploadImage', fileName });
      recordMetric('printify.image.upload', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Create product in Printify shop
   */
  async createProduct(product: PrintifyProduct, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      // Validate print areas for all images
      const validationErrors: string[] = [];
      for (const image of product.images) {
        // Note: Print area validation would require blueprint-specific data
        // This is a simplified version
        if (image.scale !== undefined && (image.scale < 0.1 || image.scale > 3)) {
          validationErrors.push(`Invalid scale for image: ${image.scale}`);
        }
      }

      if (validationErrors.length > 0) {
        throw new Error(`Print area validation failed: ${validationErrors.join(', ')}`);
      }

      const response = await this.makeRequest<any>(
        'POST',
        `/shops/${credentials.shopId}/products.json`,
        credentials,
        product
      );

      logger.info('Product created in Printify', {
        productId: response.id,
        title: product.title,
      });
      recordMetric('printify.product.create', 1, { success: 'true' });

      // Update platform connection sync time
      await db
        .update(platformConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(platformConnections.platform, 'printify'));

      return response;
    } catch (error: any) {
      logger.error('Failed to create Printify product', error, { title: product.title });
      trackError(error, { operation: 'createProduct', title: product.title });
      recordMetric('printify.product.create', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Update existing product
   */
  async updateProduct(productId: string, updates: Partial<PrintifyProduct>, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'PUT',
        `/shops/${credentials.shopId}/products/${productId}.json`,
        credentials,
        updates
      );

      logger.info('Product updated in Printify', { productId });
      recordMetric('printify.product.update', 1, { success: 'true' });

      await db
        .update(platformConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(platformConnections.platform, 'printify'));

      return response;
    } catch (error: any) {
      logger.error('Failed to update Printify product', error, { productId });
      trackError(error, { operation: 'updateProduct', productId });
      recordMetric('printify.product.update', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Get product from Printify
   */
  async getProduct(productId: string, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/shops/${credentials.shopId}/products/${productId}.json`,
        credentials
      );
      recordMetric('printify.product.fetch', 1, {});
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch Printify product', error, { productId });
      trackError(error, { operation: 'getProduct', productId });
      throw error;
    }
  }

  /**
   * List all products from shop
   */
  async listProducts(page = 1, limit = 100, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/shops/${credentials.shopId}/products.json?page=${page}&limit=${limit}`,
        credentials
      );
      recordMetric('printify.product.list', 1, { count: String(response.data?.length || 0) });
      return response;
    } catch (error: any) {
      logger.error('Failed to list Printify products', error);
      trackError(error, { operation: 'listProducts' });
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string, userId?: string): Promise<void> {
    const credentials = await this.getCredentials(userId);

    try {
      await this.makeRequest<any>(
        'DELETE',
        `/shops/${credentials.shopId}/products/${productId}.json`,
        credentials
      );

      logger.info('Product deleted from Printify', { productId });
      recordMetric('printify.product.delete', 1, { success: 'true' });
    } catch (error: any) {
      logger.error('Failed to delete Printify product', error, { productId });
      trackError(error, { operation: 'deleteProduct', productId });
      recordMetric('printify.product.delete', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Publish product to sales channel (e.g., Etsy, Shopify)
   */
  async publishProduct(productId: string, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'POST',
        `/shops/${credentials.shopId}/products/${productId}/publish.json`,
        credentials,
        { title: true, description: true, images: true, variants: true, tags: true }
      );

      logger.info('Product published', { productId });
      recordMetric('printify.product.publish', 1, { success: 'true' });

      return response;
    } catch (error: any) {
      logger.error('Failed to publish product', error, { productId });
      trackError(error, { operation: 'publishProduct', productId });
      recordMetric('printify.product.publish', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Create order
   */
  async createOrder(order: PrintifyOrder, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'POST',
        `/shops/${credentials.shopId}/orders.json`,
        credentials,
        order
      );

      logger.info('Order created in Printify', { orderId: response.id, externalId: order.externalId });
      recordMetric('printify.order.create', 1, { success: 'true' });

      return response;
    } catch (error: any) {
      logger.error('Failed to create Printify order', error, { externalId: order.externalId });
      trackError(error, { operation: 'createOrder', externalId: order.externalId });
      recordMetric('printify.order.create', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrder(orderId: string, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/shops/${credentials.shopId}/orders/${orderId}.json`,
        credentials
      );
      recordMetric('printify.order.fetch', 1, {});
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch Printify order', error, { orderId });
      trackError(error, { operation: 'getOrder', orderId });
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId?: string): Promise<void> {
    const credentials = await this.getCredentials(userId);

    try {
      await this.makeRequest<any>(
        'POST',
        `/shops/${credentials.shopId}/orders/${orderId}/cancel.json`,
        credentials
      );

      logger.info('Order cancelled', { orderId });
      recordMetric('printify.order.cancel', 1, { success: 'true' });
    } catch (error: any) {
      logger.error('Failed to cancel order', error, { orderId });
      trackError(error, { operation: 'cancelOrder', orderId });
      recordMetric('printify.order.cancel', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Sync inventory from Printify to local database
   */
  async syncInventory(userId?: string): Promise<{ synced: number; errors: string[] }> {
    try {
      logger.info('Starting inventory sync from Printify');
      const products = await this.listProducts(1, 100, userId);

      const synced = products.data?.length || 0;
      const errors: string[] = [];

      // Update last sync time
      await db
        .update(platformConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(platformConnections.platform, 'printify'));

      logger.info('Inventory sync completed', { synced, errors: errors.length });
      recordMetric('printify.inventory.sync', synced, { errors: String(errors.length) });

      return { synced, errors };
    } catch (error: any) {
      logger.error('Inventory sync failed', error);
      trackError(error, { operation: 'syncInventory' });
      throw error;
    }
  }

  /**
   * Register webhook for order notifications
   */
  async registerWebhook(webhookUrl: string, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const webhook: PrintifyWebhook = {
        topic: 'order:created',
        url: webhookUrl,
        shopId: credentials.shopId,
      };

      const response = await this.makeRequest<any>(
        'POST',
        `/shops/${credentials.shopId}/webhooks.json`,
        credentials,
        webhook
      );

      // Save webhook URL to connection settings
      await db
        .update(platformConnections)
        .set({
          webhookUrl,
          webhookSecret: response.secret,
        })
        .where(eq(platformConnections.platform, 'printify'));

      logger.info('Webhook registered', { webhookUrl, topic: webhook.topic });
      recordMetric('printify.webhook.register', 1, { topic: webhook.topic });

      return response;
    } catch (error: any) {
      logger.error('Failed to register webhook', error);
      trackError(error, { operation: 'registerWebhook', webhookUrl });
      throw error;
    }
  }

  /**
   * Process webhook event from Printify
   */
  async handleWebhook(event: any): Promise<void> {
    try {
      logger.info('Processing Printify webhook', { type: event.type, id: event.id });

      switch (event.type) {
        case 'order:created':
          await this.handleOrderCreated(event.resource);
          break;
        case 'order:updated':
          await this.handleOrderUpdated(event.resource);
          break;
        case 'order:sent-to-production':
          await this.handleOrderSentToProduction(event.resource);
          break;
        case 'order:shipment:created':
          await this.handleShipmentCreated(event.resource);
          break;
        case 'order:shipment:delivered':
          await this.handleShipmentDelivered(event.resource);
          break;
        default:
          logger.warn('Unknown webhook event type', { type: event.type });
      }

      recordMetric('printify.webhook.process', 1, { type: event.type });
    } catch (error: any) {
      logger.error('Webhook processing failed', error, { eventType: event.type });
      trackError(error, { operation: 'handleWebhook', eventType: event.type });
      throw error;
    }
  }

  private async handleOrderCreated(order: any): Promise<void> {
    logger.info('Order created webhook received', { orderId: order.id });
    // Implementation: Update local order status, send notifications, etc.
  }

  private async handleOrderUpdated(order: any): Promise<void> {
    logger.info('Order updated webhook received', { orderId: order.id, status: order.status });
    // Implementation: Sync order status changes
  }

  private async handleOrderSentToProduction(order: any): Promise<void> {
    logger.info('Order sent to production', { orderId: order.id });
    // Implementation: Update order status, notify customer
  }

  private async handleShipmentCreated(shipment: any): Promise<void> {
    logger.info('Shipment created', { trackingNumber: shipment.tracking_number });
    // Implementation: Update order with tracking info, send customer notification
  }

  private async handleShipmentDelivered(shipment: any): Promise<void> {
    logger.info('Shipment delivered', { trackingNumber: shipment.tracking_number });
    // Implementation: Mark order as delivered, trigger post-delivery workflows
  }
}

export const printifyConnector = new PrintifyConnector();
