import Stripe from "stripe";

class StripeService {
  private stripe: Stripe | null = null;

  constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    if (!this.stripe) throw new Error("Stripe not configured");
    return this.stripe.customers.create({ email, name });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    if (!this.stripe) throw new Error("Stripe not configured");
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session.url!;
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    if (!this.stripe) throw new Error("Stripe not configured");
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) throw new Error("Stripe not configured");
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) throw new Error("Stripe not configured");
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) throw new Error("Stripe not configured");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("Stripe webhook secret not configured");
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export const stripeService = new StripeService();
