/**
 * Instagram Shopping Integration via Facebook Graph API
 *
 * Features:
 * - Instagram Shopping catalog sync
 * - Product tagging in posts
 * - Shopping post creation
 * - Catalog management
 * - Content publishing
 */

import { db } from "../db";
import { socialPlatforms, products, publishingQueue } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface InstagramConfig {
  accessToken: string;
  instagramAccountId: string;
  facebookPageId?: string;
  catalogId?: string;
}

interface InstagramProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  availability: "in stock" | "out of stock" | "preorder";
  condition: "new" | "refurbished" | "used";
  brand?: string;
  image_url: string;
  url: string;
  product_type?: string;
}

interface InstagramMediaContainer {
  id: string;
  status: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
  status_code?: string;
}

interface RateLimitState {
  callCount: number;
  totalTime: number;
  totalCputime: number;
  callsRemaining: number;
  resetTime: number;
}

export class InstagramConnector {
  private config: InstagramConfig;
  private baseUrl = "https://graph.facebook.com/v19.0";
  private rateLimitState: RateLimitState = {
    callCount: 0,
    totalTime: 0,
    totalCputime: 0,
    callsRemaining: 200,
    resetTime: Date.now() + 3600000, // 1 hour from now
  };
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second base delay

  constructor(config: InstagramConfig) {
    this.config = config;
  }

