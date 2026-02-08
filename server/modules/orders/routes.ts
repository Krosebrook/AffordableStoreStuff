import type { Express } from "express";
import type { IStorage } from "../../storage";
import { getSessionId } from "../common/session";
import { calculateOrderPricing } from "./order-pricing";

export function registerOrderRoutes(app: Express, storage: IStorage) {
  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      return res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      return res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req, res);
      const { shippingAddress, billingAddress, paymentMethod } = req.body;

      const cartItems = await storage.getCartItems(undefined, sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const pricing = calculateOrderPricing(cartItems);
      const orderItemsData = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images?.[0] || null,
        price: item.product.price,
        quantity: item.quantity,
        orderId: "",
      }));

      const order = await storage.createOrder(
        {
          subtotal: pricing.subtotal.toString(),
          tax: pricing.tax.toString(),
          shipping: pricing.shipping.toString(),
          total: pricing.total.toString(),
          shippingAddress,
          billingAddress,
          paymentMethod,
          paymentStatus: "paid",
          status: "processing",
        },
        orderItemsData,
      );

      await storage.clearCart(undefined, sessionId);
      return res.status(201).json(order);
    } catch (error) {
      console.error("Create order error:", error);
      return res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      return res.status(500).json({ message: "Failed to update order status" });
    }
  });
}
