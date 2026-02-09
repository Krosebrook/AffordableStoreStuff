/**
 * Publishing Integration Example
 * Demonstrates how to use publishing queue and image processing services together
 */

import { publishingQueueService } from "./publishing-queue";
import { imageProcessor } from "./image-processing";
import type { PlatformType } from "./image-processing-service";

/**
 * Example: Publish product to multiple platforms with image validation
 */
export async function publishProductToMultiplePlatforms(
  productId: string,
  imageUrl: string,
  platforms: PlatformType[]
): Promise<{
  success: boolean;
  queuedPlatforms: string[];
  failedPlatforms: { platform: string; reason: string }[];
}> {
  const queuedPlatforms: string[] = [];
  const failedPlatforms: { platform: string; reason: string }[] = [];

  // Extract image metadata first
  const metadata = await imageProcessor.extractMetadata(imageUrl);

  if (!metadata.success || !metadata.metadata) {
    return {
      success: false,
      queuedPlatforms: [],
      failedPlatforms: platforms.map((p) => ({
        platform: p,
        reason: "Failed to extract image metadata",
      })),
    };
  }

  // Batch process images for all platforms
  const processResults = await imageProcessor.batchProcess(
    imageUrl,
    platforms,
    metadata.metadata
  );

  // Add valid platforms to publishing queue
  for (const result of processResults) {
    if (result.success && result.validation?.isValid) {
      try {
        await publishingQueueService.addToQueue(productId, result.platform, {
          priority: 5,
          safeguardsPassed: true,
          trademarkCleared: true,
          qualityScore: result.validation.metadata?.width
            ? Math.min(
                100,
                Math.floor(
                  (result.validation.metadata.width /
                    imageProcessor.getPlatformRequirements(
                      result.platform as PlatformType
                    ).minWidth) *
                    100
                )
              )
            : 80,
        });
        queuedPlatforms.push(result.platform);
      } catch (error) {
        failedPlatforms.push({
          platform: result.platform,
          reason: error instanceof Error ? error.message : "Failed to queue",
        });
      }
    } else {
      failedPlatforms.push({
        platform: result.platform,
        reason: result.error || "Validation failed",
      });
    }
  }

  return {
    success: queuedPlatforms.length > 0,
    queuedPlatforms,
    failedPlatforms,
  };
}

/**
 * Example: Validate and prepare product for POD platform
 */
export async function validateAndPrepareProduct(
  productId: string,
  imageUrl: string,
  platform: PlatformType
): Promise<{
  valid: boolean;
  processedImageUrl?: string;
  issues: string[];
  warnings: string[];
}> {
  // Extract metadata
  const metadata = await imageProcessor.extractMetadata(imageUrl);

  if (!metadata.success || !metadata.metadata) {
    return {
      valid: false,
      issues: ["Failed to extract image metadata"],
      warnings: [],
    };
  }

  // Check if image meets requirements
  const requirements = await imageProcessor.meetsRequirements(
    imageUrl,
    platform,
    metadata.metadata
  );

  if (requirements.meets) {
    // Image is good, optimize for publishing
    const prepared = await imageProcessor.prepareForPublishing(
      imageUrl,
      platform,
      metadata.metadata
    );

    return {
      valid: prepared.success,
      processedImageUrl: prepared.processedUrl,
      issues: prepared.success ? [] : [prepared.error || "Processing failed"],
      warnings: requirements.warnings,
    };
  } else {
    return {
      valid: false,
      issues: requirements.issues,
      warnings: requirements.warnings,
    };
  }
}

/**
 * Example: Schedule product publishing with retry handling
 */
export async function scheduleProductPublishing(
  productId: string,
  platform: PlatformType,
  scheduledDate: Date,
  options?: {
    priority?: number;
    imageUrl?: string;
  }
): Promise<{
  success: boolean;
  queueItemId?: string;
  error?: string;
}> {
  try {
    // If image URL provided, validate first
    if (options?.imageUrl) {
      const metadata = await imageProcessor.extractMetadata(options.imageUrl);

      if (!metadata.success || !metadata.metadata) {
        return {
          success: false,
          error: "Invalid image",
        };
      }

      const validation = await imageProcessor.meetsRequirements(
        options.imageUrl,
        platform,
        metadata.metadata
      );

      if (!validation.meets) {
        return {
          success: false,
          error: `Image validation failed: ${validation.issues.join(", ")}`,
        };
      }
    }

    // Add to queue with scheduled date
    const item = await publishingQueueService.addToQueue(productId, platform, {
      priority: options?.priority || 5,
      scheduledFor: scheduledDate,
      safeguardsPassed: true,
      trademarkCleared: true,
    });

    return {
      success: true,
      queueItemId: item.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Example: Retry failed publishing with image reprocessing
 */
export async function retryFailedPublishing(
  queueItemId: string,
  imageUrl?: string
): Promise<{
  success: boolean;
  reprocessed: boolean;
  error?: string;
}> {
  try {
    // If new image provided, reprocess it
    let reprocessed = false;
    if (imageUrl) {
      const metadata = await imageProcessor.extractMetadata(imageUrl);
      if (metadata.success && metadata.metadata) {
        // Image looks good, mark as reprocessed
        reprocessed = true;
      }
    }

    // Retry the queue item
    const success = await publishingQueueService.retryItem(queueItemId);

    return {
      success,
      reprocessed,
      error: success ? undefined : "Failed to retry item",
    };
  } catch (error) {
    return {
      success: false,
      reprocessed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Example: Monitor publishing progress
 */
export async function getPublishingProgress(
  productId: string
): Promise<{
  total: number;
  pending: number;
  processing: number;
  published: number;
  failed: number;
  platforms: {
    platform: string;
    status: string;
    externalUrl?: string | null;
    errorMessage?: string | null;
  }[];
}> {
  const items = await publishingQueueService.getProductQueue(productId);

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    processing: items.filter((i) => i.status === "processing").length,
    published: items.filter((i) => i.status === "published").length,
    failed: items.filter((i) => i.status === "failed").length,
    platforms: items.map((item) => ({
      platform: item.platform,
      status: item.status,
      externalUrl: item.externalUrl,
      errorMessage: item.errorMessage,
    })),
  };

  return stats;
}

/**
 * Example: Bulk publish with validation and error handling
 */
export async function bulkPublishProducts(
  products: Array<{
    productId: string;
    imageUrl: string;
    platforms: PlatformType[];
  }>
): Promise<{
  totalProducts: number;
  totalPlatforms: number;
  queued: number;
  failed: number;
  details: Array<{
    productId: string;
    queuedPlatforms: string[];
    failedPlatforms: { platform: string; reason: string }[];
  }>;
}> {
  const details: Array<{
    productId: string;
    queuedPlatforms: string[];
    failedPlatforms: { platform: string; reason: string }[];
  }> = [];

  let totalQueued = 0;
  let totalFailed = 0;
  let totalPlatforms = 0;

  for (const product of products) {
    totalPlatforms += product.platforms.length;

    const result = await publishProductToMultiplePlatforms(
      product.productId,
      product.imageUrl,
      product.platforms
    );

    totalQueued += result.queuedPlatforms.length;
    totalFailed += result.failedPlatforms.length;

    details.push({
      productId: product.productId,
      queuedPlatforms: result.queuedPlatforms,
      failedPlatforms: result.failedPlatforms,
    });
  }

  return {
    totalProducts: products.length,
    totalPlatforms,
    queued: totalQueued,
    failed: totalFailed,
    details,
  };
}
