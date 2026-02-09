/**
 * Publishing Queue Service
 * Manages multi-platform publishing with queue processing, retry logic, and rate limiting
 */

import { db } from "../db";
import { publishingQueue, products, platformConnections, apiRateLimits } from "@shared/schema";
import { eq, and, or, lte, desc, asc } from "drizzle-orm";

export type PublishingStatus = "pending" | "processing" | "published" | "failed" | "rejected";
export type PublishingPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface QueueItem {
  id: string;
  productId: string;
  platform: string;
  status: PublishingStatus;
  priority: number;
  retryCount: number;
  errorMessage?: string | null;
  scheduledFor?: Date | null;
  publishedAt?: Date | null;
  createdAt: Date;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

export interface RateLimitInfo {
  platform: string;
  endpoint: string;
  requestCount: number;
  limitPerMinute: number;
  windowStart: Date;
  canMakeRequest: boolean;
  retryAfterMs?: number;
}

// Configuration for retry logic
const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 300000, // 5 minutes
  backoffMultiplier: 2,
};

// Rate limits per platform (requests per minute)
const PLATFORM_RATE_LIMITS: Record<string, number> = {
  printify: 60,
  printful: 120,
  etsy: 10,
  shopify: 40,
  amazon: 20,
  redbubble: 30,
  teespring: 20,
  default: 60,
};

