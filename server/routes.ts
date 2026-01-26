import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertCategorySchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { registerIntegrationRoutes } from "./integrations/routes";
import aiToolsRouter from "./integrations/ai-tools-routes";

const SALT_ROUNDS = 12;

// Helper function to get or create session ID from cookies
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Register integration routes
  registerIntegrationRoutes(app);
  
  // Register AI tools routes
  app.use("/api/ai", aiToolsRouter);

  // ============ AUTH ROUTES ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      
      // Set session
      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Get current user session
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Forgot password - request reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Always return success to prevent email enumeration
      const user = await storage.getUserByEmail(email);
      
      if (user) {
        // Generate a secure random token
        const token = randomUUID() + randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete any existing tokens for this user
        await storage.deletePasswordResetTokensForUser(user.id);
        
        // Create new reset token
        await storage.createPasswordResetToken({
          userId: user.id,
          token,
          expiresAt,
        });

        // Send password reset email
        const { sendPasswordResetEmail } = await import("./email");
        const emailSent = await sendPasswordResetEmail(user.email, token);
        
        // Log in development as fallback
        if (!emailSent && process.env.NODE_ENV === "development") {
          console.log(`[DEV] Password reset link (email failed): /reset-password?token=${token}`);
        }
      }

      // Always return success to prevent email enumeration attacks
      res.json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset password - verify token and update password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Find the token
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Reset link has expired" });
      }

      // Check if token was already used
      if (resetToken.usedAt) {
        return res.status(400).json({ message: "Reset link has already been used" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Update user's password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);

      // Mark token as used
      await storage.markPasswordResetTokenUsed(token);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Verify reset token (for the reset password page)
  app.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ valid: false, message: "Token is required" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ valid: false, message: "Invalid reset link" });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ valid: false, message: "Reset link has expired" });
      }

      if (resetToken.usedAt) {
        return res.status(400).json({ valid: false, message: "Reset link has already been used" });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ valid: false, message: "Failed to verify token" });
    }
  });

  // ============ PRODUCTS ROUTES ============
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // ============ CATEGORIES ROUTES ============
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // ============ CART ROUTES ============
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req, res);
      const items = await storage.getCartItems(undefined, sessionId);
      res.json(items);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
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

      const item = await storage.addToCart({
        productId,
        quantity,
        sessionId,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add to cart" });
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
      res.json(item);
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req, res);
      await storage.clearCart(undefined, sessionId);
      res.status(204).send();
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // ============ ORDERS ROUTES ============
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req, res);
      const { shippingAddress, billingAddress, paymentMethod } = req.body;

      // Get cart items
      const cartItems = await storage.getCartItems(undefined, sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
      const tax = subtotal * 0.08;
      const shipping = subtotal > 50 ? 0 : 9.99;
      const total = subtotal + tax + shipping;

      // Create order items
      const orderItemsData = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images?.[0] || null,
        price: item.product.price,
        quantity: item.quantity,
        orderId: "", // Will be set after order creation
      }));

      // Create order
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

      // Clear cart after order
      await storage.clearCart(undefined, sessionId);

      res.status(201).json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // ============ SEED DATA ROUTE (for demo) ============
  app.post("/api/seed", async (req, res) => {
    try {
      // Create categories
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

      // Create sample products
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

  return httpServer;
}
