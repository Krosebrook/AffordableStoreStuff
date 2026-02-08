import type { Express } from "express";
import type { IStorage } from "../../storage";
import { getSessionId } from "../common/session";

export function registerCartRoutes(app: Express, storage: IStorage) {
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req, res);
      const items = await storage.getCartItems(undefined, sessionId);
      return res.json(items);
    } catch (error) {
      console.error("Get cart error:", error);
      return res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
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
      return res.status(201).json(item);
    } catch (error) {
      console.error("Add to cart error:", error);
      return res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Valid quantity is required" });
      }

      const item = await storage.updateCartItem(req.params.id, quantity);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      return res.json(item);
    } catch (error) {
      console.error("Update cart error:", error);
      return res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error("Remove from cart error:", error);
      return res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req, res);
      await storage.clearCart(undefined, sessionId);
      return res.status(204).send();
    } catch (error) {
      console.error("Clear cart error:", error);
      return res.status(500).json({ message: "Failed to clear cart" });
    }
  });
}
