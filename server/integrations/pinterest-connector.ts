/**
 * Pinterest Product Pins Integration via Pinterest API v5
 *
 * Features:
 * - Product Pin creation and management
 * - Catalog sync for shopping
 * - Board management
 * - Rich Pin automation
 * - Analytics and insights
 */

import { db } from "../db";
import { socialPlatforms, products, publishingQueue } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface PinterestConfig {
  accessToken: string;
  adAccountId?: string;
  merchantId?: string;
  refreshToken?: string;
}

interface PinterestPin {
  board_id: string;
  media_source: {
    source_type: "image_url" | "video_url";
    url: string;
    cover_image_url?: string;
  };
  title: string;
  description?: string;
  link?: string;
  dominant_color?: string;
  alt_text?: string;
  product?: {
    product_type: string;
    currency: string;
    price: number;
    availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
    condition: "NEW" | "USED" | "REFURBISHED";
    brand?: string;
    category?: string;
  };
}

interface PinterestBoard {
  id?: string;
  name: string;
  description?: string;
  privacy: "PUBLIC" | "PROTECTED" | "SECRET";
}

interface PinterestCatalogProduct {
  item_id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link?: string[];
  price: string;
  availability: "in stock" | "out of stock" | "preorder";
  condition: "new" | "used" | "refurbished";
  brand?: string;
  product_type?: string;
  google_product_category?: string;
  sale_price?: string;
  currency: string;
}

interface RateLimitState {
  requestCount: number;
  dailyLimit: number;
  hourlyLimit: number;
  resetTime: number;
}

export class PinterestConnector {
  private config: PinterestConfig;
  private baseUrl = "https://api.pinterest.com/v5";
  private rateLimitState: RateLimitState = {
    requestCount: 0,
    dailyLimit: 1000,
    hourlyLimit: 200,
    resetTime: Date.now() + 3600000,
  };
  private maxRetries = 3;
  private retryDelay = 1000;
  private defaultBoardId?: string;

  constructor(config: PinterestConfig) {
    this.config = config;
  }

