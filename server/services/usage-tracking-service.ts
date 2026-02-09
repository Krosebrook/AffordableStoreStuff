import { db } from "../db";
import { subscriptions, subscriptionPlans, products, aiGenerations, teamMembers } from "@shared/schema";
import { eq, and, count, gte } from "drizzle-orm";

export interface UsageData {
  aiCredits: { used: number; limit: number | null };
  products: { used: number; limit: number | null };
  teamMembers: { used: number; limit: number | null };
  storage: { usedMb: number; limitMb: number | null };
}

export async function getUserUsage(userId: string): Promise<UsageData> {
  // Get user's active subscription
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));

  let plan: any = null;
  if (sub) {
    const [p] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, sub.planId));
    plan = p;
  }

  // Count AI generations this billing period
  const periodStart = sub?.currentPeriodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [aiCount] = await db
    .select({ count: count() })
    .from(aiGenerations)
    .where(and(eq(aiGenerations.userId, userId), gte(aiGenerations.createdAt, periodStart)));

  // Count products
  const [productCount] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.status, "active"));

  // Count team members (across all teams user owns)
  const [memberCount] = await db
    .select({ count: count() })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));

  return {
    aiCredits: {
      used: aiCount?.count || 0,
      limit: plan?.aiCreditsLimit || null,
    },
    products: {
      used: productCount?.count || 0,
      limit: plan?.productLimit || null,
    },
    teamMembers: {
      used: memberCount?.count || 0,
      limit: plan?.teamMembersLimit || null,
    },
    storage: {
      usedMb: 0, // TODO: implement storage tracking
      limitMb: plan?.storageLimit || null,
    },
  };
}
