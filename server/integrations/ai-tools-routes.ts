import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  brandVoiceProfiles, 
  productConcepts, 
  marketingCampaigns, 
  aiContentLibrary,
  aiGenerations,
  insertBrandVoiceProfileSchema,
  insertProductConceptSchema,
  insertMarketingCampaignSchema
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { aiService } from "./ai-service";
import { z } from "zod";

const generateProductConceptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  marketplace: z.string().default("general"),
  platforms: z.array(z.string()).optional().default([]),
  brandVoiceId: z.string().optional(),
});

const updateContentFavoriteSchema = z.object({
  isFavorite: z.boolean(),
});

const insertContentLibrarySchema = z.object({
  title: z.string().min(1),
  contentType: z.string(),
  content: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

const router = Router();

// ============================================================================
// BRAND VOICE PROFILES
// ============================================================================

router.get("/brand-voices", async (_req: Request, res: Response) => {
  try {
    const profiles = await db.select().from(brandVoiceProfiles).orderBy(desc(brandVoiceProfiles.createdAt));
    res.json(profiles);
  } catch (error) {
    console.error("Error fetching brand voices:", error);
    res.status(500).json({ error: "Failed to fetch brand voice profiles" });
  }
});

router.get("/brand-voices/:id", async (req: Request, res: Response) => {
  try {
    const profile = await db.select().from(brandVoiceProfiles).where(eq(brandVoiceProfiles.id, req.params.id));
    if (profile.length === 0) {
      return res.status(404).json({ error: "Brand voice profile not found" });
    }
    res.json(profile[0]);
  } catch (error) {
    console.error("Error fetching brand voice:", error);
    res.status(500).json({ error: "Failed to fetch brand voice profile" });
  }
});

router.post("/brand-voices", async (req: Request, res: Response) => {
  try {
    const parsed = insertBrandVoiceProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
    }
    
    const [profile] = await db.insert(brandVoiceProfiles).values(parsed.data).returning();
    res.status(201).json(profile);
  } catch (error) {
    console.error("Error creating brand voice:", error);
    res.status(500).json({ error: "Failed to create brand voice profile" });
  }
});

router.patch("/brand-voices/:id", async (req: Request, res: Response) => {
  try {
    const updateSchema = insertBrandVoiceProfileSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
    }
    
    const [profile] = await db
      .update(brandVoiceProfiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(brandVoiceProfiles.id, req.params.id))
      .returning();
    
    if (!profile) {
      return res.status(404).json({ error: "Brand voice profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error updating brand voice:", error);
    res.status(500).json({ error: "Failed to update brand voice profile" });
  }
});

router.delete("/brand-voices/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(brandVoiceProfiles).where(eq(brandVoiceProfiles.id, req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting brand voice:", error);
    res.status(500).json({ error: "Failed to delete brand voice profile" });
  }
});

// ============================================================================
// PRODUCT CONCEPTS
// ============================================================================

router.get("/product-concepts", async (_req: Request, res: Response) => {
  try {
    const concepts = await db.select().from(productConcepts).orderBy(desc(productConcepts.createdAt)).limit(20);
    res.json(concepts);
  } catch (error) {
    console.error("Error fetching product concepts:", error);
    res.status(500).json({ error: "Failed to fetch product concepts" });
  }
});

router.get("/product-concepts/:id", async (req: Request, res: Response) => {
  try {
    const concept = await db.select().from(productConcepts).where(eq(productConcepts.id, req.params.id));
    if (concept.length === 0) {
      return res.status(404).json({ error: "Product concept not found" });
    }
    res.json(concept[0]);
  } catch (error) {
    console.error("Error fetching product concept:", error);
    res.status(500).json({ error: "Failed to fetch product concept" });
  }
});

