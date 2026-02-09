/**
 * Facebook Shop Integration via Facebook Graph API
 *
 * Features:
 * - Facebook Shop catalog management
 * - Product catalog sync
 * - Commerce Manager integration
 * - Shoppable posts on Facebook
 * - Collection management
 */

import { db } from "../db";
import { socialPlatforms, products, publishingQueue } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface FacebookConfig {
  accessToken: string;
  pageId: string;
  catalogId?: string;
  businessId?: string;
}

interface FacebookProduct {
  retailer_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: "in stock" | "out of stock" | "preorder" | "available for order" | "discontinued";
  condition: "new" | "refurbished" | "used" | "used_like_new" | "used_good" | "used_fair";
  brand?: string;
  image_url: string;
  url: string;
  category?: string;
  sale_price?: number;
  sale_price_effective_date?: string;
  additional_image_urls?: string[];
  gtin?: string;
  mpn?: string;
  product_type?: string;
  google_product_category?: string;
  fb_product_category?: string;
}

interface FacebookCollection {
  id: string;
  name: string;
  description?: string;
  productIds: string[];
}

interface RateLimitState {
  callCount: number;
  totalTime: number;
  percentUsed: number;
  resetTime: number;
}

export class FacebookConnector {
  private config: FacebookConfig;
  private baseUrl = "https://graph.facebook.com/v19.0";
  private rateLimitState: RateLimitState = {
    callCount: 0,
    totalTime: 0,
    percentUsed: 0,
    resetTime: Date.now() + 3600000,
  };
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(config: FacebookConfig) {
    this.config = config;
  }

