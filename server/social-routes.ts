import { Router, type Request, type Response } from "express";
import { db } from "./db";
import { socialPlatforms, socialContent, socialAnalytics, insertSocialPlatformSchema, insertSocialContentSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "./middleware/auth";
import { getOptimalTimes, getOptimalHours } from "./services/scheduling-service";
import { getAnalyticsSummary, getEngagementData, getFollowerGrowth } from "./services/analytics-service";

const router = Router();

// ============ SOCIAL PLATFORM CONNECTIONS ============

// Get all platform connections for user
router.get("/platforms", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const platforms = await db.select().from(socialPlatforms).where(eq(socialPlatforms.userId, userId));
    res.json(platforms);
  } catch (error) {
    console.error("Get platforms error:", error);
    res.status(500).json({ message: "Failed to fetch platforms" });
  }
});

// Connect a platform
router.post("/platforms", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const data = insertSocialPlatformSchema.parse({ ...req.body, userId });

    // Check if platform already connected
    const [existing] = await db.select().from(socialPlatforms)
      .where(and(eq(socialPlatforms.userId, userId), eq(socialPlatforms.platform, data.platform)));

    if (existing) {
      // Update existing connection
      const [updated] = await db.update(socialPlatforms)
        .set({ ...data, connected: true, connectedAt: new Date(), updatedAt: new Date() })
        .where(eq(socialPlatforms.id, existing.id))
        .returning();
      return res.json(updated);
    }

    const [platform] = await db.insert(socialPlatforms).values(data).returning();
    res.status(201).json(platform);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Connect platform error:", error);
    res.status(500).json({ message: "Failed to connect platform" });
  }
});

// Disconnect a platform
router.delete("/platforms/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [updated] = await db.update(socialPlatforms)
      .set({ connected: false, accessToken: null, refreshToken: null, updatedAt: new Date() })
      .where(eq(socialPlatforms.id, String(req.params.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: "Platform not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Disconnect platform error:", error);
    res.status(500).json({ message: "Failed to disconnect platform" });
  }
});

// Get platform stats
router.get("/platforms/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const platforms = await db.select().from(socialPlatforms).where(eq(socialPlatforms.userId, userId));
    const connected = platforms.filter(p => p.connected);
    const totalFollowers = connected.reduce((sum, p) => sum + (p.followerCount || 0), 0);

    res.json({
      totalConnected: connected.length,
      totalFollowers,
      platforms: platforms.map(p => ({
        platform: p.platform,
        username: p.username,
        displayName: p.displayName,
        followerCount: p.followerCount,
        connected: p.connected,
      })),
    });
  } catch (error) {
    console.error("Get platform stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ============ SOCIAL CONTENT ============

// Get all content
router.get("/content", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const { status, platform, search } = req.query;
    let query = db.select().from(socialContent).where(eq(socialContent.userId, userId)).orderBy(desc(socialContent.updatedAt));

    const items = await query;

    let filtered = items;
    if (status && status !== "all") {
      filtered = filtered.filter(i => i.status === status);
    }
    if (platform) {
      filtered = filtered.filter(i => i.platforms?.includes(platform as string));
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) || (i.caption || "").toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error("Get content error:", error);
    res.status(500).json({ message: "Failed to fetch content" });
  }
});

// Get content by ID
router.get("/content/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [item] = await db.select().from(socialContent).where(eq(socialContent.id, String(req.params.id)));
    if (!item) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Get content error:", error);
    res.status(500).json({ message: "Failed to fetch content" });
  }
});

// Create content
router.post("/content", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const data = insertSocialContentSchema.parse({ ...req.body, userId });
    const [item] = await db.insert(socialContent).values(data).returning();
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Create content error:", error);
    res.status(500).json({ message: "Failed to create content" });
  }
});

// Update content
router.patch("/content/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [item] = await db.update(socialContent)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(socialContent.id, String(req.params.id)))
      .returning();
    if (!item) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Update content error:", error);
    res.status(500).json({ message: "Failed to update content" });
  }
});

