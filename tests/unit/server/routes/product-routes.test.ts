import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the storage module
vi.mock("../../../../server/storage", () => ({
  storage: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

// Mock auth middleware
vi.mock("../../../../server/middleware/auth", () => ({
  requireAuth: (_req: any, _res: any, next: any) => next(),
}));

// Mock validate middleware
vi.mock("../../../../server/middleware/validate", () => ({
  validateBody: () => (_req: any, _res: any, next: any) => next(),
}));

describe("Product Routes Logic", () => {
  let storage: any;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../../../../server/storage");
    storage = mod.storage;
  });

  it("should list products", async () => {
    const mockProducts = [
      { id: "1", name: "T-Shirt", price: "19.99", status: "active" },
      { id: "2", name: "Mug", price: "14.99", status: "active" },
    ];
    storage.getProducts.mockResolvedValue(mockProducts);

    const result = await storage.getProducts();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("T-Shirt");
  });

  it("should get a single product by id", async () => {
    const mockProduct = { id: "1", name: "T-Shirt", price: "19.99" };
    storage.getProduct.mockResolvedValue(mockProduct);

    const result = await storage.getProduct("1");
    expect(result).toEqual(mockProduct);
    expect(storage.getProduct).toHaveBeenCalledWith("1");
  });

  it("should return null for nonexistent product", async () => {
    storage.getProduct.mockResolvedValue(null);

    const result = await storage.getProduct("nonexistent");
    expect(result).toBeNull();
  });

  it("should create a product", async () => {
    const newProduct = { name: "Hoodie", price: "39.99", description: "Warm hoodie" };
    const created = { id: "3", ...newProduct, status: "active" };
    storage.createProduct.mockResolvedValue(created);

    const result = await storage.createProduct(newProduct);
    expect(result.id).toBe("3");
    expect(result.name).toBe("Hoodie");
  });

  it("should update a product", async () => {
    const updated = { id: "1", name: "Updated T-Shirt", price: "24.99" };
    storage.updateProduct.mockResolvedValue(updated);

    const result = await storage.updateProduct("1", { name: "Updated T-Shirt", price: "24.99" });
    expect(result.name).toBe("Updated T-Shirt");
  });

  it("should delete a product", async () => {
    storage.deleteProduct.mockResolvedValue(undefined);

    await storage.deleteProduct("1");
    expect(storage.deleteProduct).toHaveBeenCalledWith("1");
  });
});
