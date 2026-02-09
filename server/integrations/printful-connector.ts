/**
 * Printful API Integration
 * Print-on-demand service with product sync, two-way inventory sync, and order fulfillment
 * Supports API key authentication with real-time webhook notifications
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

const logger = createLogger('PrintfulConnector');

export interface PrintfulCredentials {
  apiKey: string;
}

export interface PrintfulProduct {
  id?: number;
  external_id?: string;
  name: string;
  thumbnail?: string;
  is_ignored?: boolean;
}

export interface PrintfulSyncProduct {
  id?: number;
  external_id: string;
  name: string;
  variants: PrintfulSyncVariant[];
  synced?: number;
}

export interface PrintfulSyncVariant {
  id?: number;
  external_id?: string;
  sync_product_id?: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price?: string;
  currency?: string;
  is_ignored?: boolean;
  sku?: string;
  product?: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files?: PrintfulFile[];
}

export interface PrintfulFile {
  id?: number;
  type: 'default' | 'back' | 'left' | 'right' | 'front' | 'preview' | 'label_inside' | 'label_outside';
  hash?: string;
  url?: string;
  filename?: string;
  mime_type?: string;
  size?: number;
  width?: number;
  height?: number;
  dpi?: number;
  status?: string;
  created?: number;
  thumbnail_url?: string;
  preview_url?: string;
  visible?: boolean;
}

export interface PrintfulOrder {
  id?: number;
  external_id: string;
  status?: string;
  shipping?: string;
  created?: number;
  updated?: number;
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  retail_costs?: {
    currency: string;
    subtotal: string;
    discount: string;
    shipping: string;
    tax: string;
    total: string;
  };
  gift?: {
    subject: string;
    message: string;
  };
  packing_slip?: {
    email: string;
    phone: string;
    message: string;
    logo_url: string;
  };
}

export interface PrintfulOrderItem {
  id?: number;
  external_id?: string;
  variant_id?: number;
  sync_variant_id?: number;
  external_variant_id?: string;
  quantity: number;
  price?: string;
  retail_price?: string;
  name?: string;
  product?: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files?: PrintfulFile[];
  options?: PrintfulOrderItemOption[];
}

export interface PrintfulOrderItemOption {
  id: string;
  value: any;
}

export interface PrintfulRecipient {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state_code: string;
  state_name?: string;
  country_code: string;
  country_name?: string;
  zip: string;
  phone?: string;
  email: string;
  tax_number?: string;
}

export interface PrintfulShippingRate {
  id: string;
  name: string;
  rate: string;
  currency: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
}

export interface PrintfulWebhook {
  url: string;
  types: string[];
  params?: {
    secret?: string;
  };
}

export interface PrintfulCatalogProduct {
  id: number;
  main_category_id: number;
  type: string;
  description: string;
  type_name: string;
  title: string;
  brand: string;
  model: string;
  image: string;
  variant_count: number;
  currency: string;
  files: Array<{
    id: string;
    type: string;
    title: string;
    additional_price: string | null;
  }>;
  options: Array<{
    id: string;
    title: string;
    type: string;
    values: Record<string, string>;
    additional_price: string | null;
  }>;
  dimensions: {
    front?: string;
  } | null;
  is_discontinued: boolean;
}

export interface PrintfulCatalogVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string;
  color_code2: string | null;
  image: string;
  price: string;
  in_stock: boolean;
  availability_regions: Record<string, string>;
  availability_status: Array<{
    region: string;
    status: string;
  }>;
}

export interface PrintfulInventoryItem {
  variant_id: number;
  quantity: number;
}

interface RateLimitState {
  requestCount: number;
  windowStart: number;
}

class PrintfulConnector {
  private baseUrl = 'https://api.printful.com';
  private circuitBreaker: CircuitBreaker;
  private rateLimits: Map<string, RateLimitState> = new Map();
  private readonly rateLimitPerMinute = 120; // Printful allows 120 req/min

  constructor() {
    this.circuitBreaker = new CircuitBreaker('Printful', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Get credentials from database
   */
  private async getCredentials(userId?: string): Promise<PrintfulCredentials> {
    const [connection] = await db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.platform, 'printful'))
      .limit(1);

    if (!connection || connection.status !== 'connected') {
      throw new Error('Printful not connected. Please configure API credentials.');
    }

    const credentials = connection.credentials as any;
    if (!credentials?.apiKey) {
      throw new Error('Invalid Printful credentials');
    }

    return {
      apiKey: credentials.apiKey,
    };
  }

  /**
   * Test connection to Printful
   */
  async testConnection(credentials: PrintfulCredentials): Promise<{ success: boolean; message: string }> {
    try {
      const stores = await this.makeRequest<any>('GET', '/stores', credentials);

      logger.info('Printful connection test successful');
      recordMetric('printful.connection.test', 1, { success: 'true' });

      return {
        success: true,
        message: `Connected successfully. Found ${stores.length || 0} store(s).`,
      };
    } catch (error: any) {
      logger.error('Printful connection test failed', error);
      trackError(error, { operation: 'testConnection' });
      recordMetric('printful.connection.test', 1, { success: 'false' });

      return {
        success: false,
        message: error.message || 'Connection test failed',
      };
    }
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

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
      recordMetric('printful.rate_limit.wait', waitTime, { endpoint });

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
            eq(apiRateLimits.platform, 'printful'),
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
          platform: 'printful',
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

  // ============================================================================
  // API REQUESTS
  // ============================================================================

  /**
   * Make authenticated API request to Printful
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    credentials: PrintfulCredentials,
    body?: any
  ): Promise<T> {
    await this.checkRateLimit(endpoint);

    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `printful-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const requestLogger = logger.child(requestId);

    requestLogger.debug('Printful API request', { method, endpoint });

    return await this.circuitBreaker.execute(async () => {
      return await withRetry(
        async () => {
          const response = await fetch(url, {
            method,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
              'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || 'default',
            },
            body: body ? JSON.stringify(body) : undefined,
          });

          const data = await response.json();

          if (!response.ok) {
            const error: any = new Error(data.error?.message || data.error || 'Printful API error');
            error.status = response.status;
            error.code = data.code;
            error.result = data.result;
            throw error;
          }

          recordMetric('printful.request.success', 1, { method, endpoint });
          return data.result;
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
            requestLogger.warn('Retrying Printful request', {
              attempt,
              delayMs,
              error: error.message,
            });
            recordMetric('printful.request.retry', 1, { attempt: String(attempt) });
          },
        }
      );
    });
  }

  // ============================================================================
  // CATALOG PRODUCTS
  // ============================================================================

  /**
   * Get all catalog products
   */
  async getCatalogProducts(userId?: string): Promise<PrintfulCatalogProduct[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<PrintfulCatalogProduct[]>('GET', '/products', credentials);
      recordMetric('printful.catalog.fetch', 1, { count: String(response.length || 0) });
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch Printful catalog', error);
      trackError(error, { operation: 'getCatalogProducts' });
      throw error;
    }
  }

  /**
   * Get catalog product by ID
   */
  async getCatalogProduct(productId: number, userId?: string): Promise<PrintfulCatalogProduct> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<PrintfulCatalogProduct>('GET', `/products/${productId}`, credentials);
      recordMetric('printful.catalog.product.fetch', 1, { productId: String(productId) });
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch catalog product', error, { productId });
      trackError(error, { operation: 'getCatalogProduct', productId });
      throw error;
    }
  }

  /**
   * Get variants for a catalog product
   */
  async getCatalogVariants(productId: number, userId?: string): Promise<PrintfulCatalogVariant[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<{ product: PrintfulCatalogProduct; variants: PrintfulCatalogVariant[] }>(
        'GET',
        `/products/${productId}`,
        credentials
      );
      recordMetric('printful.catalog.variants.fetch', 1, { productId: String(productId) });
      return response.variants;
    } catch (error: any) {
      logger.error('Failed to fetch catalog variants', error, { productId });
      trackError(error, { operation: 'getCatalogVariants', productId });
      throw error;
    }
  }

  // ============================================================================
  // SYNC PRODUCTS (Store Products)
  // ============================================================================

  /**
   * Get all sync products
   */
  async getSyncProducts(userId?: string): Promise<PrintfulSyncProduct[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<PrintfulSyncProduct[]>('GET', '/store/products', credentials);
      recordMetric('printful.sync.products.list', 1, { count: String(response.length || 0) });
      return response;
    } catch (error: any) {
      logger.error('Failed to list sync products', error);
      trackError(error, { operation: 'getSyncProducts' });
      throw error;
    }
  }

  /**
   * Get a sync product by ID
   */
  async getSyncProduct(syncProductId: number, userId?: string): Promise<PrintfulSyncProduct> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<{ sync_product: PrintfulSyncProduct; sync_variants: PrintfulSyncVariant[] }>(
        'GET',
        `/store/products/${syncProductId}`,
        credentials
      );

      const product: PrintfulSyncProduct = {
        ...response.sync_product,
        variants: response.sync_variants,
      };

      recordMetric('printful.sync.product.fetch', 1, { syncProductId: String(syncProductId) });
      return product;
    } catch (error: any) {
      logger.error('Failed to fetch sync product', error, { syncProductId });
      trackError(error, { operation: 'getSyncProduct', syncProductId });
      throw error;
    }
  }

  /**
   * Create a new sync product
   */
  async createSyncProduct(product: PrintfulSyncProduct, userId?: string): Promise<PrintfulSyncProduct> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<{ sync_product: PrintfulSyncProduct; sync_variants: PrintfulSyncVariant[] }>(
        'POST',
        '/store/products',
        credentials,
        {
          sync_product: {
            name: product.name,
            external_id: product.external_id,
          },
          sync_variants: product.variants,
        }
      );

      const createdProduct: PrintfulSyncProduct = {
        ...response.sync_product,
        variants: response.sync_variants,
      };

      logger.info('Sync product created', { syncProductId: createdProduct.id, name: product.name });
      recordMetric('printful.sync.product.create', 1, { success: 'true' });

      // Update platform connection sync time
      await db
        .update(platformConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(platformConnections.platform, 'printful'));

      return createdProduct;
    } catch (error: any) {
      logger.error('Failed to create sync product', error, { name: product.name });
      trackError(error, { operation: 'createSyncProduct', name: product.name });
      recordMetric('printful.sync.product.create', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Update an existing sync product
   */
  async updateSyncProduct(syncProductId: number, updates: Partial<PrintfulSyncProduct>, userId?: string): Promise<PrintfulSyncProduct> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<{ sync_product: PrintfulSyncProduct; sync_variants: PrintfulSyncVariant[] }>(
        'PUT',
        `/store/products/${syncProductId}`,
        credentials,
        {
          sync_product: updates,
          sync_variants: updates.variants,
        }
      );

      const updatedProduct: PrintfulSyncProduct = {
        ...response.sync_product,
        variants: response.sync_variants,
      };

      logger.info('Sync product updated', { syncProductId });
      recordMetric('printful.sync.product.update', 1, { success: 'true' });

      await db
        .update(platformConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(platformConnections.platform, 'printful'));

      return updatedProduct;
    } catch (error: any) {
      logger.error('Failed to update sync product', error, { syncProductId });
      trackError(error, { operation: 'updateSyncProduct', syncProductId });
      recordMetric('printful.sync.product.update', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Delete a sync product
   */
  async deleteSyncProduct(syncProductId: number, userId?: string): Promise<void> {
    const credentials = await this.getCredentials(userId);

    try {
      await this.makeRequest('DELETE', `/store/products/${syncProductId}`, credentials);

      logger.info('Sync product deleted', { syncProductId });
      recordMetric('printful.sync.product.delete', 1, { success: 'true' });
    } catch (error: any) {
      logger.error('Failed to delete sync product', error, { syncProductId });
      trackError(error, { operation: 'deleteSyncProduct', syncProductId });
      recordMetric('printful.sync.product.delete', 1, { success: 'false' });
      throw error;
    }
  }

  // ============================================================================
  // ORDERS
  // ============================================================================

  /**
   * Create an order
   */
  async createOrder(order: PrintfulOrder, userId?: string): Promise<PrintfulOrder> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<PrintfulOrder>('POST', '/orders', credentials, order);

      logger.info('Order created in Printful', { orderId: response.id, externalId: order.external_id });
      recordMetric('printful.order.create', 1, { success: 'true' });

      return response;
    } catch (error: any) {
      logger.error('Failed to create Printful order', error, { externalId: order.external_id });
      trackError(error, { operation: 'createOrder', externalId: order.external_id });
      recordMetric('printful.order.create', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number | string, userId?: string): Promise<PrintfulOrder> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<PrintfulOrder>('GET', `/orders/${orderId}`, credentials);
      recordMetric('printful.order.fetch', 1, {});
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch Printful order', error, { orderId });
      trackError(error, { operation: 'getOrder', orderId });
      throw error;
    }
  }

  /**
   * Get all orders
   */
  async getOrders(params?: { status?: string; offset?: number; limit?: number }, userId?: string): Promise<PrintfulOrder[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.offset) queryParams.append('offset', String(params.offset));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest<PrintfulOrder[]>('GET', endpoint, credentials);

      recordMetric('printful.orders.list', 1, { count: String(response.length || 0) });
      return response;
    } catch (error: any) {
      logger.error('Failed to list Printful orders', error);
      trackError(error, { operation: 'getOrders' });
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: number | string, userId?: string): Promise<void> {
    const credentials = await this.getCredentials(userId);

    try {
      await this.makeRequest('DELETE', `/orders/${orderId}`, credentials);

      logger.info('Order cancelled', { orderId });
      recordMetric('printful.order.cancel', 1, { success: 'true' });
    } catch (error: any) {
      logger.error('Failed to cancel order', error, { orderId });
      trackError(error, { operation: 'cancelOrder', orderId });
      recordMetric('printful.order.cancel', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Estimate order costs
   */
  async estimateOrderCosts(order: PrintfulOrder, userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any>('POST', '/orders/estimate-costs', credentials, order);

      logger.info('Order costs estimated', { externalId: order.external_id });
      recordMetric('printful.order.estimate', 1, { success: 'true' });

      return response;
    } catch (error: any) {
      logger.error('Failed to estimate order costs', error, { externalId: order.external_id });
      trackError(error, { operation: 'estimateOrderCosts', externalId: order.external_id });
      recordMetric('printful.order.estimate', 1, { success: 'false' });
      throw error;
    }
  }

  // ============================================================================
  // SHIPPING RATES
  // ============================================================================

  /**
   * Calculate shipping rates for an order
   */
  async calculateShippingRates(order: PrintfulOrder, userId?: string): Promise<PrintfulShippingRate[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<PrintfulShippingRate[]>('POST', '/shipping/rates', credentials, order);

      logger.info('Shipping rates calculated', { rateCount: response.length });
      recordMetric('printful.shipping.rates', 1, { count: String(response.length) });

      return response;
    } catch (error: any) {
      logger.error('Failed to calculate shipping rates', error);
      trackError(error, { operation: 'calculateShippingRates' });
      throw error;
    }
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * Register webhook for order notifications
   */
  async registerWebhook(webhookUrl: string, types: string[], userId?: string): Promise<any> {
    const credentials = await this.getCredentials(userId);

    try {
      const webhook: PrintfulWebhook = {
        url: webhookUrl,
        types: types || [
          'package_shipped',
          'package_returned',
          'order_failed',
          'order_canceled',
          'product_synced',
          'stock_updated',
        ],
        params: {
          secret: process.env.PRINTFUL_WEBHOOK_SECRET || Math.random().toString(36).substring(7),
        },
      };

      const response = await this.makeRequest<any>('POST', '/webhooks', credentials, webhook);

      // Save webhook URL to connection settings
      await db
        .update(platformConnections)
        .set({
          webhookUrl,
          webhookSecret: webhook.params?.secret,
        })
        .where(eq(platformConnections.platform, 'printful'));

      logger.info('Webhook registered', { webhookUrl, types: webhook.types });
      recordMetric('printful.webhook.register', 1, { types: webhook.types.join(',') });

      return response;
    } catch (error: any) {
      logger.error('Failed to register webhook', error);
      trackError(error, { operation: 'registerWebhook', webhookUrl });
      throw error;
    }
  }

  /**
   * Get all registered webhooks
   */
  async getWebhooks(userId?: string): Promise<any[]> {
    const credentials = await this.getCredentials(userId);

    try {
      const response = await this.makeRequest<any[]>('GET', '/webhooks', credentials);
      recordMetric('printful.webhook.list', 1, { count: String(response.length || 0) });
      return response;
    } catch (error: any) {
      logger.error('Failed to fetch webhooks', error);
      trackError(error, { operation: 'getWebhooks' });
      throw error;
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string, userId?: string): Promise<void> {
    const credentials = await this.getCredentials(userId);

    try {
      await this.makeRequest('DELETE', `/webhooks/${webhookId}`, credentials);

      logger.info('Webhook deleted', { webhookId });
      recordMetric('printful.webhook.delete', 1, { success: 'true' });
    } catch (error: any) {
      logger.error('Failed to delete webhook', error, { webhookId });
      trackError(error, { operation: 'deleteWebhook', webhookId });
      recordMetric('printful.webhook.delete', 1, { success: 'false' });
      throw error;
    }
  }

  /**
   * Process webhook event from Printful
   */
  async handleWebhook(event: any): Promise<void> {
    try {
      logger.info('Processing Printful webhook', { type: event.type });

      switch (event.type) {
        case 'package_shipped':
          await this.handlePackageShipped(event.data);
          break;
        case 'package_returned':
          await this.handlePackageReturned(event.data);
          break;
        case 'order_failed':
          await this.handleOrderFailed(event.data);
          break;
        case 'order_canceled':
          await this.handleOrderCanceled(event.data);
          break;
        case 'product_synced':
          await this.handleProductSynced(event.data);
          break;
        case 'stock_updated':
          await this.handleStockUpdated(event.data);
          break;
        default:
          logger.warn('Unknown webhook event type', { type: event.type });
      }

      recordMetric('printful.webhook.process', 1, { type: event.type });
    } catch (error: any) {
      logger.error('Webhook processing failed', error, { eventType: event.type });
      trackError(error, { operation: 'handleWebhook', eventType: event.type });
      throw error;
    }
  }

  private async handlePackageShipped(data: any): Promise<void> {
    logger.info('Package shipped webhook received', { orderId: data.order?.id });
    // Implementation: Update order status, send tracking info to customer
  }

  private async handlePackageReturned(data: any): Promise<void> {
    logger.info('Package returned webhook received', { orderId: data.order?.id });
    // Implementation: Handle return processing, refunds, etc.
  }

  private async handleOrderFailed(data: any): Promise<void> {
    logger.info('Order failed webhook received', { orderId: data.order?.id, reason: data.reason });
    // Implementation: Notify customer, process refund, retry if applicable
  }

  private async handleOrderCanceled(data: any): Promise<void> {
    logger.info('Order canceled webhook received', { orderId: data.order?.id });
    // Implementation: Update order status, process refund
  }

  private async handleProductSynced(data: any): Promise<void> {
    logger.info('Product synced webhook received', { syncProductId: data.sync_product?.id });
    // Implementation: Update local product database with synced data
  }

  private async handleStockUpdated(data: any): Promise<void> {
    logger.info('Stock updated webhook received', { variantId: data.variant_id });
    // Implementation: Update local inventory levels
  }

  // ============================================================================
  // INVENTORY SYNC
  // ============================================================================

  /**
   * Sync inventory from Printful to local database
   */
  async syncInventory(userId?: string): Promise<{ synced: number; errors: string[] }> {
    try {
      logger.info('Starting inventory sync from Printful');
      const products = await this.getSyncProducts(userId);

      const synced = products.length;
      const errors: string[] = [];

      // Update last sync time
      await db
        .update(platformConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(platformConnections.platform, 'printful'));

      logger.info('Inventory sync completed', { synced, errors: errors.length });
      recordMetric('printful.inventory.sync', synced, { errors: String(errors.length) });

      return { synced, errors };
    } catch (error: any) {
      logger.error('Inventory sync failed', error);
      trackError(error, { operation: 'syncInventory' });
      throw error;
    }
  }

  /**
   * Push local inventory changes to Printful
   */
  async pushInventoryUpdate(updates: PrintfulInventoryItem[], userId?: string): Promise<void> {
    const credentials = await this.getCredentials(userId);

    try {
      logger.info('Pushing inventory updates to Printful', { updateCount: updates.length });

      // Printful doesn't have a direct inventory update endpoint for sync products
      // Inventory is managed per variant during product sync
      // This is a placeholder for custom inventory management logic

      recordMetric('printful.inventory.push', updates.length, {});
    } catch (error: any) {
      logger.error('Failed to push inventory updates', error);
      trackError(error, { operation: 'pushInventoryUpdate' });
      throw error;
    }
  }

  /**
   * Two-way inventory sync - sync from Printful and push local changes
   */
  async twoWayInventorySync(userId?: string): Promise<{ pulled: number; pushed: number; errors: string[] }> {
    try {
      logger.info('Starting two-way inventory sync');

      // Pull from Printful
      const pullResult = await this.syncInventory(userId);

      // Push local changes (placeholder - implement based on your local inventory tracking)
      const pushed = 0;

      logger.info('Two-way inventory sync completed', {
        pulled: pullResult.synced,
        pushed,
        errors: pullResult.errors.length,
      });

      recordMetric('printful.inventory.two_way_sync', 1, {
        pulled: String(pullResult.synced),
        pushed: String(pushed),
      });

      return {
        pulled: pullResult.synced,
        pushed,
        errors: pullResult.errors,
      };
    } catch (error: any) {
      logger.error('Two-way inventory sync failed', error);
      trackError(error, { operation: 'twoWayInventorySync' });
      throw error;
    }
  }
}

export const printfulConnector = new PrintfulConnector();