// Delete content
router.delete("/content/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await db.delete(socialContent).where(eq(socialContent.id, String(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({ message: "Failed to delete content" });
  }
});

// Publish content
router.post("/content/:id/publish", requireAuth, async (req: Request, res: Response) => {
  try {
    const [item] = await db.update(socialContent)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(socialContent.id, String(req.params.id)))
      .returning();
    if (!item) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Publish content error:", error);
    res.status(500).json({ message: "Failed to publish content" });
  }
});

// Schedule content
router.post("/content/:id/schedule", requireAuth, async (req: Request, res: Response) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt is required" });
    }

    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      return res.status(400).json({ message: "Schedule time must be in the future" });
    }

    const [item] = await db.update(socialContent)
      .set({ status: "scheduled", scheduledAt: scheduleDate, updatedAt: new Date() })
      .where(eq(socialContent.id, String(req.params.id)))
      .returning();
    if (!item) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Schedule content error:", error);
    res.status(500).json({ message: "Failed to schedule content" });
  }
});

// Get content stats
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const items = await db.select().from(socialContent).where(eq(socialContent.userId, userId));
    const stats = {
      total: items.length,
      drafts: items.filter(i => i.status === "draft").length,
      scheduled: items.filter(i => i.status === "scheduled").length,
      published: items.filter(i => i.status === "published").length,
      failed: items.filter(i => i.status === "failed").length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get content stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ============ ANALYTICS ============

router.get("/analytics", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const snapshots = await db.select().from(socialAnalytics)
      .where(eq(socialAnalytics.userId, userId))
      .orderBy(desc(socialAnalytics.snapshotDate));

    res.json(snapshots);
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// ============ SCHEDULING ============

// Get optimal posting times for a platform
router.get("/scheduling/optimal-times", requireAuth, async (req: Request, res: Response) => {
  try {
    const platform = req.query.platform as string;
    if (!platform) {
      return res.status(400).json({ message: "platform query param is required" });
    }
    const times = getOptimalTimes(platform as any);
    const hours = getOptimalHours(platform as any);
    res.json({ platform, optimalHours: hours, nextOptimalTimes: times });
  } catch (error) {
    console.error("Get optimal times error:", error);
    res.status(500).json({ message: "Failed to get optimal times" });
  }
});

// Get scheduling calendar
router.get("/scheduling/calendar", requireAuth, async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    const userId = req.userId!;

    let items = await db.select().from(socialContent)
      .where(eq(socialContent.userId, userId));

    if (start) {
      items = items.filter(i => i.scheduledAt && i.scheduledAt >= new Date(start as string));
    }
    if (end) {
      items = items.filter(i => i.scheduledAt && i.scheduledAt <= new Date(end as string));
    }

    res.json(items.filter(i => i.status === "scheduled" || i.status === "published"));
  } catch (error) {
    console.error("Get calendar error:", error);
    res.status(500).json({ message: "Failed to get calendar" });
  }
});

// ============ ENHANCED ANALYTICS ============

// Get analytics summary
router.get("/analytics/summary", requireAuth, async (req: Request, res: Response) => {
  try {
    const summary = await getAnalyticsSummary(req.userId!);
    res.json(summary);
  } catch (error) {
    console.error("Get analytics summary error:", error);
    res.status(500).json({ message: "Failed to get analytics summary" });
  }
});

// Get engagement data
router.get("/analytics/engagement", requireAuth, async (req: Request, res: Response) => {
  try {
    const platform = req.query.platform as string | undefined;
    const data = await getEngagementData(req.userId!, platform);
    res.json(data);
  } catch (error) {
    console.error("Get engagement error:", error);
    res.status(500).json({ message: "Failed to get engagement data" });
  }
});

// Get follower growth
router.get("/analytics/followers", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await getFollowerGrowth(req.userId!);
    res.json(data);
  } catch (error) {
    console.error("Get follower growth error:", error);
    res.status(500).json({ message: "Failed to get follower data" });
  }
});

export default router;