export class PublishingQueueService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Add item to publishing queue
   */
  async addToQueue(
    productId: string,
    platform: string,
    options: {
      priority?: PublishingPriority;
      scheduledFor?: Date;
      safeguardsPassed?: boolean;
      trademarkCleared?: boolean;
      qualityScore?: number;
    } = {}
  ): Promise<QueueItem> {
    const [item] = await db
      .insert(publishingQueue)
      .values({
        productId,
        platform,
        priority: options.priority || 5,
        scheduledFor: options.scheduledFor,
        safeguardsPassed: options.safeguardsPassed || false,
        trademarkCleared: options.trademarkCleared || false,
        qualityScore: options.qualityScore,
        status: "pending",
        retryCount: 0,
      })
      .returning();

    console.log(`[PublishingQueue] Added product ${productId} to ${platform} queue`);
    return item as QueueItem;
  }

  /**
   * Add multiple items to queue (batch operation)
   */
  async addBatchToQueue(
    productId: string,
    platforms: string[],
    options: {
      priority?: PublishingPriority;
      scheduledFor?: Date;
      safeguardsPassed?: boolean;
      trademarkCleared?: boolean;
      qualityScore?: number;
    } = {}
  ): Promise<QueueItem[]> {
    const items = await db
      .insert(publishingQueue)
      .values(
        platforms.map((platform) => ({
          productId,
          platform,
          priority: options.priority || 5,
          scheduledFor: options.scheduledFor,
          safeguardsPassed: options.safeguardsPassed || false,
          trademarkCleared: options.trademarkCleared || false,
          qualityScore: options.qualityScore,
          status: "pending" as const,
          retryCount: 0,
        }))
      )
      .returning();

    console.log(`[PublishingQueue] Added product ${productId} to ${platforms.length} platforms`);
    return items as QueueItem[];
  }

  /**
   * Get queue items by status
   */
  async getQueueByStatus(status: PublishingStatus, limit = 50): Promise<QueueItem[]> {
    const items = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.status, status))
      .orderBy(desc(publishingQueue.priority), asc(publishingQueue.createdAt))
      .limit(limit);

    return items as QueueItem[];
  }

  /**
   * Get queue items for a specific product
   */
  async getProductQueue(productId: string): Promise<QueueItem[]> {
    const items = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.productId, productId))
      .orderBy(desc(publishingQueue.createdAt));

    return items as QueueItem[];
  }

  /**
   * Get next items to process
   */
  async getNextItems(limit = 10): Promise<QueueItem[]> {
    const now = new Date();

    const items = await db
      .select()
      .from(publishingQueue)
      .where(
        and(
          or(
            eq(publishingQueue.status, "pending"),
            eq(publishingQueue.status, "failed")
          ),
          or(
            lte(publishingQueue.scheduledFor, now),
            eq(publishingQueue.scheduledFor, null)
          )
        )
      )
      .orderBy(desc(publishingQueue.priority), asc(publishingQueue.createdAt))
      .limit(limit);

    return items as QueueItem[];
  }

  /**
   * Update queue item status
   */
  async updateStatus(
    id: string,
    status: PublishingStatus,
    options: {
      errorMessage?: string;
      externalId?: string;
      externalUrl?: string;
      publishedAt?: Date;
    } = {}
  ): Promise<QueueItem | null> {
    const [item] = await db
      .update(publishingQueue)
      .set({
        status,
        errorMessage: options.errorMessage,
        externalId: options.externalId,
        externalUrl: options.externalUrl,
        publishedAt: options.publishedAt,
      })
      .where(eq(publishingQueue.id, id))
      .returning();

    return item as QueueItem | null;
  }

  /**
   * Increment retry count for failed item
   */
  async incrementRetry(id: string, errorMessage: string): Promise<QueueItem | null> {
    const [item] = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.id, id));

    if (!item) return null;

    const newRetryCount = (item.retryCount || 0) + 1;
    const shouldRetry = newRetryCount < RETRY_CONFIG.maxRetries;

    const [updated] = await db
      .update(publishingQueue)
      .set({
        retryCount: newRetryCount,
        status: shouldRetry ? "pending" : "failed",
        errorMessage,
        scheduledFor: shouldRetry
          ? this.calculateNextRetryTime(newRetryCount)
          : item.scheduledFor,
      })
      .where(eq(publishingQueue.id, id))
      .returning();

    console.log(
      `[PublishingQueue] Retry ${newRetryCount}/${RETRY_CONFIG.maxRetries} for item ${id}`
    );

    return updated as QueueItem | null;
  }

  /**
   * Calculate next retry time with exponential backoff
   */
  private calculateNextRetryTime(retryCount: number): Date {
    const delayMs = Math.min(
      RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount - 1),
      RETRY_CONFIG.maxDelayMs
    );

    const nextTime = new Date(Date.now() + delayMs);
    console.log(
      `[PublishingQueue] Next retry in ${Math.round(delayMs / 1000)}s at ${nextTime.toISOString()}`
    );

    return nextTime;
  }

  /**
   * Check rate limits for a platform
   */
  async checkRateLimit(platform: string, endpoint = "default"): Promise<RateLimitInfo> {
    const [limit] = await db
      .select()
      .from(apiRateLimits)
      .where(
        and(
          eq(apiRateLimits.platform, platform),
          eq(apiRateLimits.endpoint, endpoint)
        )
      );

    const now = new Date();
    const limitPerMinute = PLATFORM_RATE_LIMITS[platform] || PLATFORM_RATE_LIMITS.default;

    if (!limit) {
      // Create new rate limit tracking
      await db.insert(apiRateLimits).values({
        platform,
        endpoint,
        requestCount: 0,
        limitPerMinute,
        windowStart: now,
      });

      return {
        platform,
        endpoint,
        requestCount: 0,
        limitPerMinute,
        windowStart: now,
        canMakeRequest: true,
      };
    }

    // Check if window has expired (1 minute)
    const windowAge = now.getTime() - new Date(limit.windowStart).getTime();
    const windowExpired = windowAge > 60000;

    if (windowExpired) {
      // Reset window
      await db
        .update(apiRateLimits)
        .set({
          requestCount: 0,
          windowStart: now,
        })
        .where(eq(apiRateLimits.id, limit.id));

      return {
        platform,
        endpoint,
        requestCount: 0,
        limitPerMinute,
        windowStart: now,
        canMakeRequest: true,
      };
    }

    const canMakeRequest = (limit.requestCount || 0) < limitPerMinute;
    const retryAfterMs = canMakeRequest ? undefined : 60000 - windowAge;

    return {
      platform,
      endpoint,
      requestCount: limit.requestCount || 0,
      limitPerMinute,
      windowStart: new Date(limit.windowStart),
      canMakeRequest,
      retryAfterMs,
    };
  }

  /**
   * Increment rate limit counter
   */
  async incrementRateLimit(platform: string, endpoint = "default"): Promise<void> {
    const [limit] = await db
      .select()
      .from(apiRateLimits)
      .where(
        and(
          eq(apiRateLimits.platform, platform),
          eq(apiRateLimits.endpoint, endpoint)
        )
      );

    if (limit) {
      await db
        .update(apiRateLimits)
        .set({
          requestCount: (limit.requestCount || 0) + 1,
          lastRequestAt: new Date(),
        })
        .where(eq(apiRateLimits.id, limit.id));
    }
  }

  /**
   * Process queue item (to be implemented by platform-specific handlers)
   */
  async processItem(item: QueueItem): Promise<PublishResult> {
    try {
      // Check rate limits
      const rateLimitInfo = await this.checkRateLimit(item.platform);
      if (!rateLimitInfo.canMakeRequest) {
        console.log(
          `[PublishingQueue] Rate limit reached for ${item.platform}, retrying in ${Math.round((rateLimitInfo.retryAfterMs || 0) / 1000)}s`
        );
        return {
          success: false,
          error: `Rate limit exceeded. Retry after ${rateLimitInfo.retryAfterMs}ms`,
        };
      }

      // Get product details
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      if (!product) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      // Check platform connection
      const [connection] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, item.platform));

      if (!connection || connection.status !== "connected") {
        return {
          success: false,
          error: `Platform ${item.platform} not connected`,
        };
      }

      // Increment rate limit
      await this.incrementRateLimit(item.platform);

      // TODO: Implement platform-specific publishing logic here
      // This should call the appropriate platform connector
      // For now, we'll return a placeholder success
      console.log(
        `[PublishingQueue] Publishing product ${product.name} to ${item.platform}`
      );

      // Simulate publishing (replace with actual platform API calls)
      const result: PublishResult = {
        success: true,
        externalId: `${item.platform}-${Date.now()}`,
        externalUrl: `https://${item.platform}.com/products/${item.productId}`,
      };

      return result;
    } catch (error) {
      console.error(`[PublishingQueue] Error processing item ${item.id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process all pending items in queue
   */
  async processPendingItems(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    if (this.isProcessing) {
      console.log("[PublishingQueue] Already processing, skipping...");
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const items = await this.getNextItems(10);

      for (const item of items) {
        try {
          // Update status to processing
          await this.updateStatus(item.id, "processing");

          // Process the item
          const result = await this.processItem(item);

          if (result.success) {
            await this.updateStatus(item.id, "published", {
              externalId: result.externalId,
              externalUrl: result.externalUrl,
              publishedAt: new Date(),
            });
            succeeded++;
          } else {
            await this.incrementRetry(item.id, result.error || "Unknown error");
            failed++;
          }

          processed++;
        } catch (error) {
          console.error(`[PublishingQueue] Error processing item ${item.id}:`, error);
          await this.incrementRetry(
            item.id,
            error instanceof Error ? error.message : "Unknown error"
          );
          failed++;
          processed++;
        }
      }

      if (processed > 0) {
        console.log(
          `[PublishingQueue] Processed ${processed} items: ${succeeded} succeeded, ${failed} failed`
        );
      }
    } finally {
      this.isProcessing = false;
    }

    return { processed, succeeded, failed };
  }

  /**
   * Start automatic queue processing
   */
  startProcessing(intervalMs = 30000): void {
    if (this.processingInterval) {
      console.log("[PublishingQueue] Already running");
      return;
    }

    console.log(`[PublishingQueue] Starting with ${intervalMs}ms interval`);
    this.processingInterval = setInterval(
      () => this.processPendingItems(),
      intervalMs
    );

    // Process immediately
    this.processPendingItems();
  }

  /**
   * Stop automatic queue processing
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log("[PublishingQueue] Stopped");
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    published: number;
    failed: number;
    total: number;
  }> {
    const [pending] = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.status, "pending"));

    const [processing] = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.status, "processing"));

    const [published] = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.status, "published"));

    const [failedItems] = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.status, "failed"));

    return {
      pending: pending ? 1 : 0,
      processing: processing ? 1 : 0,
      published: published ? 1 : 0,
      failed: failedItems ? 1 : 0,
      total: (pending ? 1 : 0) + (processing ? 1 : 0) + (published ? 1 : 0) + (failedItems ? 1 : 0),
    };
  }

  /**
   * Cancel pending queue item
   */
  async cancelItem(id: string): Promise<boolean> {
    const [item] = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.id, id));

    if (!item || (item.status !== "pending" && item.status !== "failed")) {
      return false;
    }

    await db
      .update(publishingQueue)
      .set({ status: "rejected" })
      .where(eq(publishingQueue.id, id));

    console.log(`[PublishingQueue] Cancelled item ${id}`);
    return true;
  }

  /**
   * Retry failed item immediately
   */
  async retryItem(id: string): Promise<boolean> {
    const [item] = await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.id, id));

    if (!item || item.status !== "failed") {
      return false;
    }

    await db
      .update(publishingQueue)
      .set({
        status: "pending",
        scheduledFor: new Date(),
        errorMessage: null,
      })
      .where(eq(publishingQueue.id, id));

    console.log(`[PublishingQueue] Retrying item ${id}`);
    return true;
  }
}

// Singleton instance
export const publishingQueueService = new PublishingQueueService();