router.post("/product-concepts/generate", async (req: Request, res: Response) => {
  try {
    const parsed = generateProductConceptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
    }
    
    const { prompt, marketplace, platforms, brandVoiceId } = parsed.data;

    // Check if OpenAI is available
    const providers = aiService.getAvailableProviders();
    const openaiAvailable = providers.some(p => p.provider === "openai" && p.available);
    
    let generatedTitle = "";
    let generatedDescription = "";
    let generatedTags: string[] = [];
    let generatedFeatures: string[] = [];
    let seoTitle = "";
    let seoDescription = "";
    let aiProvider = "mock";
    let generationCost = "0";
    
    if (openaiAvailable) {
      // Use real AI generation
      try {
        const systemPrompt = `You are an expert e-commerce product copywriter. Generate compelling product content for the ${marketplace} marketplace. 
        Return a JSON object with these fields:
        - title: A catchy product title (max 80 chars)
        - description: A compelling marketing description (150-200 words)
        - tags: An array of 5-8 SEO tags
        - features: An array of 4-6 key product features
        - seoTitle: SEO-optimized title (max 60 chars)
        - seoDescription: SEO meta description (max 160 chars)
        
        Only return valid JSON, no additional text.`;
        
        const result = await aiService.generateText({
          provider: "openai",
          prompt: `Create product content for: ${prompt}`,
          systemPrompt,
          maxTokens: 1000,
        });
        
        if (result.text) {
          try {
            const parsed = JSON.parse(result.text);
            generatedTitle = parsed.title || `AI Product: ${prompt.slice(0, 50)}`;
            generatedDescription = parsed.description || "AI-generated product description";
            generatedTags = parsed.tags || [];
            generatedFeatures = parsed.features || [];
            seoTitle = parsed.seoTitle || generatedTitle;
            seoDescription = parsed.seoDescription || generatedDescription.slice(0, 160);
            aiProvider = "openai";
            generationCost = (result.usage?.estimatedCost || 0).toString();
          } catch {
            generatedTitle = `AI Product: ${prompt.slice(0, 50)}`;
            generatedDescription = result.text;
          }
        }
        
        // Log the generation
        await db.insert(aiGenerations).values({
          provider: "openai",
          model: result.model,
          promptType: "text",
          prompt,
          outputData: result,
          tokensUsed: result.usage?.totalTokens || 0,
          cost: generationCost,
          status: "completed",
        });
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        // Fall back to mock data
        generatedTitle = `${marketplace} Product: ${prompt.slice(0, 40)}`;
        generatedDescription = `A premium ${marketplace} product designed for modern consumers. ${prompt}. Features innovative design and superior quality.`;
        generatedTags = ["premium", marketplace, "innovative", "quality", "bestseller"];
        generatedFeatures = ["Premium build quality", "Modern design", "Easy to use", "Great value"];
        seoTitle = generatedTitle;
        seoDescription = generatedDescription.slice(0, 160);
      }
    } else {
      // Mock generation when AI not available
      generatedTitle = `${marketplace.charAt(0).toUpperCase() + marketplace.slice(1)} Product: ${prompt.slice(0, 40)}`;
      generatedDescription = `A premium ${marketplace} product designed for modern consumers. ${prompt}. Features innovative design, superior quality materials, and exceptional value. Perfect for those who appreciate quality and style.`;
      generatedTags = ["premium", marketplace, "innovative", "quality", "bestseller", "trending"];
      generatedFeatures = ["Premium build quality", "Modern aesthetic design", "Intuitive user experience", "Exceptional durability"];
      seoTitle = generatedTitle;
      seoDescription = generatedDescription.slice(0, 160);
    }
    
    // Save the concept to database
    const [concept] = await db.insert(productConcepts).values({
      prompt,
      marketplace,
      targetPlatforms: platforms || [],
      brandVoiceId,
      generatedTitle,
      generatedDescription,
      generatedTags,
      generatedFeatures,
      seoTitle,
      seoDescription,
      seoKeywords: generatedTags,
      status: "ready",
      aiProvider,
      generationCost,
    }).returning();
    
    res.status(201).json(concept);
  } catch (error) {
    console.error("Error generating product concept:", error);
    res.status(500).json({ error: "Failed to generate product concept" });
  }
});

