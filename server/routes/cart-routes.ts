import { Router, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { storage } from "../storage";

const router = Router();

function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.cartSessionId;

  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie("cartSessionId", sessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    });
  }

  return sessionId;
}

// Get cart items
router.get("/", async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    const items = await storage.getCartItems(undefined, sessionId);
    res.json(items);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// Add to cart
router.post("/", async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const sessionId = getSessionId(req, res);

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const item = await storage.addToCart({ productId, quantity, sessionId });
    res.status(201).json(item);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// Update cart item quantity
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const item = await storage.updateCartItem(String(req.params.id), quantity);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// Remove single cart item
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await storage.removeFromCart(String(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

// Clear entire cart
router.delete("/", async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    await storage.clearCart(undefined, sessionId);
    res.status(204).send();
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

export default router;
