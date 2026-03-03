import { db } from "../db";
import { publishingQueue } from "../../shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";

export interface QueuedItem {
  productId: number;
  platform: string;
  priority?: number;
  scheduledFor?: Date;
}

export async function addToQueue(item: QueuedItem) {
  const [entry] = await db
    .insert(publishingQueue)
    .values({
      productId: item.productId,
      platform: item.platform,
      priority: item.priority || 5,
      scheduledFor: item.scheduledFor || null,
      status: item.scheduledFor ? "pending" : "processing",
    })
    .returning();
  return entry;
}

export async function getQueueItems(status?: string) {
  if (status) {
    return await db
      .select()
      .from(publishingQueue)
      .where(eq(publishingQueue.status, status))
      .orderBy(publishingQueue.priority, publishingQueue.createdAt);
  }
  return await db
    .select()
    .from(publishingQueue)
    .orderBy(publishingQueue.priority, publishingQueue.createdAt);
}

export async function getScheduledItems() {
  return await db
    .select()
    .from(publishingQueue)
    .where(
      and(
        eq(publishingQueue.status, "pending"),
        lte(publishingQueue.scheduledFor, new Date())
      )
    )
    .orderBy(publishingQueue.priority);
}

export async function updateQueueItemStatus(
  id: string,
  status: string,
  extras?: { externalId?: string; externalUrl?: string; errorMessage?: string }
) {
  const updateData: Record<string, any> = { status };
  if (status === "published") {
    updateData.publishedAt = new Date();
  }
  if (extras?.externalId) updateData.externalId = extras.externalId;
  if (extras?.externalUrl) updateData.externalUrl = extras.externalUrl;
  if (extras?.errorMessage) updateData.errorMessage = extras.errorMessage;

  const [updated] = await db
    .update(publishingQueue)
    .set(updateData)
    .where(eq(publishingQueue.id, id))
    .returning();
  return updated;
}

export async function retryQueueItem(id: string) {
  const [updated] = await db
    .update(publishingQueue)
    .set({
      status: "pending",
      errorMessage: null,
      retryCount: sql`${publishingQueue.retryCount} + 1`,
    })
    .where(eq(publishingQueue.id, id))
    .returning();
  return updated;
}

export async function removeFromQueue(id: string) {
  await db.delete(publishingQueue).where(eq(publishingQueue.id, id));
}

export async function getQueueStats() {
  const items = await db.select().from(publishingQueue);
  return {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    processing: items.filter((i) => i.status === "processing").length,
    published: items.filter((i) => i.status === "published").length,
    failed: items.filter((i) => i.status === "failed").length,
  };
}
