import { db } from "../db";
import { socialContent } from "@shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";

type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "pinterest";

const OPTIMAL_HOURS: Record<Platform, number[]> = {
  instagram: [9, 11, 13, 19],
  tiktok: [12, 15, 18, 21],
  youtube: [14, 17, 20],
  linkedin: [8, 10, 12, 17],
  pinterest: [9, 14, 20],
};

let intervalId: ReturnType<typeof setInterval> | null = null;

async function processScheduledContent(): Promise<number> {
  const now = new Date();
  let processed = 0;

  try {
    const pendingItems = await db
      .select()
      .from(socialContent)
      .where(
        and(
          eq(socialContent.status, "scheduled"),
          lte(socialContent.scheduledAt, now)
        )
      );

    for (const item of pendingItems) {
      try {
        // In production, this would call the platform API
        // For now, mark as published
        await db
          .update(socialContent)
          .set({
            status: "published",
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(socialContent.id, item.id));
        processed++;
      } catch (error) {
        console.error(`Failed to publish content ${item.id}:`, error);
        await db
          .update(socialContent)
          .set({
            status: "failed",
            failedReason: error instanceof Error ? error.message : "Unknown error",
            updatedAt: new Date(),
          })
          .where(eq(socialContent.id, item.id));
      }
    }

    if (processed > 0) {
      console.log(`[Scheduler] Published ${processed} scheduled items`);
    }
  } catch (error) {
    console.error("[Scheduler] Error processing scheduled content:", error);
  }

  return processed;
}

export function startScheduler(intervalMs = 60_000): void {
  if (intervalId) return;

  console.log(`[Scheduler] Starting with ${intervalMs}ms interval`);
  intervalId = setInterval(processScheduledContent, intervalMs);

  // Run once immediately
  processScheduledContent();
}

export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[Scheduler] Stopped");
  }
}

export function getOptimalTimes(platform: Platform): Date[] {
  const hours = OPTIMAL_HOURS[platform] || OPTIMAL_HOURS.instagram;
  const now = new Date();
  const times: Date[] = [];

  // Generate next 7 days of optimal times
  for (let day = 0; day < 7; day++) {
    for (const hour of hours) {
      const d = new Date(now);
      d.setDate(d.getDate() + day);
      d.setHours(hour, 0, 0, 0);
      if (d > now) {
        times.push(d);
      }
    }
  }

  return times.sort((a, b) => a.getTime() - b.getTime()).slice(0, 20);
}

export function getOptimalHours(platform: Platform): number[] {
  return OPTIMAL_HOURS[platform] || OPTIMAL_HOURS.instagram;
}
