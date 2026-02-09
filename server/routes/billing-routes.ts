import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { stripeService } from "../services/stripe-service";
import { getUserUsage } from "../services/usage-tracking-service";
import { db } from "../db";
import { users, subscriptions, subscriptionPlans } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_PLANS = [
  {
    name: "Starter",
    price: 9.99,
    interval: "month",
    productLimit: 10,
    aiCreditsLimit: 100,
    teamMembersLimit: 1,
    storageLimit: 5120, // 5GB in MB
    features: { merchStudio: true, socialMedia: false, analytics: false },
  },
  {
    name: "Pro",
    price: 29.99,
    interval: "month",
    productLimit: null, // unlimited
    aiCreditsLimit: 500,
    teamMembersLimit: 5,
    storageLimit: 51200, // 50GB
    features: { merchStudio: true, socialMedia: true, analytics: true },
  },
  {
    name: "Enterprise",
    price: 99.99,
    interval: "month",
    productLimit: null,
    aiCreditsLimit: 2000,
    teamMembersLimit: null,
    storageLimit: 512000, // 500GB
    features: { merchStudio: true, socialMedia: true, analytics: true, priority: true },
  },
];

// Get plans
router.get("/plans", async (_req: Request, res: Response) => {
  try {
    const plans = await db.select().from(subscriptionPlans);
    if (plans.length === 0) {
      return res.json(DEFAULT_PLANS);
    }
    res.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
});

// Get current subscription
router.get("/subscription", requireAuth, async (req: Request, res: Response) => {
  try {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, req.userId!));
    if (!sub) {
      return res.json(null);
    }
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, sub.planId));
    res.json({ ...sub, plan });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
});

// Create checkout session
router.post("/checkout", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!stripeService.isConfigured()) {
      return res.status(503).json({ message: "Billing is not configured" });
    }

    const { planId } = req.body;
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));
    if (!plan?.stripePriceId) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeService.createCustomer(user?.email || "");
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, req.userId!));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = await stripeService.createCheckoutSession(
      customerId,
      plan.stripePriceId,
      `${baseUrl}/billing?success=true`,
      `${baseUrl}/billing?cancelled=true`
    );

    res.json({ url });
  } catch (error) {
    console.error("Create checkout error:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

// Create customer portal session
router.post("/portal", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!stripeService.isConfigured()) {
      return res.status(503).json({ message: "Billing is not configured" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ message: "No billing account found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = await stripeService.createPortalSession(user.stripeCustomerId, `${baseUrl}/billing`);

    res.json({ url });
  } catch (error) {
    console.error("Create portal error:", error);
    res.status(500).json({ message: "Failed to create portal session" });
  }
});

// Stripe webhook handler
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!stripeService.isConfigured()) {
      return res.status(503).send();
    }

    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") {
      return res.status(400).json({ message: "Missing signature" });
    }

    const event = stripeService.constructWebhookEvent(
      (req as any).rawBody as Buffer,
      sig
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId));

        if (user && subscriptionId) {
          const stripeSub = await stripeService.getSubscription(subscriptionId);
          const priceId = (stripeSub as any).items.data[0]?.price?.id;

          const [plan] = await db
            .select()
            .from(subscriptionPlans)
            .where(eq(subscriptionPlans.stripePriceId, priceId));

          if (plan) {
            await db.insert(subscriptions).values({
              userId: user.id,
              planId: plan.id,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              status: "active",
              currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
              currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        await db
          .update(subscriptions)
          .set({
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await db
          .update(subscriptions)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: "Webhook processing failed" });
  }
});

// Get usage
router.get("/usage", requireAuth, async (req: Request, res: Response) => {
  try {
    const usage = await getUserUsage(req.userId!);
    res.json(usage);
  } catch (error) {
    console.error("Get usage error:", error);
    res.status(500).json({ message: "Failed to fetch usage" });
  }
});

export default router;
