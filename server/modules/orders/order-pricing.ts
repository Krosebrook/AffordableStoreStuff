import type { CartItemWithProduct } from "@shared/schema";

export interface OrderPricing {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface OrderPricingConfig {
  taxRate: number;
  freeShippingThreshold: number;
  standardShippingCost: number;
}

const DEFAULT_CONFIG: OrderPricingConfig = {
  taxRate: 0.08,
  freeShippingThreshold: 50,
  standardShippingCost: 9.99,
};

export function calculateOrderPricing(
  cartItems: CartItemWithProduct[],
  config: OrderPricingConfig = DEFAULT_CONFIG,
): OrderPricing {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const tax = subtotal * config.taxRate;
  const shipping = subtotal > config.freeShippingThreshold ? 0 : config.standardShippingCost;

  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
  };
}
