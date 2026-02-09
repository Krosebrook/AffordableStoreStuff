/**
 * Publishing Queue Routes
 * API endpoints for managing the multi-platform publishing queue
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { publishingQueueService } from "../services/publishing-queue";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

// Validation schemas
const addToQueueSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  platform: z.string().min(1, "Platform is required"),
  priority: z.number().int().min(1).max(10).optional(),
  scheduledFor: z.string().datetime().optional(),
  safeguardsPassed: z.boolean().optional(),
  trademarkCleared: z.boolean().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
});

const batchAddToQueueSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  priority: z.number().int().min(1).max(10).optional(),
  scheduledFor: z.string().datetime().optional(),
  safeguardsPassed: z.boolean().optional(),
  trademarkCleared: z.boolean().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "processing", "published", "failed", "rejected"]),
  errorMessage: z.string().optional(),
  externalId: z.string().optional(),
  externalUrl: z.string().url().optional(),
});

/**
 * GET /api/publishing-queue
 * Get all queue items with optional status filter
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    if (status) {
      const items = await publishingQueueService.getQueueByStatus(
        status as any,
        limit
      );
      return res.json(items);
    }

    // Get all pending items by default
    const items = await publishingQueueService.getNextItems(limit);
    res.json(items);
  } catch (error) {
    console.error("[PublishingQueue] Get queue error:", error);
    res.status(500).json({
      message: "Failed to fetch queue items",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/publishing-queue/stats
 * Get queue statistics
 */
router.get("/stats", requireAuth, async (_req: Request, res: Response) => {
  try {
    const stats = await publishingQueueService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("[PublishingQueue] Get stats error:", error);
    res.status(500).json({
      message: "Failed to fetch queue statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/publishing-queue/product/:productId
 * Get queue items for a specific product
 */
router.get(
  "/product/:productId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const items = await publishingQueueService.getProductQueue(productId);
      res.json(items);
    } catch (error) {
      console.error("[PublishingQueue] Get product queue error:", error);
      res.status(500).json({
        message: "Failed to fetch product queue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * GET /api/publishing-queue/:id
 * Get single queue item by ID
 */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const items = await publishingQueueService.getQueueByStatus("pending", 1000);
    const item = items.find((i) => i.id === id);

    if (!item) {
      return res.status(404).json({ message: "Queue item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("[PublishingQueue] Get queue item error:", error);
    res.status(500).json({
      message: "Failed to fetch queue item",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/publishing-queue
 * Add item to publishing queue
 */
router.post(
  "/",
  requireAuth,
  validateBody(addToQueueSchema),
  async (req: Request, res: Response) => {
    try {
      const { productId, platform, priority, scheduledFor, ...options } = req.body;

      const item = await publishingQueueService.addToQueue(productId, platform, {
        priority,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        ...options,
      });

      res.status(201).json({
        message: "Added to publishing queue",
        item,
      });
    } catch (error) {
      console.error("[PublishingQueue] Add to queue error:", error);
      res.status(500).json({
        message: "Failed to add to queue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * POST /api/publishing-queue/batch
 * Add multiple platforms to queue for a product
 */
router.post(
  "/batch",
  requireAuth,
  validateBody(batchAddToQueueSchema),
  async (req: Request, res: Response) => {
    try {
      const { productId, platforms, priority, scheduledFor, ...options } = req.body;

      const items = await publishingQueueService.addBatchToQueue(
        productId,
        platforms,
        {
          priority,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          ...options,
        }
      );

      res.status(201).json({
        message: `Added to publishing queue for ${platforms.length} platforms`,
        items,
      });
    } catch (error) {
      console.error("[PublishingQueue] Batch add to queue error:", error);
      res.status(500).json({
        message: "Failed to add batch to queue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * PATCH /api/publishing-queue/:id/status
 * Update queue item status
 */
router.patch(
  "/:id/status",
  requireAuth,
  validateBody(updateStatusSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, errorMessage, externalId, externalUrl } = req.body;

      const item = await publishingQueueService.updateStatus(id, status, {
        errorMessage,
        externalId,
        externalUrl,
        publishedAt: status === "published" ? new Date() : undefined,
      });

      if (!item) {
        return res.status(404).json({ message: "Queue item not found" });
      }

      res.json({
        message: "Queue item status updated",
        item,
      });
    } catch (error) {
      console.error("[PublishingQueue] Update status error:", error);
      res.status(500).json({
        message: "Failed to update queue item status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * POST /api/publishing-queue/:id/retry
 * Retry failed queue item
 */
router.post("/:id/retry", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await publishingQueueService.retryItem(id);

    if (!success) {
      return res.status(400).json({
        message: "Cannot retry this item (not in failed status or not found)",
      });
    }

    res.json({
      message: "Queue item scheduled for retry",
      success: true,
    });
  } catch (error) {
    console.error("[PublishingQueue] Retry item error:", error);
    res.status(500).json({
      message: "Failed to retry queue item",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /api/publishing-queue/:id
 * Cancel pending queue item
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await publishingQueueService.cancelItem(id);

    if (!success) {
      return res.status(400).json({
        message: "Cannot cancel this item (not pending/failed or not found)",
      });
    }

    res.json({
      message: "Queue item cancelled",
      success: true,
    });
  } catch (error) {
    console.error("[PublishingQueue] Cancel item error:", error);
    res.status(500).json({
      message: "Failed to cancel queue item",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/publishing-queue/process
 * Manually trigger queue processing (admin only)
 */
router.post("/process", requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin check here
    const result = await publishingQueueService.processPendingItems();

    res.json({
      message: "Queue processing completed",
      ...result,
    });
  } catch (error) {
    console.error("[PublishingQueue] Process queue error:", error);
    res.status(500).json({
      message: "Failed to process queue",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/publishing-queue/rate-limit/:platform
 * Check rate limit status for a platform
 */
router.get(
  "/rate-limit/:platform",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const endpoint = (req.query.endpoint as string) || "default";

      const rateLimitInfo = await publishingQueueService.checkRateLimit(
        platform,
        endpoint
      );

      res.json(rateLimitInfo);
    } catch (error) {
      console.error("[PublishingQueue] Check rate limit error:", error);
      res.status(500).json({
        message: "Failed to check rate limit",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
