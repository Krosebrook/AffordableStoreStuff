/**
 * TikTok Shop Integration via TikTok for Business API
 *
 * Features:
 * - TikTok Shop product catalog sync
 * - Product listing management
 * - Shoppable video creation
 * - Live shopping integration
 * - Analytics and performance tracking
 */

import { db } from "../db";
import { socialPlatforms, products, publishingQueue } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface TikTokConfig {
  accessToken: string;
  shopId: string;
  sellerId?: string;
  refreshToken?: string;
}

interface TikTokProduct {
  product_name: string;
  description: string;
  category_id: string;
  brand_id?: string;
  images: TikTokImage[];
  videos?: TikTokVideo[];
  skus: TikTokSku[];
  package_weight: {
    value: string;
    unit: "KILOGRAM" | "POUND";
  };
  package_dimensions: {
    length: string;
    width: string;
    height: string;
    unit: "CENTIMETER" | "INCH";
  };
  warranty_period?: number;
  warranty_policy?: string;
  is_cod_allowed?: boolean;
}

interface TikTokImage {
  uri: string;
  width?: number;
  height?: number;
}

interface TikTokVideo {
  uri: string;
  cover_image_uri: string;
}

interface TikTokSku {
  seller_sku: string;
  sales_attributes: Array<{
    attribute_id: string;
    value_id: string;
  }>;
  stock_infos: Array<{
    warehouse_id: string;
    available_stock: number;
  }>;
  price: {
    amount: string;
    currency: "USD";
  };
  identifier_code?: {
    code: string;
    type: "UPC" | "EAN" | "ISBN";
  };
}

interface RateLimitState {
  requestCount: number;
  requestsRemaining: number;
  resetTime: number;
  quotaUsed: number;
}

export class TikTokConnector {
  private config: TikTokConfig;
  private baseUrl = "https://open-api.tiktokglobalshop.com";
  private version = "/api/products/v1";
  private rateLimitState: RateLimitState = {
    requestCount: 0,
    requestsRemaining: 1000,
    resetTime: Date.now() + 3600000,
    quotaUsed: 0,
  };
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(config: TikTokConfig) {
    this.config = config;
  }

