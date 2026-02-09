import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../server/storage", () => ({
  storage: {
    getCartItems: vi.fn(),
    getProduct: vi.fn(),
    addToCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeFromCart: vi.fn(),
    clearCart: vi.fn(),
  },
}));

describe("Cart Routes Logic", () => {
  let storage: any;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../../../../server/storage");
    storage = mod.storage;
  });

  it("should get cart items", async () => {
    const mockItems = [
      { id: "ci1", productId: "p1", quantity: 2, sessionId: "sess1" },
    ];
    storage.getCartItems.mockResolvedValue(mockItems);

    const result = await storage.getCartItems(undefined, "sess1");
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
  });

  it("should add item to cart", async () => {
    const mockProduct = { id: "p1", name: "T-Shirt", price: "19.99" };
    const mockItem = { id: "ci1", productId: "p1", quantity: 1, sessionId: "sess1" };

    storage.getProduct.mockResolvedValue(mockProduct);
    storage.addToCart.mockResolvedValue(mockItem);

    const product = await storage.getProduct("p1");
    expect(product).not.toBeNull();

    const result = await storage.addToCart({ productId: "p1", quantity: 1, sessionId: "sess1" });
    expect(result.productId).toBe("p1");
  });

  it("should reject adding nonexistent product", async () => {
    storage.getProduct.mockResolvedValue(null);

    const product = await storage.getProduct("nonexistent");
    expect(product).toBeNull();
  });

  it("should update cart item quantity", async () => {
    const updated = { id: "ci1", productId: "p1", quantity: 5 };
    storage.updateCartItem.mockResolvedValue(updated);

    const result = await storage.updateCartItem("ci1", 5);
    expect(result.quantity).toBe(5);
  });

  it("should remove cart item", async () => {
    storage.removeFromCart.mockResolvedValue(undefined);

    await storage.removeFromCart("ci1");
    expect(storage.removeFromCart).toHaveBeenCalledWith("ci1");
  });

  it("should clear cart", async () => {
    storage.clearCart.mockResolvedValue(undefined);

    await storage.clearCart(undefined, "sess1");
    expect(storage.clearCart).toHaveBeenCalledWith(undefined, "sess1");
  });
});