  /**
   * Sync product catalog to Pinterest
   */
  async syncCatalog(userId: string): Promise<{ success: boolean; synced?: number; failed?: number; error?: string }> {
    try {
      await this.checkRateLimit();

      // Get or create default board for products
      if (!this.defaultBoardId) {
        const boardResult = await this.ensureProductBoard();
        if (!boardResult.success) {
          return { success: false, error: boardResult.error };
        }
        this.defaultBoardId = boardResult.boardId;
      }

      // Fetch active products from database
      const dbProducts = await db.select().from(products).where(eq(products.status, "active"));

      // Create product pins in batches
      const batchSize = 25; // Pinterest recommends smaller batches
      let syncedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < dbProducts.length; i += batchSize) {
        const batch = dbProducts.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(product => this.createProductPin(product, this.defaultBoardId!))
        );

        syncedCount += results.filter(r => r.status === "fulfilled").length;
        failedCount += results.filter(r => r.status === "rejected").length;

        // Rate limiting - wait between batches
        if (i + batchSize < dbProducts.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`Pinterest sync: ${syncedCount} succeeded, ${failedCount} failed`);

      return {
        success: true,
        synced: syncedCount,
        failed: failedCount,
      };
    } catch (error) {
      console.error("Pinterest catalog sync error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Ensure a product board exists
   */
  private async ensureProductBoard(): Promise<{ success: boolean; boardId?: string; error?: string }> {
    try {
      // Check if board already exists
      const boards = await this.getBoards();
      const productBoard = boards.find((b: any) => b.name === "Products");

      if (productBoard) {
        return { success: true, boardId: productBoard.id };
      }

      // Create new board
      const result = await this.createBoard({
        name: "Products",
        description: "Product catalog from AffordableStoreStuff",
        privacy: "PUBLIC",
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to ensure product board",
      };
    }
  }

  /**
   * Create a board
   */
  async createBoard(board: PinterestBoard): Promise<{ success: boolean; boardId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/boards", {
        method: "POST",
        body: JSON.stringify(board),
      });

      return {
        success: true,
        boardId: response.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get user's boards
   */
  async getBoards(): Promise<any[]> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/boards", {
        method: "GET",
        params: {
          page_size: "100",
        },
      });

      return response.items || [];
    } catch (error) {
      console.error("Get boards error:", error);
      return [];
    }
  }

  /**
   * Create a product pin
   */
  async createProductPin(product: any, boardId: string): Promise<{ success: boolean; pinId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      const pin: PinterestPin = {
        board_id: boardId,
        media_source: {
          source_type: "image_url",
          url: product.images?.[0] || "",
        },
        title: product.name.slice(0, 100), // Pinterest has 100 char limit for titles
        description: this.formatDescription(product),
        link: `https://yourstore.com/products/${product.slug}`,
        alt_text: product.name,
        product: {
          product_type: product.tags?.[0] || "General",
          currency: "USD",
          price: parseFloat(product.price),
          availability: product.stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
          condition: "NEW",
          brand: "AffordableStoreStuff",
        },
      };

      const response = await this.makeRequest("/pins", {
        method: "POST",
        body: JSON.stringify(pin),
      });

      // Update publishing queue
      await db.insert(publishingQueue).values({
        productId: product.id,
        platform: "pinterest",
        status: "published",
        externalId: response.id,
        externalUrl: response.url,
        safeguardsPassed: true,
        publishedAt: new Date(),
      });

      return {
        success: true,
        pinId: response.id,
      };
    } catch (error) {
      console.error("Create product pin error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Format product description for Pinterest (max 500 chars)
   */
  private formatDescription(product: any): string {
    let description = product.description || "";

    // Add tags as hashtags if we have room
    if (product.tags && product.tags.length > 0) {
      const hashtags = product.tags.map((tag: string) => `#${tag.replace(/\s+/g, '')}`).join(" ");
      description = `${description}\n\n${hashtags}`;
    }

    // Truncate to 500 chars
    return description.slice(0, 500);
  }

  /**
   * Update a pin
   */
  async updatePin(pinId: string, updates: Partial<PinterestPin>): Promise<{ success: boolean; error?: string }> {
    try {
      await this.checkRateLimit();

      await this.makeRequest(`/pins/${pinId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
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
   * Delete a pin
   */
  async deletePin(pinId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.checkRateLimit();

      await this.makeRequest(`/pins/${pinId}`, {
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
   * Get pin analytics
   */
  async getPinAnalytics(pinId: string, startDate: string, endDate: string): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest(`/pins/${pinId}/analytics`, {
        method: "GET",
        params: {
          start_date: startDate,
          end_date: endDate,
          metric_types: "IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK,TOTAL_COMMENTS",
        },
      });

      return response.all || {};
    } catch (error) {
      console.error("Get pin analytics error:", error);
      throw error;
    }
  }

  /**
   * Get user account analytics
   */
  async getUserAnalytics(startDate: string, endDate: string): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/user_account/analytics", {
        method: "GET",
        params: {
          start_date: startDate,
          end_date: endDate,
          metric_types: "IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK,ENGAGEMENT",
        },
      });

      return response.all || {};
    } catch (error) {
      console.error("Get user analytics error:", error);
      throw error;
    }
  }

  /**
   * Get top pins
   */
  async getTopPins(startDate: string, endDate: string, sortBy: "IMPRESSION" | "SAVE" | "OUTBOUND_CLICK" = "IMPRESSION"): Promise<any[]> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/user_account/analytics/top_pins", {
        method: "GET",
        params: {
          start_date: startDate,
          end_date: endDate,
          sort_by: sortBy,
          metric_types: "IMPRESSION,SAVE,OUTBOUND_CLICK",
        },
      });

      return response.pins || [];
    } catch (error) {
      console.error("Get top pins error:", error);
      return [];
    }
  }

  /**
   * Create a catalog feed (for bulk product management)
   */
  async createCatalogFeed(feedName: string, feedUrl: string): Promise<{ success: boolean; feedId?: string; error?: string }> {
    try {
      await this.checkRateLimit();

      if (!this.config.merchantId) {
        return { success: false, error: "No merchant ID configured" };
      }

      const response = await this.makeRequest("/catalogs/feeds", {
        method: "POST",
        body: JSON.stringify({
          name: feedName,
          format: "TSV",
          location: feedUrl,
          default_currency: "USD",
          default_locale: "en_US",
          default_country: "US",
          default_availability: "IN_STOCK",
        }),
      });

      return {
        success: true,
        feedId: response.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search for existing pins
   */
  async searchPins(query: string, limit: number = 25): Promise<any[]> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/search/pins", {
        method: "GET",
        params: {
          query,
          limit: limit.toString(),
        },
      });

      return response.items || [];
    } catch (error) {
      console.error("Search pins error:", error);
      return [];
    }
  }

  /**
   * Get trending keywords for a product category
   */
  async getTrendingKeywords(region: string = "US", trendType: "growing" | "monthly_top" | "yearly_top" = "growing"): Promise<any[]> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/trends/keywords/rising", {
        method: "GET",
        params: {
          region,
          trend_type: trendType,
        },
      });

      return response.trends || [];
    } catch (error) {
      console.error("Get trending keywords error:", error);
      return [];
    }
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequest(
    endpoint: string,
    options: {
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      body?: string;
      params?: Record<string, string>;
    },
    retryCount = 0
  ): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

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
          "Authorization": `Bearer ${this.config.accessToken}`,
        },
        body: options.body,
      });

      // Update rate limit state
      this.updateRateLimitFromHeaders(response.headers);

      if (!response.ok) {
        const error = await response.json();

        // Handle rate limiting
        if (response.status === 429) {
          if (retryCount < this.maxRetries) {
            const delay = this.calculateRetryDelay(retryCount);
            console.log(`Pinterest rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.makeRequest(endpoint, options, retryCount + 1);
          }
        }

        // Handle temporary errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          console.log(`Pinterest server error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        // Handle expired token
        if (response.status === 401) {
          throw new Error("Access token expired. Please reconnect your Pinterest account.");
        }

        throw new Error(error.message || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < this.maxRetries && !(error instanceof Error && error.message.includes("token"))) {
        const delay = this.calculateRetryDelay(retryCount);
        console.log(`Pinterest request failed, retrying in ${delay}ms...`);
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
    const rateLimit = headers.get("x-ratelimit-limit");
    const rateLimitRemaining = headers.get("x-ratelimit-remaining");

    if (rateLimit && rateLimitRemaining) {
      this.rateLimitState.requestCount = parseInt(rateLimit) - parseInt(rateLimitRemaining);
      this.rateLimitState.hourlyLimit = parseInt(rateLimit);
    }
  }

  /**
   * Check rate limits before making request
   */
  private async checkRateLimit(): Promise<void> {
    // Pinterest has both hourly and daily limits
    const hourlyUsagePercent = (this.rateLimitState.requestCount / this.rateLimitState.hourlyLimit) * 100;

    // If we're at 90% of hourly limit, slow down
    if (hourlyUsagePercent >= 90) {
      console.log("Pinterest rate limit approaching 90%, slowing down requests...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Small delay between all requests
    await new Promise(resolve => setTimeout(resolve, 250));
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
      await this.makeRequest("/user_account", {
        method: "GET",
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
    try {
      if (!this.config.refreshToken) {
        return null;
      }

      const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.config.refreshToken,
        }).toString(),
      });

      const data = await response.json();
      return data.access_token || null;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  /**
   * Get user account info
   */
  async getUserAccount(): Promise<any> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest("/user_account", {
        method: "GET",
      });

      return response;
    } catch (error) {
      console.error("Get user account error:", error);
      return null;
    }
  }
}

/**
 * Factory function to create Pinterest connector from database
 */
export async function createPinterestConnector(userId: string): Promise<PinterestConnector | null> {
  try {
    const [platform] = await db
      .select()
      .from(socialPlatforms)
      .where(
        and(
          eq(socialPlatforms.userId, userId),
          eq(socialPlatforms.platform, "pinterest"),
          eq(socialPlatforms.connected, true)
        )
      );

    if (!platform || !platform.accessToken) {
      return null;
    }

    return new PinterestConnector({
      accessToken: platform.accessToken,
      refreshToken: platform.refreshToken || undefined,
    });
  } catch (error) {
    console.error("Failed to create Pinterest connector:", error);
    return null;
  }
}
