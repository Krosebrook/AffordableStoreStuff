import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertCategorySchema } from "@shared/schema";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

// Get all categories (public)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// Create category (auth required)
router.post("/", requireAuth, validateBody(insertCategorySchema), async (req: Request, res: Response) => {
  try {
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
});

export default router;