  /**
   * Sync product catalog to Facebook Shop
   */
  async syncCatalog(userId: string): Promise<{ success: boolean; catalogId?: string; synced?: number; error?: string }> {
    try {
      await this.checkRateLimit();

      // Get or create catalog
      let catalogId = this.config.catalogId;

      if (!catalogId) {
        const createResult = await this.createCatalog();
        if (!createResult.success) {
          return { success: false, error: createResult.error };
        }
        catalogId = createResult.catalogId;

        // Update platform settings with catalog ID
        await this.updatePlatformCatalogId(userId, catalogId!);
      }

      // Fetch active products from database
      const dbProducts = await db.select().from(products).where(eq(products.status, "active"));

      // Batch sync products
      const batchSize = 50;
      let syncedCount = 0;

      for (let i = 0; i < dbProducts.length; i += batchSize) {
        const batch = dbProducts.slice(i, i + batchSize);
        const results = await this.batchUploadProducts(catalogId!, batch);
        syncedCount += results.successCount;
      }

      return {
        success: true,
        catalogId,
        synced: syncedCount,
      };
    } catch (error) {
      console.error("Facebook catalog sync error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a new product catalog
   */
  private async createCatalog(): Promise<{ success: boolean; catalogId?: string; error?: string }> {
    try {
      const response = await this.makeRequest(`/${this.config.businessId || this.config.pageId}/owned_product_catalogs`, {
        method: "POST",
        body: JSON.stringify({
          name: "AffordableStoreStuff Shop",
          vertical: "commerce",
        }),
      });

      return { success: true, catalogId: response.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create catalog",
      };
    }
  }

  /**
   * Batch upload products using Facebook's batch API
   */
  private async batchUploadProducts(
    catalogId: string,
    products: any[]
  ): Promise<{ successCount: number; failedCount: number }> {
    try {
      await this.checkRateLimit();

      const requests = products.map((product, index) => ({
        method: "POST",
        relative_url: `${catalogId}/products`,
        body: this.formatProductForFacebook(product),
      }));

      const response = await this.makeRequest("", {
        method: "POST",
        body: JSON.stringify({
          batch: requests.map(req => ({
            ...req,
            body: JSON.stringify(req.body),
          })),
        }),
      });

      const successCount = response.filter((r: any) => r.code === 200).length;
      const failedCount = response.filter((r: any) => r.code !== 200).length;

      return { successCount, failedCount };
    } catch (error) {
      console.error("Batch upload error:", error);
      return { successCount: 0, failedCount: products.length };
    }
  }

  /**
   * Format product data for Facebook API
   */
  private formatProductForFacebook(product: any): FacebookProduct {
    return {
      retailer_id: product.id,
      name: product.name,
      description: product.description || "",
      price: parseFloat(product.price) * 100, // Convert to cents
      currency: "USD",
      availability: product.stock > 0 ? "in stock" : "out of stock",
      condition: "new",
      image_url: product.images?.[0] || "",
      url: `https://yourstore.com/products/${product.slug}`,
      brand: "AffordableStoreStuff",
      category: product.categoryId || undefined,
      additional_image_urls: product.images?.slice(1, 4) || [],
      product_type: product.tags?.[0] || undefined,
      sale_price: product.compareAtPrice
        ? parseFloat(product.compareAtPrice) * 100
        : undefined,
    };
  }

  /**
   * Create a single product in catalog
   */
  async createProduct(catalogId: string, productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, productId));

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      await this.checkRateLimit();

      const fbProduct = this.formatProductForFacebook(product);

      await this.makeRequest(`/${catalogId}/products`, {
        method: "POST",
        body: JSON.stringify(fbProduct),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update product in catalog
   */
  async updateProduct(catalogId: string, productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, productId));

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      await this.checkRateLimit();

      const fbProduct = this.formatProductForFacebook(product);

      await this.makeRequest(`/${catalogId}/products`, {
        method: "POST",
        body: JSON.stringify(fbProduct),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete product from catalog
   */
  async deleteProduct(catalogId: string, productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.checkRateLimit();

      await this.makeRequest(`/${catalogId}/products`, {
        method: "DELETE",
        params: { retailer_id: productId },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a shoppable Facebook post
   */
  async createShoppablePost(params: {
    message: string;
    imageUrl: string;
    productIds: string[];
    link?: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      // Create photo post with product tags
      const response = await this.makeRequest(`/${this.config.pageId}/photos`, {
        method: "POST",
        body: JSON.stringify({
          url: params.imageUrl,
          message: params.message,
          product_tags: params.productIds.map(id => ({
            product_id: id,
          })),
          published: true,
        }),
      });

      return {
        success: true,
        postId: response.id,
      };
    } catch (error) {
      console.error("Create shoppable post error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a product collection
   */
  async createCollection(params: {
    name: string;
    description?: string;
    productIds: string[];
  }): Promise<{ success: boolean; collectionId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      if (!this.config.catalogId) {
        return { success: false, error: "No catalog ID configured" };
      }

      const response = await this.makeRequest(`/${this.config.catalogId}/product_sets`, {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          filter: {
            retailer_id: { is_any: params.productIds },
          },
        }),
      });

      return {
        success: true,
        collectionId: response.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get catalog insights and analytics
   */
  async getCatalogInsights(catalogId: string): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest(`/${catalogId}/insights`, {
        method: "GET",
        params: {
          metric: "product_views,product_clicks,product_purchases",
          period: "day",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Get catalog insights error:", error);
      throw error;
    }
  }

  /**
   * Get page insights
   */
  async getPageInsights(metrics: string[] = ["page_impressions", "page_engaged_users", "page_actions_post_reactions_total"]): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest(`/${this.config.pageId}/insights`, {
        method: "GET",
        params: {
          metric: metrics.join(","),
          period: "day",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Get page insights error:", error);
      throw error;
    }
  }

  /**
   * Check product status in catalog
   */
  async checkProductStatus(catalogId: string, productId: string): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest(`/${catalogId}/products`, {
        method: "GET",
        params: {
          filter: JSON.stringify({ retailer_id: { eq: productId } }),
        },
      });

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Check product status error:", error);
      return null;
    }
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequest(
    endpoint: string,
    options: {
      method: "GET" | "POST" | "PUT" | "DELETE";
      body?: string;
      params?: Record<string, string>;
    },
    retryCount = 0
  ): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set("access_token", this.config.accessToken);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: options.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: options.body,
      });

      // Update rate limit state
      this.updateRateLimitFromHeaders(response.headers);

      if (!response.ok) {
        const error = await response.json();

        // Handle rate limiting (error code 4 or 17)
        if (response.status === 429 || error.error?.code === 4 || error.error?.code === 17) {
          if (retryCount < this.maxRetries) {
            const delay = this.calculateRetryDelay(retryCount);
            console.log(`Facebook rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.makeRequest(endpoint, options, retryCount + 1);
          }
        }

        // Handle temporary errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          console.log(`Facebook server error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        // Handle expired token
        if (error.error?.code === 190) {
          throw new Error("Access token expired. Please reconnect your Facebook account.");
        }

        throw new Error(error.error?.message || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < this.maxRetries && !(error instanceof Error && error.message.includes("token"))) {
        const delay = this.calculateRetryDelay(retryCount);
        console.log(`Facebook request failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Update rate limit state from response headers
   */
  private updateRateLimitFromHeaders(headers: Headers): void {
    const usageHeader = headers.get("x-business-use-case-usage") ||
                       headers.get("x-app-usage");

    if (usageHeader) {
      try {
        const usage = JSON.parse(usageHeader);
        const firstKey = Object.keys(usage)[0];
        const businessUsage = usage[firstKey];

        this.rateLimitState = {
          callCount: businessUsage.call_count || 0,
          totalTime: businessUsage.total_time || 0,
          percentUsed: businessUsage.total_time || 0,
          resetTime: Date.now() + 3600000,
        };
      } catch (error) {
        console.error("Failed to parse rate limit headers:", error);
      }
    }
  }

  /**
   * Check rate limits before making request
   */
  private async checkRateLimit(): Promise<void> {
    // If we're at 80% usage, wait for reset
    if (this.rateLimitState.percentUsed >= 80) {
      const waitTime = this.rateLimitState.resetTime - Date.now();
      if (waitTime > 0 && waitTime < 3600000) {
        console.log(`Facebook rate limit approaching, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)));
      }
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateRetryDelay(retryCount: number): number {
    return this.retryDelay * Math.pow(2, retryCount) + Math.random() * 1000;
  }

  /**
   * Update platform catalog ID in database
   */
  private async updatePlatformCatalogId(userId: string, catalogId: string): Promise<void> {
    // This would update the platform settings in the database
    // Implementation depends on how you store platform-specific settings
    console.log(`Catalog ID ${catalogId} should be stored for user ${userId}`);
  }

  /**
   * Validate access token
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.makeRequest(`/${this.config.pageId}`, {
        method: "GET",
        params: { fields: "id,name" },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  async exchangeToken(appId: string, appSecret: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `fb_exchange_token=${this.config.accessToken}`
      );

      const data = await response.json();
      return data.access_token || null;
    } catch (error) {
      console.error("Token exchange error:", error);
      return null;
    }
  }
}

/**
 * Factory function to create Facebook connector from database
 */
export async function createFacebookConnector(userId: string): Promise<FacebookConnector | null> {
  try {
    const [platform] = await db
      .select()
      .from(socialPlatforms)
      .where(
        and(
          eq(socialPlatforms.userId, userId),
          eq(socialPlatforms.platform, "facebook"),
          eq(socialPlatforms.connected, true)
        )
      );

    if (!platform || !platform.accessToken) {
      return null;
    }

    return new FacebookConnector({
      accessToken: platform.accessToken,
      pageId: platform.username, // Store Facebook Page ID in username field
    });
  } catch (error) {
    console.error("Failed to create Facebook connector:", error);
    return null;
  }
}
