import test from "node:test";
import assert from "node:assert/strict";
import { calculateOrderPricing } from "./order-pricing";
import type { CartItemWithProduct } from "@shared/schema";

function item(price: string, quantity: number): CartItemWithProduct {
  return {
    id: "cart-id",
    userId: null,
    sessionId: "session-id",
    productId: "product-id",
    quantity,
    product: {
      id: "product-id",
      name: "Product",
      slug: "product",
      description: null,
      price,
      compareAtPrice: null,
      categoryId: null,
      images: [],
      stock: 10,
      sku: null,
      featured: false,
      status: "active",
      tags: [],
      metadata: null,
    },
  };
}

test("calculateOrderPricing computes subtotal, tax, and free shipping", () => {
  const result = calculateOrderPricing([item("40.00", 1), item("20.00", 1)]);

  assert.equal(result.subtotal, 60);
  assert.equal(result.tax, 4.8);
  assert.equal(result.shipping, 0);
  assert.equal(result.total, 64.8);
});

test("calculateOrderPricing applies standard shipping below threshold", () => {
  const result = calculateOrderPricing([item("10.00", 2)]);

  assert.equal(result.subtotal, 20);
  assert.equal(result.tax, 1.6);
  assert.equal(result.shipping, 9.99);
  assert.equal(result.total, 31.59);
});

test("calculateOrderPricing with empty cart still returns shipping (negative case)", () => {
  const result = calculateOrderPricing([]);

  assert.equal(result.subtotal, 0);
  assert.equal(result.tax, 0);
  assert.equal(result.shipping, 9.99);
  assert.equal(result.total, 9.99);
});
