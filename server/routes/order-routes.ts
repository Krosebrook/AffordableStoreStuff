import { Router, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { z } from "zod";
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from "../config/business-rules";

const router = Router();

function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.cartSessionId;
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie("cartSessionId", sessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
  }
  return sessionId;
}

const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

// Get all orders (auth required)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const orders = await storage.getOrders(req.userId);
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get single order (auth required)
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const order = await storage.getOrder(String(req.params.id));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Create order from cart
router.post("/", async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req, res);
    const { shippingAddress, billingAddress, paymentMethod } = req.body;

    const cartItems = await storage.getCartItems(undefined, sessionId);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
    const total = subtotal + tax + shipping;

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
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        shippingAddress,
        billingAddress,
        paymentMethod,
        paymentStatus: "paid",
        status: "processing",
      },
      orderItemsData
    );

    await storage.clearCart(undefined, sessionId);
    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Update order status (auth required, validated)
router.patch("/:id/status", requireAuth, validateBody(updateOrderStatusSchema), async (req: Request, res: Response) => {
  try {
    const order = await storage.updateOrderStatus(String(req.params.id), req.body.status);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;
