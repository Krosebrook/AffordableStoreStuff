import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import { runPublishPipeline, generateListingContent } from "./publishPipeline";
import { constructWebhookEvent } from "./services/stripe-service";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const AI_MODEL = process.env.AI_MODEL || "gpt-4o";

// Rate limiters for expensive/AI endpoints
const aiRateLimit = rateLimit(20, 60_000); // 20 requests per minute per IP
const chatRateLimit = rateLimit(30, 60_000); // 30 requests per minute per IP
// Strict limit on auth endpoints to prevent brute-force attacks
const authRateLimit = rateLimit(10, 60_000); // 10 requests per minute per IP
// General API rate limit applied to all authenticated routes
const apiRateLimit = rateLimit(200, 60_000); // 200 requests per minute per IP

export async function registerRoutes(app: Express): Promise<Server> {
  // -----------------------------------------------------------------------
  // Global authentication guard
  // All /api/* routes require a valid Bearer JWT **except** the paths listed
  // below, which are intentionally public or secured by another mechanism.
  // -----------------------------------------------------------------------
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api/")) return next();

    const publicPaths = [
      "/api/auth/", // registration & login (rate-limited per-endpoint)
      "/api/shop/", // guest shopping (session-based)
      "/api/billing/webhook", // verified via Stripe signature instead
    ];
    if (publicPaths.some((p) => req.path.startsWith(p))) return next();

    // Read-only catalog endpoints are intentionally public
    if (
      req.method === "GET" &&
      (req.path.startsWith("/api/products") ||
        req.path.startsWith("/api/listings") ||
        req.path.startsWith("/api/categories") ||
        req.path === "/api/billing/plans")
    ) {
      return next();
    }

    // Apply both rate limiting and JWT verification to all protected routes
    apiRateLimit(req, res, () => authMiddleware(req, res, next));
  });

  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) return res.status(404).json({ error: "Not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      if (!product) return res.status(404).json({ error: "Not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/listings", async (_req, res) => {
    try {
      const listings = await storage.getAllListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.get("/api/products/:id/listings", async (req, res) => {
    try {
      const listings = await storage.getListingsByProduct(parseInt(req.params.id));
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(parseInt(req.params.id));
      if (!listing) return res.status(404).json({ error: "Not found" });
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const listing = await storage.createListing(req.body);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  app.put("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.updateListing(parseInt(req.params.id), req.body);
      if (!listing) return res.status(404).json({ error: "Not found" });
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  app.get("/api/orders", async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const order = await storage.updateOrderStatus(parseInt(req.params.id), req.body.status);
      if (!order) return res.status(404).json({ error: "Not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/brand-profiles", async (_req, res) => {
    try {
      const profiles = await storage.getAllBrandProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brand profiles" });
    }
  });

  app.post("/api/brand-profiles", async (req, res) => {
    try {
      const profile = await storage.createBrandProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to create brand profile" });
    }
  });

  app.put("/api/brand-profiles/:id", async (req, res) => {
    try {
      const profile = await storage.updateBrandProfile(parseInt(req.params.id), req.body);
      if (!profile) return res.status(404).json({ error: "Not found" });
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update brand profile" });
    }
  });

  app.delete("/api/brand-profiles/:id", async (req, res) => {
    try {
      await storage.deleteBrandProfile(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete brand profile" });
    }
  });

  app.get("/api/content", async (_req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const item = await storage.createContent(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  app.put("/api/content/:id/favorite", async (req, res) => {
    try {
      const item = await storage.toggleContentFavorite(parseInt(req.params.id));
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });

  app.delete("/api/content/:id", async (req, res) => {
    try {
      await storage.deleteContent(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  app.get("/api/ai/usage", async (_req, res) => {
    try {
      const stats = await storage.getAiUsageStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI usage" });
    }
  });

  app.post("/api/ai/generate-product", aiRateLimit, async (req, res) => {
    try {
      const { productType, brandProfile, features } = req.body;
      
      let systemPrompt = "You are an expert e-commerce product copywriter. Generate compelling, SEO-optimized product content.";
      if (brandProfile) {
        systemPrompt += ` Brand tone: ${brandProfile.tone}. Target audience: ${brandProfile.targetAudience}.`;
        if (brandProfile.keywords?.length) {
          systemPrompt += ` Key brand terms: ${brandProfile.keywords.join(", ")}.`;
        }
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const stream = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a complete product listing for: "${productType}".
${features ? `Features: ${features}` : ""}

Return a JSON object with these fields:
- title: A compelling product title (max 80 chars)
- description: A detailed product description (150-200 words) with benefits and features
- bulletPoints: Array of 5 key selling points
- tags: Array of 8-10 SEO tags/keywords
- suggestedPrice: A reasonable price as a number
- category: The best product category
- seoTitle: SEO-optimized title for search engines
- metaDescription: Meta description for search (max 160 chars)`,
          },
        ],
        stream: true,
        max_completion_tokens: 8192,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await storage.logAiGeneration({
        type: "product",
        prompt: productType,
        output: fullContent,
        tokensUsed: Math.ceil(fullContent.length / 4),
        model: AI_MODEL,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI generation error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "AI generation failed" });
      }
    }
  });

  app.post("/api/ai/generate-marketing", aiRateLimit, async (req, res) => {
    try {
      const { productTitle, productDescription, platform, brandProfile } = req.body;

      let systemPrompt = "You are an expert digital marketing copywriter specializing in e-commerce.";
      if (brandProfile) {
        systemPrompt += ` Brand tone: ${brandProfile.tone}. Target audience: ${brandProfile.targetAudience}.`;
      }

      const platformInstructions: Record<string, string> = {
        tiktok: "Write a viral TikTok video script. Hook in first 3 seconds. Casual, energetic tone. 15-30 seconds. Include trending hashtags.",
        instagram: "Write an Instagram caption. Aesthetic storytelling approach. Include emojis naturally and 10 relevant hashtags.",
        pinterest: "Write a Pinterest pin description. SEO-optimized with seasonal and search keywords. Include a call to action.",
        amazon: "Write Amazon product listing copy. Focus on A+ content structure with feature bullets, comparison points, and FAQ.",
        etsy: "Write Etsy listing copy. Handcrafted feel, story-driven. Include long-tail search keywords naturally.",
        email: "Write a promotional email. Compelling subject line, preview text, and body with a clear CTA.",
        general: "Write versatile marketing copy that works across platforms.",
      };

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const stream = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create marketing copy for this product:
Title: ${productTitle}
Description: ${productDescription}
Platform: ${platform}

Instructions: ${platformInstructions[platform] || platformInstructions.general}

Return a JSON object with:
- headline: Attention-grabbing headline
- body: The main copy
- callToAction: Strong CTA
- hashtags: Array of relevant hashtags (if applicable)
- tips: Array of 3 tips for maximizing this content's performance`,
          },
        ],
        stream: true,
        max_completion_tokens: 8192,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await storage.logAiGeneration({
        type: "marketing",
        prompt: `${platform}: ${productTitle}`,
        output: fullContent,
        tokensUsed: Math.ceil(fullContent.length / 4),
        model: AI_MODEL,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Marketing generation error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "AI generation failed" });
      }
    }
  });

  app.post<{ id: string }>("/api/listings/:id/publish", aiRateLimit, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id, 10);
      const listing = await storage.getListing(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      const product = await storage.getProduct(listing.productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const { generateImages = true, imageCount = 2, brandProfileId } = req.body;

      let brandProfile;
      if (brandProfileId) {
        brandProfile = await storage.getBrandProfile(brandProfileId);
      } else {
        const profiles = await storage.getAllBrandProfiles();
        brandProfile = profiles.find((p) => p.isDefault) || profiles[0];
      }

      await storage.updateListing(listingId, { status: "generating" });

      const result = await runPublishPipeline(
        product,
        listing.marketplace,
        brandProfile || undefined,
        generateImages,
        imageCount
      );

      const updatedListing = await storage.updateListing(listingId, {
        listingData: result.listingData,
        generatedImages: result.generatedImages,
        customTitle: result.listingData.title,
        customDescription: result.listingData.description,
        status: "ready",
      });

      await storage.logAiGeneration({
        type: "listing",
        prompt: `${listing.marketplace} listing for: ${product.title}`,
        output: JSON.stringify(result.listingData),
        tokensUsed: Math.ceil(JSON.stringify(result.listingData).length / 4),
        model: AI_MODEL,
      });

      res.json(updatedListing);
    } catch (error) {
      console.error("Publish pipeline error:", error);
      const listingId = parseInt(req.params.id, 10);
      await storage.updateListing(listingId, { status: "draft" }).catch(() => {});
      res.status(500).json({ error: "Failed to generate listing content" });
    }
  });

  app.post("/api/listings/:id/confirm-publish", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListing(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      const updatedListing = await storage.updateListing(listingId, {
        status: "published",
        publishedAt: new Date(),
      });

      const product = await storage.getProduct(listing.productId);
      if (product && product.status === "draft") {
        await storage.updateProduct(listing.productId, { status: "active" });
      }

      res.json(updatedListing);
    } catch (error) {
      console.error("Confirm publish error:", error);
      res.status(500).json({ error: "Failed to confirm publish" });
    }
  });

  app.post("/api/listings/:id/regenerate-content", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListing(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      const product = await storage.getProduct(listing.productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const { brandProfileId } = req.body;
      let brandProfile;
      if (brandProfileId) {
        brandProfile = await storage.getBrandProfile(brandProfileId);
      }

      const listingData = await generateListingContent(
        product,
        listing.marketplace,
        brandProfile || undefined
      );

      listingData.images = listing.generatedImages as string[];

      const updatedListing = await storage.updateListing(listingId, {
        listingData,
        customTitle: listingData.title,
        customDescription: listingData.description,
        status: "ready",
      });

      res.json(updatedListing);
    } catch (error) {
      console.error("Regenerate content error:", error);
      res.status(500).json({ error: "Failed to regenerate content" });
    }
  });

  // === Shop API Routes (Customer-facing) ===

  const getSessionId = (req: any): string => {
    return req.headers["x-session-id"] as string || "guest-default";
  };

  app.get("/api/shop/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/shop/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const item = await storage.addToCart(sessionId, req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.put("/api/shop/cart/:id", async (req, res) => {
    try {
      const item = await storage.updateCartItem(parseInt(req.params.id), req.body);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/shop/cart/:id", async (req, res) => {
    try {
      await storage.removeCartItem(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.get("/api/shop/style-profile", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const profile = await storage.getStyleProfile(sessionId);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch style profile" });
    }
  });

  app.post("/api/shop/style-profile", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const profile = await storage.saveStyleProfile(sessionId, req.body);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error saving style profile:", error);
      res.status(500).json({ error: "Failed to save style profile" });
    }
  });

  app.post("/api/shop/stylist-chat", chatRateLimit, async (req, res) => {
    try {
      const { message, history = [] } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const stream = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an expert AI fashion stylist for AffordableStoreStuff. You help customers with:
- Outfit recommendations based on occasions, weather, and personal style
- Color coordination and pattern mixing advice
- Wardrobe essentials and building a capsule wardrobe
- Styling tips for different body types
- Trend advice and how to incorporate trends affordably
- Shopping recommendations from our product catalog

Be friendly, enthusiastic, and specific with your recommendations. Use fashion terminology naturally but explain when needed. Keep responses concise but helpful.`,
          },
          ...history.slice(-10),
          { role: "user", content: message },
        ],
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Stylist chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Chat failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "AI stylist chat failed" });
      }
    }
  });

  app.get("/api/shop/wardrobe", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const items = await storage.getWardrobeItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wardrobe" });
    }
  });

  app.post("/api/shop/wardrobe", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const item = await storage.addWardrobeItem(sessionId, req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add wardrobe item" });
    }
  });

  app.delete("/api/shop/wardrobe/:id", async (req, res) => {
    try {
      await storage.removeWardrobeItem(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove wardrobe item" });
    }
  });

  // === End Shop API Routes ===

  app.get("/public-objects/:filePath", async (req, res) => {
    const filePath = decodeURIComponent(req.params.filePath);
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", async (_req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/product-images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }
    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // === Auth & Password Reset Routes ===

  app.post("/api/auth/register", authRateLimit, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = createToken({ id: user.id, username: user.username });
      res.json({ id: user.id, username: user.username, subscriptionTier: user.subscriptionTier, token });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/request-reset", authRateLimit, async (req, res) => {
    try {
      const { email } = req.body;
      // In production, send email with reset link
      res.json({ message: "If an account exists with that email, a reset link has been sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to process reset request" });
    }
  });

  // === Billing & Subscription Routes ===

  app.get("/api/billing/plans", async (_req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.get("/api/billing/subscription", async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.post("/api/billing/checkout", async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { planId } = req.body;
      if (!planId) return res.status(400).json({ error: "planId is required" });

      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return res.status(404).json({ error: "Plan not found" });
      if (!plan.stripePriceId) {
        return res.status(422).json({ error: "Plan is not configured for billing" });
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Reuse an existing Stripe customer if one was created during a prior checkout.
      // TODO (M4): Once an `email` column is added to the `users` table, pass the
      // real email here instead of username. See AUDIT.md recommendation M4.
      const existingSub = await storage.getUserSubscription(userId);
      let stripeCustomerId = existingSub?.stripeCustomerId ?? null;
      if (!stripeCustomerId) {
        stripeCustomerId = await createCustomer(user.username);
      }

      const baseUrl =
        process.env.APP_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:5000");
      const sessionUrl = await createCheckoutSession(
        stripeCustomerId,
        plan.stripePriceId,
        `${baseUrl}/billing?success=true`,
        `${baseUrl}/billing?cancelled=true`
      );

      res.json({ url: sessionUrl });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/billing/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }
    try {
      // req.rawBody is populated by the `verify` callback in setupBodyParsing() (server/index.ts).
      // It holds the raw Buffer before JSON parsing, which Stripe requires for signature verification.
      const rawBody = req.rawBody as Buffer | undefined;
      if (!rawBody) {
        return res.status(400).json({ error: "Raw body unavailable for webhook verification" });
      }
      const event = await constructWebhookEvent(rawBody, sig);
      // Handle specific Stripe event types
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          // TODO: sync subscription status with database
          break;
        default:
          break;
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      res.status(400).json({ error: "Webhook signature verification failed" });
    }
  });

  // === Category Routes ===

  app.get("/api/categories", async (_req, res) => {
    try {
      const allCategories = await storage.getAllCategories();
      res.json(allCategories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) return res.status(404).json({ error: "Not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // === Publishing Queue Routes ===

  app.get("/api/publishing-queue", async (_req, res) => {
    try {
      const items = await storage.getPublishingQueueItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue" });
    }
  });

  app.get("/api/publishing-queue/stats", async (_req, res) => {
    try {
      const stats = await storage.getPublishingQueueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue stats" });
    }
  });

  app.post("/api/publishing-queue", async (req, res) => {
    try {
      const item = await storage.addToPublishingQueue(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to queue" });
    }
  });

  app.put("/api/publishing-queue/:id/status", async (req, res) => {
    try {
      const item = await storage.updatePublishingQueueStatus(req.params.id, req.body.status);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update queue item" });
    }
  });

  app.delete("/api/publishing-queue/:id", async (req, res) => {
    try {
      await storage.removeFromPublishingQueue(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from queue" });
    }
  });

  // === Social Media Routes ===

  app.get("/api/social/platforms", async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const platforms = await storage.getSocialPlatforms(userId);
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platforms" });
    }
  });

  app.post("/api/social/content", async (req, res) => {
    try {
      const content = await storage.createSocialContent(req.body);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  app.get("/api/social/content", async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const content = await storage.getSocialContent(userId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/social/analytics", async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const analytics = await storage.getSocialAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // === Team Routes ===

  app.get("/api/teams", async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const userTeams = await storage.getUserTeams(userId);
      res.json(userTeams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const team = await storage.createTeam(req.body);
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.get("/api/teams/:id/members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/teams/:id/members", async (req, res) => {
    try {
      const member = await storage.addTeamMember(req.params.id, req.body);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to add team member" });
    }
  });

  app.put("/api/teams/:teamId/members/:memberId", async (req, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.memberId, req.body);
      if (!member) return res.status(404).json({ error: "Not found" });
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/teams/:teamId/members/:memberId", async (req, res) => {
    try {
      await storage.removeTeamMember(req.params.memberId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove team member" });
    }
  });

  // === Order Items Routes ===

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItems(parseInt(req.params.id));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders/:id/items", async (req, res) => {
    try {
      const item = await storage.addOrderItem(parseInt(req.params.id), req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add order item" });
    }
  });

  // === Marketing Campaigns Routes ===

  app.get("/api/campaigns", async (_req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      if (!campaign) return res.status(404).json({ error: "Not found" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
