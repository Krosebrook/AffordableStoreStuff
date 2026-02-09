import { Router, type Request, type Response } from "express";
import { storage } from "../storage";

const router = Router();

// Seed data - gated behind non-production or admin role
router.post("/", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Seed route is disabled in production" });
  }

  try {
    const categories = [
      { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets" },
      { name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
      { name: "Home & Garden", slug: "home-garden", description: "Home decor and garden supplies" },
      { name: "Sports", slug: "sports", description: "Sports equipment and accessories" },
    ];

    const createdCategories: any[] = [];
    for (const cat of categories) {
      try {
        const created = await storage.createCategory(cat);
        createdCategories.push(created);
      } catch (e) {
        // Category might already exist
      }
    }

    const sampleProducts = [
      {
        name: "Wireless Noise-Canceling Headphones Pro",
        slug: "wireless-headphones-pro",
        description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
        price: "249.99",
        compareAtPrice: "299.99",
        categoryId: createdCategories[0]?.id,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
        stock: 45,
        sku: "WHP-001",
        featured: true,
        status: "active",
        tags: ["audio", "wireless", "premium"],
      },
      {
        name: "Smart Watch Series X",
        slug: "smart-watch-series-x",
        description: "Advanced smartwatch with health monitoring, GPS, and 7-day battery life.",
        price: "399.99",
        compareAtPrice: "449.99",
        categoryId: createdCategories[0]?.id,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
        stock: 32,
        sku: "SWX-001",
        featured: true,
        status: "active",
        tags: ["wearable", "smart", "fitness"],
      },
      {
        name: "Premium Laptop Stand Deluxe",
        slug: "laptop-stand-deluxe",
        description: "Ergonomic aluminum laptop stand with adjustable height and cable management.",
        price: "79.99",
        categoryId: createdCategories[0]?.id,
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"],
        stock: 87,
        sku: "LSD-001",
        featured: false,
        status: "active",
        tags: ["accessories", "ergonomic"],
      },
      {
        name: "USB-C Hub 7-in-1",
        slug: "usb-c-hub-7in1",
        description: "Compact USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery.",
        price: "59.99",
        categoryId: createdCategories[0]?.id,
        images: ["https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800"],
        stock: 120,
        sku: "UCH-001",
        featured: false,
        status: "active",
        tags: ["accessories", "connectivity"],
      },
      {
        name: "Minimalist Cotton T-Shirt",
        slug: "minimalist-cotton-tshirt",
        description: "Premium organic cotton t-shirt with a relaxed fit and minimalist design.",
        price: "34.99",
        categoryId: createdCategories[1]?.id,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
        stock: 200,
        sku: "MCT-001",
        featured: false,
        status: "active",
        tags: ["casual", "organic"],
      },
      {
        name: "Modern Desk Lamp",
        slug: "modern-desk-lamp",
        description: "LED desk lamp with adjustable brightness, color temperature, and wireless charging base.",
        price: "89.99",
        categoryId: createdCategories[2]?.id,
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"],
        stock: 65,
        sku: "MDL-001",
        featured: true,
        status: "active",
        tags: ["lighting", "smart home"],
      },
    ];

    for (const product of sampleProducts) {
      try {
        await storage.createProduct(product);
      } catch (e) {
        // Product might already exist
      }
    }

    res.json({ message: "Seed data created successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ message: "Failed to seed data" });
  }
});

export default router;
