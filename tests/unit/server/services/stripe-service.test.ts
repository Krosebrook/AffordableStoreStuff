import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Stripe Service", () => {
  beforeEach(() => {
    vi.resetModules();
    // Ensure no STRIPE_SECRET_KEY is set
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("should not be configured without STRIPE_SECRET_KEY", async () => {
    const mod = await import("../../../../server/services/stripe-service");
    expect(mod.stripeService.isConfigured()).toBe(false);
  });

  it("should throw when creating customer without config", async () => {
    const mod = await import("../../../../server/services/stripe-service");
    await expect(mod.stripeService.createCustomer("test@example.com")).rejects.toThrow("Stripe not configured");
  });

  it("should throw when creating checkout session without config", async () => {
    const mod = await import("../../../../server/services/stripe-service");
    await expect(
      mod.stripeService.createCheckoutSession("cus_123", "price_123", "http://localhost/success", "http://localhost/cancel")
    ).rejects.toThrow("Stripe not configured");
  });

  it("should throw when creating portal session without config", async () => {
    const mod = await import("../../../../server/services/stripe-service");
    await expect(
      mod.stripeService.createPortalSession("cus_123", "http://localhost/billing")
    ).rejects.toThrow("Stripe not configured");
  });

  it("should throw when getting subscription without config", async () => {
    const mod = await import("../../../../server/services/stripe-service");
    await expect(
      mod.stripeService.getSubscription("sub_123")
    ).rejects.toThrow("Stripe not configured");
  });

  it("should throw when constructing webhook event without config", async () => {
    const mod = await import("../../../../server/services/stripe-service");
    expect(() => mod.stripeService.constructWebhookEvent(Buffer.from(""), "sig")).toThrow("Stripe not configured");
  });
});
