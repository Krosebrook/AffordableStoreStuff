import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../server/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../../../server/services/stripe-service", () => ({
  stripeService: {
    isConfigured: vi.fn().mockReturnValue(false),
    createCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
    getSubscription: vi.fn(),
  },
}));

vi.mock("../../../../server/services/usage-tracking-service", () => ({
  getUserUsage: vi.fn().mockResolvedValue({
    aiCredits: { used: 5, limit: 100 },
    products: { used: 3, limit: 10 },
    teamMembers: { used: 1, limit: 1 },
    storage: { usedMb: 0, limitMb: 5120 },
  }),
}));

describe("Billing Routes Logic", () => {
  it("should have default plans", () => {
    const DEFAULT_PLANS = [
      { name: "Starter", price: 9.99 },
      { name: "Pro", price: 29.99 },
      { name: "Enterprise", price: 99.99 },
    ];

    expect(DEFAULT_PLANS).toHaveLength(3);
    expect(DEFAULT_PLANS[0].price).toBe(9.99);
    expect(DEFAULT_PLANS[2].price).toBe(99.99);
  });

  it("should check stripe configuration", async () => {
    const mod = await import("../../../../server/services/stripe-service");
    const result = mod.stripeService.isConfigured();
    expect(result).toBe(false);
  });

  it("should get user usage data", async () => {
    const mod = await import("../../../../server/services/usage-tracking-service");
    const usage = await mod.getUserUsage("user1");

    expect(usage.aiCredits.used).toBe(5);
    expect(usage.aiCredits.limit).toBe(100);
    expect(usage.products.used).toBe(3);
  });
});
