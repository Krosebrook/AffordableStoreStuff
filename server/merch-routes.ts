import { Router, type Request, type Response } from "express";
import { db } from "./db";
import { merchProducts, merchSessions, insertMerchSessionSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "./middleware/auth";

const router = Router();

// ============ MERCH PRODUCT CATALOG ============

// Get all merch products
router.get("/products", async (_req: Request, res: Response) => {
  try {
    const products = await db.select().from(merchProducts);
    res.json(products);
  } catch (error) {
    console.error("Get merch products error:", error);
    res.status(500).json({ message: "Failed to fetch merch products" });
  }
});

// Get popular merch products
router.get("/products/popular", async (_req: Request, res: Response) => {
  try {
    const products = await db.select().from(merchProducts).where(eq(merchProducts.popular, true));
    res.json(products);
  } catch (error) {
    console.error("Get popular products error:", error);
    res.status(500).json({ message: "Failed to fetch popular products" });
  }
});

// Get merch products by category
router.get("/products/category/:category", async (req: Request, res: Response) => {
  try {
    const products = await db.select().from(merchProducts).where(eq(merchProducts.category, String(req.params.category)));
    res.json(products);
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Get single merch product
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const [product] = await db.select().from(merchProducts).where(eq(merchProducts.id, String(req.params.id)));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get merch product error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// ============ MERCH SESSIONS (Mockup Generation) ============

// Get user's merch sessions
router.get("/sessions", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const sessions = await db.select().from(merchSessions).where(eq(merchSessions.userId, userId));
    res.json(sessions);
  } catch (error) {
    console.error("Get merch sessions error:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// Create merch session
router.post("/sessions", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const data = insertMerchSessionSchema.parse({ ...req.body, userId });
    const [session] = await db.insert(merchSessions).values(data).returning();
    res.status(201).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Create merch session error:", error);
    res.status(500).json({ message: "Failed to create session" });
  }
});

// Update merch session
router.patch("/sessions/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [session] = await db
      .update(merchSessions)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(merchSessions.id, String(req.params.id)))
      .returning();
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    console.error("Update merch session error:", error);
    res.status(500).json({ message: "Failed to update session" });
  }
});

// Delete merch session
router.delete("/sessions/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await db.delete(merchSessions).where(eq(merchSessions.id, String(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error("Delete merch session error:", error);
    res.status(500).json({ message: "Failed to delete session" });
  }
});

// ============ SEED MERCH CATALOG ============

