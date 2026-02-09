import { db } from "../db";
import { socialContent, socialAnalytics, socialPlatforms } from "@shared/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

export interface AnalyticsSummary {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  failedPosts: number;
  platformBreakdown: { platform: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const allContent = await db
    .select()
    .from(socialContent)
    .where(eq(socialContent.userId, userId));

  const platformCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  for (const item of allContent) {
    // Platform breakdown
    for (const p of item.platforms || []) {
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    }

    // Recent activity (last 30 days)
    const date = (item.publishedAt || item.createdAt).toISOString().split("T")[0];
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  }

  return {
    totalPosts: allContent.length,
    publishedPosts: allContent.filter((c) => c.status === "published").length,
    scheduledPosts: allContent.filter((c) => c.status === "scheduled").length,
    failedPosts: allContent.filter((c) => c.status === "failed").length,
    platformBreakdown: Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
    })),
    recentActivity: Object.entries(dateCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, count })),
  };
}

export async function getEngagementData(userId: string, platform?: string) {
  let query = db
    .select()
    .from(socialAnalytics)
    .where(eq(socialAnalytics.userId, userId))
    .orderBy(desc(socialAnalytics.snapshotDate));

  const snapshots = await query;

  if (platform) {
    return snapshots.filter((s) => s.platform === platform);
  }

  return snapshots;
}

export async function getFollowerGrowth(userId: string) {
  const platforms = await db
    .select()
    .from(socialPlatforms)
    .where(eq(socialPlatforms.userId, userId));

  return platforms.map((p) => ({
    platform: p.platform,
    username: p.username,
    followers: p.followerCount || 0,
    connected: p.connected,
  }));
}