  /**
   * Create or update Instagram Shopping catalog
   */
  async syncCatalog(userId: string): Promise<{ success: boolean; catalogId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      // Get catalog ID or create new catalog
      let catalogId = this.config.catalogId;

      if (!catalogId) {
        const createResult = await this.createCatalog(userId);
        if (!createResult.success) {
          return { success: false, error: createResult.error };
        }
        catalogId = createResult.catalogId;
      }

      // Fetch products from database
      const dbProducts = await db.select().from(products).where(eq(products.status, "active"));

      // Sync products to Instagram catalog
      const syncResults = await Promise.allSettled(
        dbProducts.map(product => this.addProductToCatalog(catalogId!, product))
      );

      const successCount = syncResults.filter(r => r.status === "fulfilled").length;
      const failedCount = syncResults.filter(r => r.status === "rejected").length;

      console.log(`Instagram catalog sync: ${successCount} succeeded, ${failedCount} failed`);

      return {
        success: true,
        catalogId,
      };
    } catch (error) {
      console.error("Instagram catalog sync error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a new product catalog
   */
  private async createCatalog(userId: string): Promise<{ success: boolean; catalogId?: string; error?: string }> {
    try {
      const response = await this.makeRequest(`/${this.config.facebookPageId}/product_catalogs`, {
        method: "POST",
        body: JSON.stringify({
          name: "AffordableStoreStuff Catalog",
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
   * Add or update product in catalog
   */
  private async addProductToCatalog(catalogId: string, product: any): Promise<void> {
    await this.checkRateLimit();

    const instagramProduct: InstagramProduct = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      currency: "USD",
      availability: product.stock > 0 ? "in stock" : "out of stock",
      condition: "new",
      image_url: product.images?.[0] || "",
      url: `https://yourstore.com/products/${product.slug}`,
      product_type: product.tags?.[0] || undefined,
    };

    await this.makeRequest(`/${catalogId}/products`, {
      method: "POST",
      body: JSON.stringify({
        retailer_id: product.id,
        ...instagramProduct,
      }),
    });
  }

  /**
   * Create a shoppable Instagram post
   */
  async createShoppablePost(params: {
    imageUrl: string;
    caption: string;
    productIds: string[];
    userId: string;
  }): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      // Step 1: Create media container
      const containerResponse = await this.makeRequest(
        `/${this.config.instagramAccountId}/media`,
        {
          method: "POST",
          body: JSON.stringify({
            image_url: params.imageUrl,
            caption: params.caption,
            product_tags: params.productIds.map(id => ({ product_id: id })),
          }),
        }
      );

      const containerId = containerResponse.id;

      // Step 2: Poll for container completion
      const container = await this.pollContainerStatus(containerId);

      if (container.status !== "FINISHED") {
        throw new Error(`Container creation failed with status: ${container.status}`);
      }

      // Step 3: Publish the media
      const publishResponse = await this.makeRequest(
        `/${this.config.instagramAccountId}/media_publish`,
        {
          method: "POST",
          body: JSON.stringify({
            creation_id: containerId,
          }),
        }
      );

      return {
        success: true,
        mediaId: publishResponse.id,
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
   * Poll container status until ready
   */
  private async pollContainerStatus(
    containerId: string,
    maxAttempts = 10
  ): Promise<InstagramMediaContainer> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls

      const response = await this.makeRequest(`/${containerId}`, {
        method: "GET",
      });

      if (response.status === "FINISHED" || response.status === "ERROR") {
        return response;
      }
    }

    throw new Error("Container creation timeout");
  }

  /**
   * Publish product to Instagram Shopping
   */
  async publishProduct(productId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get product from database
      const [product] = await db.select().from(products).where(eq(products.id, productId));

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      // Check if catalog exists
      if (!this.config.catalogId) {
        const syncResult = await this.syncCatalog(userId);
        if (!syncResult.success) {
          return { success: false, error: syncResult.error };
        }
      }

      // Add product to catalog
      await this.addProductToCatalog(this.config.catalogId!, product);

      // Update publishing queue
      await db.insert(publishingQueue).values({
        productId,
        platform: "instagram",
        status: "published",
        safeguardsPassed: true,
        publishedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("Publish product error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get Instagram account insights
   */
  async getInsights(period: "day" | "week" | "days_28" = "day"): Promise<any> {
    try {
      await this.checkRateLimit();

      const metrics = [
        "impressions",
        "reach",
        "profile_views",
        "website_clicks",
        "follower_count",
      ];

      const response = await this.makeRequest(
        `/${this.config.instagramAccountId}/insights`,
        {
          method: "GET",
          params: {
            metric: metrics.join(","),
            period,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get insights error:", error);
      throw error;
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

      // Update rate limit state from headers
      this.updateRateLimitFromHeaders(response.headers);

      if (!response.ok) {
        const error = await response.json();

        // Handle rate limiting
        if (response.status === 429 || error.error?.code === 4 || error.error?.code === 17) {
          if (retryCount < this.maxRetries) {
            const delay = this.calculateRetryDelay(retryCount);
            console.log(`Rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.makeRequest(endpoint, options, retryCount + 1);
          }
        }

        // Handle temporary errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          console.log(`Server error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        throw new Error(error.error?.message || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = this.calculateRetryDelay(retryCount);
        console.log(`Request failed, retrying in ${delay}ms...`);
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
                       headers.get("x-app-usage") ||
                       headers.get("x-ad-account-usage");

    if (usageHeader) {
      try {
        const usage = JSON.parse(usageHeader);
        const businessUsage = usage[Object.keys(usage)[0]]; // Get first business use case

        this.rateLimitState = {
          callCount: businessUsage.call_count || 0,
          totalTime: businessUsage.total_time || 0,
          totalCputime: businessUsage.total_cputime || 0,
          callsRemaining: 200 - (businessUsage.call_count || 0),
          resetTime: Date.now() + 3600000, // Reset in 1 hour
        };
      } catch (error) {
        console.error("Failed to parse rate limit headers:", error);
      }
    }
  }

  /**
   * Check if we're within rate limits
   */
  private async checkRateLimit(): Promise<void> {
    // If we've exceeded 80% of the limit, wait for reset
    if (this.rateLimitState.callsRemaining < 40) {
      const waitTime = this.rateLimitState.resetTime - Date.now();
      if (waitTime > 0) {
        console.log(`Approaching rate limit, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)));
      }
    }

    // Add small delay between requests to avoid bursting
    await new Promise(resolve => setTimeout(resolve, 200));
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
      await this.makeRequest("/me", { method: "GET" });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh access token (if using long-lived token)
   */
  async refreshToken(appId: string, appSecret: string): Promise<string | null> {
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
      console.error("Token refresh error:", error);
      return null;
    }
  }
}

/**
 * Factory function to create Instagram connector from database
 */
export async function createInstagramConnector(userId: string): Promise<InstagramConnector | null> {
  try {
    const [platform] = await db
      .select()
      .from(socialPlatforms)
      .where(
        and(
          eq(socialPlatforms.userId, userId),
          eq(socialPlatforms.platform, "instagram"),
          eq(socialPlatforms.connected, true)
        )
      );

    if (!platform || !platform.accessToken) {
      return null;
    }

    // Extract config from platform settings
    const settings = platform.createdAt as any; // Settings might be stored in metadata

    return new InstagramConnector({
      accessToken: platform.accessToken,
      instagramAccountId: platform.username, // Store Instagram Business Account ID in username field
      facebookPageId: settings?.facebookPageId,
      catalogId: settings?.catalogId,
    });
  } catch (error) {
    console.error("Failed to create Instagram connector:", error);
    return null;
  }
}
