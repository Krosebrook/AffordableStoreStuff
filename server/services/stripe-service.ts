import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.");
  }
  return stripe;
}

export async function createCustomer(email: string, name?: string): Promise<string> {
  const s = getStripe();
  const customer = await s.customers.create({
    email,
    name: name || undefined,
  });
  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const s = getStripe();
  const session = await s.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return session.url || "";
}

export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const s = getStripe();
  const session = await s.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const s = getStripe();
  await s.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function resumeSubscription(subscriptionId: string): Promise<void> {
  const s = getStripe();
  await s.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const s = getStripe();
  return await s.subscriptions.retrieve(subscriptionId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const s = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return s.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { stripe };
