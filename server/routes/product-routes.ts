import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertProductSchema } from "@shared/schema";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

// Get all products (public)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Get single product (public)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await storage.getProduct(String(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Create product (auth required)
router.post("/", requireAuth, validateBody(insertProductSchema), async (req: Request, res: Response) => {
  try {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// Update product (auth required, validated)
router.patch("/:id", requireAuth, validateBody(insertProductSchema.partial()), async (req: Request, res: Response) => {
  try {
    const product = await storage.updateProduct(String(req.params.id), req.body);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Delete product (auth required)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await storage.deleteProduct(String(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