router.patch("/product-concepts/:id", async (req: Request, res: Response) => {
  try {
    const updateSchema = insertProductConceptSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
    }
    
    const [concept] = await db
      .update(productConcepts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(productConcepts.id, req.params.id))
      .returning();
    
    if (!concept) {
      return res.status(404).json({ error: "Product concept not found" });
    }
    res.json(concept);
  } catch (error) {
    console.error("Error updating product concept:", error);
    res.status(500).json({ error: "Failed to update product concept" });
  }
});

router.delete("/product-concepts/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(productConcepts).where(eq(productConcepts.id, req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product concept:", error);
    res.status(500).json({ error: "Failed to delete product concept" });
  }
});

// ============================================================================
// MARKETING CAMPAIGNS
// ============================================================================

router.get("/campaigns", async (_req: Request, res: Response) => {
  try {
    const campaigns = await db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.createdAt)).limit(20);
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch marketing campaigns" });
  }
});

router.get("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const campaign = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, req.params.id));
    if (campaign.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json(campaign[0]);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Failed to fetch marketing campaign" });
  }
});

router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const parsed = insertMarketingCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
    }
    
    const [campaign] = await db.insert(marketingCampaigns).values(parsed.data).returning();
    res.status(201).json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create marketing campaign" });
  }
});

router.post("/campaigns/:id/generate-assets", async (req: Request, res: Response) => {
  try {
    const campaign = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, req.params.id));
    if (campaign.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    const { channels } = campaign[0];
    const generatedAssets: Record<string, any[]> = {
      emails: [],
      socialPosts: [],
      adCopy: [],
      headlines: [],
    };
    
    // Mock asset generation (would use AI in production)
    if (channels?.includes("email")) {
      generatedAssets.emails.push({
        subject: `Introducing ${campaign[0].name}`,
        preview: "Don't miss out on this exclusive offer...",
        body: "AI-generated email content would go here.",
      });
    }
    
    if (channels?.includes("social")) {
      generatedAssets.socialPosts.push({
        platform: "instagram",
        content: "Exciting news! Check out our latest...",
        hashtags: ["#new", "#trending", "#musthave"],
      });
    }
    
    const [updated] = await db
      .update(marketingCampaigns)
      .set({ generatedAssets, updatedAt: new Date() })
      .where(eq(marketingCampaigns.id, req.params.id))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error("Error generating campaign assets:", error);
    res.status(500).json({ error: "Failed to generate campaign assets" });
  }
});

// ============================================================================
// AI CONTENT LIBRARY
// ============================================================================

router.get("/content-library", async (_req: Request, res: Response) => {
  try {
    const content = await db.select().from(aiContentLibrary).orderBy(desc(aiContentLibrary.createdAt)).limit(50);
    res.json(content);
  } catch (error) {
    console.error("Error fetching content library:", error);
    res.status(500).json({ error: "Failed to fetch content library" });
  }
});

router.post("/content-library", async (req: Request, res: Response) => {
  try {
    const parsed = insertContentLibrarySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
    }
    
    const [item] = await db.insert(aiContentLibrary).values(parsed.data).returning();
    res.status(201).json(item);
  } catch (error) {
    console.error("Error saving to content library:", error);
    res.status(500).json({ error: "Failed to save content" });
  }
});

router.patch("/content-library/:id/favorite", async (req: Request, res: Response) => {
  try {
    const parsed = updateContentFavoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
    }
    
    const [item] = await db
      .update(aiContentLibrary)
      .set({ isFavorite: parsed.data.isFavorite })
      .where(eq(aiContentLibrary.id, req.params.id))
      .returning();
    
    if (!item) {
      return res.status(404).json({ error: "Content not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({ error: "Failed to update content" });
  }
});

export default router;