router.post("/seed", requireAuth, async (_req: Request, res: Response) => {
  try {
    const catalogProducts = [
      { id: "tshirt-white", name: "Classic White Tee", description: "Premium cotton crew neck", category: "apparel", placeholderImage: "https://placehold.co/400x400/f8fafc/1e293b?text=T-Shirt", defaultPrompt: "A {style} product photography shot of a plain white t-shirt lying flat on a minimalist concrete surface, featuring this logo printed clearly on the chest.", printArea: { width: 4500, height: 5400, unit: "px", dpi: 300 }, variants: [{ id: "s", name: "Small", size: "S" }, { id: "m", name: "Medium", size: "M" }, { id: "l", name: "Large", size: "L" }, { id: "xl", name: "X-Large", size: "XL" }], popular: true },
      { id: "tshirt-black", name: "Classic Black Tee", description: "Premium cotton crew neck", category: "apparel", placeholderImage: "https://placehold.co/400x400/1e293b/f8fafc?text=Black+Tee", defaultPrompt: "A {style} product photography shot of a plain black t-shirt lying flat on a dark marble surface, featuring this logo printed clearly on the chest with vibrant colors.", printArea: { width: 4500, height: 5400, unit: "px", dpi: 300 }, variants: [{ id: "s", name: "Small", size: "S" }, { id: "m", name: "Medium", size: "M" }, { id: "l", name: "Large", size: "L" }, { id: "xl", name: "X-Large", size: "XL" }], popular: true },
      { id: "tshirt-graphic", name: "Graphic T-Shirt", description: "Premium cotton graphic tee", category: "apparel", placeholderImage: "https://placehold.co/400x400/6366f1/ffffff?text=Graphic", defaultPrompt: "A {style} studio shot of a classic fit graphic t-shirt with a bold design on the front, featuring this logo prominently displayed.", printArea: { width: 4500, height: 5400, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "hoodie-black", name: "Streetwear Hoodie", description: "Black oversized hoodie", category: "apparel", placeholderImage: "https://placehold.co/400x400/0f172a/f8fafc?text=Hoodie", defaultPrompt: "A {style} studio photo of a black streetwear hoodie on a mannequin, with this logo prominently displayed on the center chest area. Cinematic lighting.", printArea: { width: 4500, height: 5400, unit: "px", dpi: 300 }, variants: [{ id: "s", name: "Small", size: "S" }, { id: "m", name: "Medium", size: "M" }, { id: "l", name: "Large", size: "L" }, { id: "xl", name: "X-Large", size: "XL" }], popular: true },
      { id: "hoodie-gray", name: "Gray Pullover Hoodie", description: "Heather gray comfortable fit", category: "apparel", placeholderImage: "https://placehold.co/400x400/64748b/ffffff?text=Gray+Hoodie", defaultPrompt: "A {style} lifestyle photo of a heather gray pullover hoodie hanging on a wooden hanger, with this logo centered on the chest area.", printArea: { width: 4500, height: 5400, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "mug-ceramic", name: "Ceramic Mug", description: "White glossy 11oz mug", category: "drinkware", placeholderImage: "https://placehold.co/400x400/fef3c7/92400e?text=Mug", defaultPrompt: "A {style} lifestyle photography shot of a white ceramic coffee mug on a wooden table next to a book, with this logo printed on the side of the mug.", printArea: { width: 2700, height: 1100, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "mug-travel", name: "Travel Mug", description: "Insulated stainless steel", category: "drinkware", placeholderImage: "https://placehold.co/400x400/475569/f8fafc?text=Travel+Mug", defaultPrompt: "A {style} outdoor photography shot of a stainless steel travel mug on a hiking trail, with this logo prominently displayed.", printArea: { width: 2700, height: 1100, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "tote-bag", name: "Canvas Tote", description: "Eco-friendly beige tote bag", category: "accessories", placeholderImage: "https://placehold.co/400x400/fef3c7/78350f?text=Tote", defaultPrompt: "A {style} studio shot of a beige canvas tote bag hanging on a hook, with this logo design centered on the bag fabric.", printArea: { width: 3600, height: 3600, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "cap-baseball", name: "Baseball Cap", description: "Navy blue structured cap", category: "accessories", placeholderImage: "https://placehold.co/400x400/1e3a8a/f8fafc?text=Cap", defaultPrompt: "A {style} closeup of a navy blue baseball cap sitting on a shelf, with this logo embroidered on the front panel.", printArea: { width: 1200, height: 800, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "cap-trucker", name: "Trucker Hat", description: "Mesh back snapback", category: "accessories", placeholderImage: "https://placehold.co/400x400/22c55e/ffffff?text=Trucker", defaultPrompt: "A {style} lifestyle shot of a trucker hat with mesh back panel, featuring this logo on the front foam panel.", printArea: { width: 1200, height: 800, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "phone-case", name: "Phone Case", description: "Slim protective case", category: "accessories", placeholderImage: "https://placehold.co/400x400/8b5cf6/ffffff?text=Phone+Case", defaultPrompt: "A {style} product shot of a modern smartphone case lying on a marble countertop, with this logo design covering the back of the case.", printArea: { width: 1242, height: 2688, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "phone-case-tough", name: "Tough Phone Case", description: "Heavy-duty protection", category: "accessories", placeholderImage: "https://placehold.co/400x400/1e293b/f8fafc?text=Tough+Case", defaultPrompt: "A {style} rugged product shot of a tough smartphone case with reinforced corners, featuring this logo design.", printArea: { width: 1242, height: 2688, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "poster-matte", name: "Matte Poster", description: "Museum-quality matte finish", category: "art", placeholderImage: "https://placehold.co/400x400/f1f5f9/475569?text=Poster", defaultPrompt: "A {style} gallery shot of a framed matte poster hanging on a white wall, featuring this design as the main artwork.", printArea: { width: 5400, height: 7200, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "poster-glossy", name: "Glossy Poster", description: "Vibrant glossy finish", category: "art", placeholderImage: "https://placehold.co/400x400/fef08a/78350f?text=Glossy", defaultPrompt: "A {style} vibrant product shot of a glossy poster with rich colors, featuring this design.", printArea: { width: 5400, height: 7200, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "canvas-print", name: "Canvas Print", description: "Gallery-wrapped canvas", category: "art", placeholderImage: "https://placehold.co/400x400/d4d4d8/3f3f46?text=Canvas", defaultPrompt: "A {style} interior shot of a gallery-wrapped canvas print hanging on a living room wall, featuring this artwork.", printArea: { width: 6000, height: 4500, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "notebook", name: "Spiral Notebook", description: "Hardcover spiral bound", category: "accessories", placeholderImage: "https://placehold.co/400x400/fef3c7/92400e?text=Notebook", defaultPrompt: "A {style} desk flatlay of a spiral notebook with hardcover, featuring this design on the front cover.", printArea: { width: 2550, height: 3300, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "pillow", name: "Throw Pillow", description: "18x18 inch decorative pillow", category: "home", placeholderImage: "https://placehold.co/400x400/e2e8f0/475569?text=Pillow", defaultPrompt: "A {style} cozy living room shot of a throw pillow on a modern sofa, featuring this design printed on the pillow cover.", printArea: { width: 5400, height: 5400, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "blanket", name: "Fleece Blanket", description: "Soft fleece throw blanket", category: "home", placeholderImage: "https://placehold.co/400x400/cbd5e1/334155?text=Blanket", defaultPrompt: "A {style} cozy bedroom shot of a fleece blanket draped over a bed, featuring this design as an all-over print.", printArea: { width: 7200, height: 5400, unit: "px", dpi: 300 }, variants: null, popular: false },
      // Phase 2 - 13 new products
      { id: "sticker-pack", name: "Sticker Pack (6pc)", description: "Die-cut vinyl stickers", category: "accessories", placeholderImage: "https://placehold.co/400x400/fbbf24/1e293b?text=Stickers", defaultPrompt: "A {style} flat-lay of six colorful die-cut vinyl stickers arranged on a clean white surface, featuring this logo design in various sizes.", printArea: { width: 1800, height: 1800, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "laptop-sleeve", name: "Laptop Sleeve 15\"", description: "Neoprene protective sleeve", category: "accessories", placeholderImage: "https://placehold.co/400x400/6366f1/ffffff?text=Laptop+Sleeve", defaultPrompt: "A {style} product shot of a neoprene laptop sleeve on a desk, featuring this logo design on the front panel.", printArea: { width: 4200, height: 3000, unit: "px", dpi: 300 }, variants: [{ id: "13", name: "13 inch" }, { id: "15", name: "15 inch" }], popular: false },
      { id: "beanie", name: "Knit Beanie", description: "Ribbed cuffed beanie", category: "apparel", placeholderImage: "https://placehold.co/400x400/1e293b/f8fafc?text=Beanie", defaultPrompt: "A {style} winter lifestyle shot of a ribbed knit beanie on a wooden surface, featuring this logo embroidered on the front fold.", printArea: { width: 1200, height: 600, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "sticker-holo", name: "Holographic Sticker", description: "Rainbow holographic finish", category: "accessories", placeholderImage: "https://placehold.co/400x400/c084fc/ffffff?text=Holo", defaultPrompt: "A {style} close-up of a holographic sticker catching rainbow light, featuring this logo design with iridescent reflections.", printArea: { width: 1200, height: 1200, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "mug-enamel", name: "Enamel Camping Mug", description: "Retro speckled enamel", category: "drinkware", placeholderImage: "https://placehold.co/400x400/78716c/ffffff?text=Enamel+Mug", defaultPrompt: "A {style} outdoor campfire shot of a speckled enamel camping mug, featuring this logo design on the side.", printArea: { width: 2400, height: 1000, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "bottle-matte", name: "Matte Water Bottle", description: "32oz insulated bottle", category: "drinkware", placeholderImage: "https://placehold.co/400x400/334155/f8fafc?text=Bottle", defaultPrompt: "A {style} fitness lifestyle shot of a matte insulated water bottle at a gym, featuring this logo on the body.", printArea: { width: 2700, height: 1400, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "socks-crew", name: "Crew Socks", description: "Combed cotton crew length", category: "apparel", placeholderImage: "https://placehold.co/400x400/f97316/ffffff?text=Socks", defaultPrompt: "A {style} flat-lay of colorful crew socks on a clean surface, featuring this logo pattern repeated along the sock.", printArea: { width: 2400, height: 3600, unit: "px", dpi: 300 }, variants: [{ id: "sm", name: "S/M" }, { id: "lg", name: "L/XL" }], popular: false },
      { id: "skateboard-deck", name: "Skateboard Deck", description: "7.75\" Canadian maple", category: "accessories", placeholderImage: "https://placehold.co/400x400/ef4444/ffffff?text=Skate+Deck", defaultPrompt: "A {style} urban shot of a skateboard deck leaning against a graffiti wall, featuring this logo design as the main deck graphic.", printArea: { width: 2400, height: 8400, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "mousepad-gaming", name: "Gaming Mouse Pad XL", description: "Extended desk pad 900x400mm", category: "accessories", placeholderImage: "https://placehold.co/400x400/0ea5e9/ffffff?text=Mouse+Pad", defaultPrompt: "A {style} gaming desk setup shot with an extended mouse pad, featuring this logo design as an all-over print.", printArea: { width: 10800, height: 4800, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "keychain-metal", name: "Metal Keychain", description: "Zinc alloy with epoxy coating", category: "accessories", placeholderImage: "https://placehold.co/400x400/a3a3a3/1e293b?text=Keychain", defaultPrompt: "A {style} product shot of a metal keychain on a leather surface, featuring this logo as an enamel-fill design.", printArea: { width: 600, height: 600, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "yoga-mat", name: "Premium Yoga Mat", description: "6mm eco-friendly TPE", category: "home", placeholderImage: "https://placehold.co/400x400/a855f7/ffffff?text=Yoga+Mat", defaultPrompt: "A {style} wellness studio shot of a rolled-out yoga mat on a wooden floor, featuring this logo as a centered design.", printArea: { width: 7200, height: 10800, unit: "px", dpi: 300 }, variants: null, popular: false },
      { id: "enamel-pin", name: "Enamel Pin", description: "Soft enamel with butterfly clutch", category: "accessories", placeholderImage: "https://placehold.co/400x400/eab308/1e293b?text=Pin", defaultPrompt: "A {style} macro product shot of a soft enamel pin on a denim jacket, featuring this logo as the pin design.", printArea: { width: 450, height: 450, unit: "px", dpi: 300 }, variants: null, popular: true },
      { id: "coaster-set", name: "Coaster Set (4pc)", description: "Cork-backed ceramic coasters", category: "home", placeholderImage: "https://placehold.co/400x400/92400e/fef3c7?text=Coasters", defaultPrompt: "A {style} lifestyle shot of ceramic coasters on a coffee table next to drinks, featuring this logo design on each coaster.", printArea: { width: 1200, height: 1200, unit: "px", dpi: 300 }, variants: null, popular: false },
    ];

    for (const product of catalogProducts) {
      try {
        await db.insert(merchProducts).values(product).onConflictDoNothing();
      } catch (e) {
        // Product might already exist
      }
    }

    res.json({ message: "Merch catalog seeded successfully", count: catalogProducts.length });
  } catch (error) {
    console.error("Seed merch catalog error:", error);
    res.status(500).json({ message: "Failed to seed merch catalog" });
  }
});

export default router;