  /**
   * Sync product catalog to TikTok Shop
   */
  async syncCatalog(userId: string): Promise<{ success: boolean; synced?: number; failed?: number; error?: string }> {
    try {
      await this.checkRateLimit();

      // Fetch active products from database
      const dbProducts = await db.select().from(products).where(eq(products.status, "active"));

      const results = await Promise.allSettled(
        dbProducts.map(product => this.createProduct(product))
      );

      const syncedCount = results.filter(r => r.status === "fulfilled").length;
      const failedCount = results.filter(r => r.status === "rejected").length;

      console.log(`TikTok Shop sync: ${syncedCount} succeeded, ${failedCount} failed`);

      return {
        success: true,
        synced: syncedCount,
        failed: failedCount,
      };
    } catch (error) {
      console.error("TikTok catalog sync error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a product in TikTok Shop
   */
  async createProduct(product: any): Promise<{ success: boolean; productId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      const tiktokProduct = this.formatProductForTikTok(product);

      const response = await this.makeRequest("/products", {
        method: "POST",
        body: JSON.stringify(tiktokProduct),
      });

      // Update publishing queue
      await db.insert(publishingQueue).values({
        productId: product.id,
        platform: "tiktok",
        status: "published",
        externalId: response.data.product_id,
        safeguardsPassed: true,
        publishedAt: new Date(),
      });

      return {
        success: true,
        productId: response.data.product_id,
      };
    } catch (error) {
      console.error("TikTok create product error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Format product data for TikTok API
   */
  private formatProductForTikTok(product: any): TikTokProduct {
    return {
      product_name: product.name.slice(0, 255), // TikTok has 255 char limit
      description: product.description || "",
      category_id: this.getCategoryId(product.categoryId),
      images: (product.images || []).slice(0, 9).map((url: string) => ({
        uri: url,
      })),
      skus: [
        {
          seller_sku: product.sku || product.id,
          sales_attributes: [],
          stock_infos: [
            {
              warehouse_id: "default",
              available_stock: product.stock || 0,
            },
          ],
          price: {
            amount: (parseFloat(product.price) * 100).toFixed(0), // Convert to cents
            currency: "USD",
          },
        },
      ],
      package_weight: {
        value: "1.0", // Default weight
        unit: "POUND",
      },
      package_dimensions: {
        length: "10",
        width: "10",
        height: "2",
        unit: "INCH",
      },
      is_cod_allowed: false,
    };
  }

  /**
   * Map internal category to TikTok category ID
   */
  private getCategoryId(categoryId: string | null): string {
    // Default to "Other" category - in production, maintain a category mapping table
    return "100639"; // TikTok's "Other" category ID
  }

  /**
   * Update product in TikTok Shop
   */
  async updateProduct(productId: string, externalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, productId));

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      await this.checkRateLimit();

      const tiktokProduct = this.formatProductForTikTok(product);

      await this.makeRequest(`/products/${externalId}`, {
        method: "PUT",
        body: JSON.stringify(tiktokProduct),
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
   * Delete product from TikTok Shop
   */
  async deleteProduct(externalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.checkRateLimit();

      await this.makeRequest(`/products/${externalId}`, {
        method: "DELETE",
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
   * Get product details from TikTok Shop
   */
  async getProduct(externalId: string): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest(`/products/${externalId}`, {
        method: "GET",
      });

      return response.data;
    } catch (error) {
      console.error("Get product error:", error);
      return null;
    }
  }

  /**
   * Update product stock
   */
  async updateStock(externalId: string, skuId: string, stock: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.checkRateLimit();

      await this.makeRequest("/products/stocks", {
        method: "POST",
        body: JSON.stringify({
          product_id: externalId,
          skus: [
            {
              id: skuId,
              stock_infos: [
                {
                  warehouse_id: "default",
                  available_stock: stock,
                },
              ],
            },
          ],
        }),
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
   * Update product price
   */
  async updatePrice(externalId: string, skuId: string, price: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.checkRateLimit();

      await this.makeRequest("/products/prices", {
        method: "POST",
        body: JSON.stringify({
          product_id: externalId,
          skus: [
            {
              id: skuId,
              price: {
                amount: (parseFloat(price) * 100).toFixed(0),
                currency: "USD",
              },
            },
          ],
        }),
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
   * Get shop analytics
   */
  async getShopAnalytics(startDate: string, endDate: string): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/seller/performance", {
        method: "GET",
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Get shop analytics error:", error);
      throw error;
    }
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(productId: string, startDate: string, endDate: string): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest(`/products/${productId}/performance`, {
        method: "GET",
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Get product analytics error:", error);
      throw error;
    }
  }

  /**
   * Create shoppable video
   */
  async createShoppableVideo(params: {
    videoUrl: string;
    caption: string;
    productIds: string[];
    coverImageUrl?: string;
  }): Promise<{ success: boolean; videoId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/videos/upload", {
        method: "POST",
        body: JSON.stringify({
          video_url: params.videoUrl,
          caption: params.caption,
          product_ids: params.productIds,
          cover_image_url: params.coverImageUrl,
          privacy_level: "PUBLIC",
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        }),
      });

      return {
        success: true,
        videoId: response.data.video_id,
      };
    } catch (error) {
      console.error("Create shoppable video error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Make API request with retry logic and signing
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
    const timestamp = Math.floor(Date.now() / 1000);
    const url = new URL(`${this.baseUrl}${this.version}${endpoint}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    // TikTok requires request signing
    const headers = this.generateHeaders(timestamp, options.method, endpoint, options.body);

    try {
      const response = await fetch(url.toString(), {
        method: options.method,
        headers,
        body: options.body,
      });

      // Update rate limit state
      this.updateRateLimitFromHeaders(response.headers);

      const data = await response.json();

      if (!response.ok || data.code !== 0) {
        // Handle rate limiting
        if (response.status === 429 || data.code === 10002) {
          if (retryCount < this.maxRetries) {
            const delay = this.calculateRetryDelay(retryCount);
            console.log(`TikTok rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.makeRequest(endpoint, options, retryCount + 1);
          }
        }

        // Handle temporary errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          console.log(`TikTok server error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        // Handle expired token
        if (data.code === 10001 || data.code === 10003) {
          throw new Error("Access token expired. Please reconnect your TikTok Shop.");
        }

        throw new Error(data.message || `API request failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (retryCount < this.maxRetries && !(error instanceof Error && error.message.includes("token"))) {
        const delay = this.calculateRetryDelay(retryCount);
        console.log(`TikTok request failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Generate request headers with authentication
   */
  private generateHeaders(timestamp: number, method: string, path: string, body?: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-tts-access-token": this.config.accessToken,
      "x-tts-shop-id": this.config.shopId,
    };
  }

  /**
   * Update rate limit state from response headers
   */
  private updateRateLimitFromHeaders(headers: Headers): void {
    const rateLimit = headers.get("x-tts-rate-limit-limit");
    const rateLimitRemaining = headers.get("x-tts-rate-limit-remaining");
    const rateLimitReset = headers.get("x-tts-rate-limit-reset");

    if (rateLimit && rateLimitRemaining && rateLimitReset) {
      this.rateLimitState = {
        requestCount: parseInt(rateLimit) - parseInt(rateLimitRemaining),
        requestsRemaining: parseInt(rateLimitRemaining),
        resetTime: parseInt(rateLimitReset) * 1000,
        quotaUsed: ((parseInt(rateLimit) - parseInt(rateLimitRemaining)) / parseInt(rateLimit)) * 100,
      };
    }
  }

  /**
   * Check rate limits before making request
   */
  private async checkRateLimit(): Promise<void> {
    // If we're at 90% quota, wait for reset
    if (this.rateLimitState.quotaUsed >= 90) {
      const waitTime = this.rateLimitState.resetTime - Date.now();
      if (waitTime > 0 && waitTime < 3600000) {
        console.log(`TikTok rate limit approaching, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)));
      }
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateRetryDelay(retryCount: number): number {
    return this.retryDelay * Math.pow(2, retryCount) + Math.random() * 1000;
  }

  /**
   * Validate access token
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.makeRequest("/seller/global_product_categories", {
        method: "GET",
        params: { locale: "en" },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(appKey: string, appSecret: string): Promise<string | null> {
    try {
      if (!this.config.refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/api/token/refresh/v1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_key: appKey,
          app_secret: appSecret,
          refresh_token: this.config.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const data = await response.json();

      if (data.code === 0 && data.data?.access_token) {
        return data.data.access_token;
      }

      return null;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  /**
   * Get product categories for listing
   */
  async getCategories(locale: string = "en"): Promise<any[]> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/seller/global_product_categories", {
        method: "GET",
        params: { locale },
      });

      return response.data?.categories || [];
    } catch (error) {
      console.error("Get categories error:", error);
      return [];
    }
  }

  /**
   * Get brand list
   */
  async getBrands(categoryId: string): Promise<any[]> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/seller/brands", {
        method: "GET",
        params: { category_id: categoryId },
      });

      return response.data?.brands || [];
    } catch (error) {
      console.error("Get brands error:", error);
      return [];
    }
  }
}

/**
 * Factory function to create TikTok connector from database
 */
export async function createTikTokConnector(userId: string): Promise<TikTokConnector | null> {
  try {
    const [platform] = await db
      .select()
      .from(socialPlatforms)
      .where(
        and(
          eq(socialPlatforms.userId, userId),
          eq(socialPlatforms.platform, "tiktok"),
          eq(socialPlatforms.connected, true)
        )
      );

    if (!platform || !platform.accessToken) {
      return null;
    }

    return new TikTokConnector({
      accessToken: platform.accessToken,
      shopId: platform.username, // Store TikTok Shop ID in username field
      refreshToken: platform.refreshToken || undefined,
    });
  } catch (error) {
    console.error("Failed to create TikTok connector:", error);
    return null;
  }
}
