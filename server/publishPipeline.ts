import OpenAI from "openai";
import { generateImageBuffer } from "./services/image-generation";
import { ObjectStorageService } from "./objectStorage";
import type { Product, BrandProfile, ListingData } from "../shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface PublishPipelineResult {
  listingData: ListingData;
  generatedImages: string[];
}

const MARKETPLACE_PROMPTS: Record<string, string> = {
  amazon: `You are an expert Amazon product listing specialist. Generate content optimized for Amazon's A9 search algorithm.
Requirements:
- Title: Follow Amazon title format (Brand + Model + Key Feature + Product Type + Size/Color). Max 200 chars.
- Description: HTML-formatted product description with feature highlights. 2000+ chars recommended.
- bulletPoints: Exactly 5 bullet points, each starting with a CAPITALIZED benefit keyword. Max 500 chars each.
- tags: Backend search terms (no brand names, no ASINs). 10 terms max.
- seoTitle: Amazon SEO title variant
- metaDescription: Not used on Amazon but fill for completeness
- searchTerms: Amazon backend search terms (comma-separated, max 250 bytes total)
- platformSpecific: Include { "productType": string, "browseNode": string, "targetAudience": string, "itemTypeKeyword": string, "subjectMatter": string[], "usageKeywords": string[] }`,

  etsy: `You are an expert Etsy shop listing specialist. Generate content that appeals to Etsy's handmade/vintage/unique marketplace culture.
Requirements:
- Title: SEO-rich title using long-tail keywords. Max 140 chars.
- Description: Story-driven description with personality. Include materials, dimensions, care instructions. 1000+ chars.
- bulletPoints: 5 key product highlights
- tags: Exactly 13 Etsy tags (Etsy allows max 13). Mix of broad and long-tail keywords.
- seoTitle: Optimized for Etsy search
- metaDescription: Shop listing summary
- searchTerms: Long-tail search phrases buyers use on Etsy
- platformSpecific: Include { "materials": string[], "occasion": string, "style": string, "primaryColor": string, "secondaryColor": string, "whoMadeIt": "i_did"|"collective"|"someone_else", "whenWasItMade": string, "section": string }`,

  tiktok: `You are an expert TikTok Shop listing specialist. Generate content optimized for TikTok's younger, trend-driven audience.
Requirements:
- Title: Short, punchy, trend-aware title. Max 100 chars. Use trending words.
- Description: Short, engaging description with emojis. Focus on viral appeal and social proof. 500-800 chars.
- bulletPoints: 5 quick-hit selling points with emojis
- tags: 10 hashtag-style tags (without #) optimized for TikTok discovery
- seoTitle: TikTok-optimized title
- metaDescription: Short hook for TikTok listing preview
- searchTerms: Trending search terms on TikTok Shop
- platformSpecific: Include { "videoScript": string, "hookLine": string, "trendingHashtags": string[], "targetDemographic": string, "contentAngle": string }`,

  woocommerce: `You are an expert WooCommerce/WordPress e-commerce specialist. Generate content for a self-hosted WooCommerce store.
Requirements:
- Title: Clean, SEO-optimized product title. Max 100 chars.
- Description: Full HTML-compatible description with structured content (headers, lists, paragraphs). 1500+ chars.
- bulletPoints: 5 feature highlights for the product page
- tags: 10 WordPress/WooCommerce product tags for categories and filtering
- seoTitle: Yoast SEO optimized title (max 60 chars)
- metaDescription: Yoast SEO meta description (max 160 chars)
- searchTerms: WordPress search-optimized terms
- platformSpecific: Include { "shortDescription": string, "categories": string[], "attributes": { name: string, values: string[] }[], "crossSellKeywords": string[], "upsellKeywords": string[] }`,

  shopify: `You are an expert Shopify store listing specialist. Generate content optimized for Shopify's e-commerce platform and its built-in SEO.
Requirements:
- Title: Clean, keyword-rich product title. Max 120 chars.
- Description: Rich HTML-compatible description with benefit-driven copy, feature lists, and lifestyle context. 1500+ chars.
- bulletPoints: 5 key product features for the description
- tags: 10 Shopify product tags for collections, filtering, and search
- seoTitle: Shopify SEO page title (max 70 chars)
- metaDescription: Shopify SEO meta description (max 160 chars)
- searchTerms: Terms shoppers search for on Shopify stores
- platformSpecific: Include { "productType": string, "vendor": string, "collections": string[], "variants": { option: string, values: string[] }[], "metafields": { namespace: string, key: string, value: string }[] }`,

  printify: `You are an expert print-on-demand product listing specialist for Printify. Generate content that highlights customization, print quality, and unique design appeal.
Requirements:
- Title: Eye-catching title emphasizing the design/print. Max 120 chars.
- Description: Description focusing on print quality, materials, fit/sizing (for apparel), and design uniqueness. Include care instructions. 1000+ chars.
- bulletPoints: 5 selling points covering design, material, comfort/quality, care, and shipping
- tags: 10 tags optimized for Printify/marketplace discovery (design themes, product type, style)
- seoTitle: SEO title for the Printify listing
- metaDescription: Meta description highlighting the design
- searchTerms: Search terms for print-on-demand shoppers
- platformSpecific: Include { "printProvider": string, "printAreas": string[], "designDescription": string, "materialComposition": string, "sizeGuide": string, "careInstructions": string, "mockupAngles": string[] }`,

  wix: `You are an expert Wix e-commerce store listing specialist. Generate content optimized for Wix Stores and its built-in SEO tools.
Requirements:
- Title: Professional, SEO-optimized product title. Max 100 chars.
- Description: Wix-compatible rich text description with visual formatting. 1200+ chars.
- bulletPoints: 5 key product highlights
- tags: 10 product tags for Wix store categories and search
- seoTitle: Wix SEO page title (max 60 chars)
- metaDescription: Wix SEO meta description (max 160 chars)
- searchTerms: Search terms for Wix store internal search
- platformSpecific: Include { "productType": "physical"|"digital", "collections": string[], "customFields": { title: string, value: string }[], "ribbonText": string, "brand": string, "infoSections": { title: string, description: string }[] }`,

  instagram: `You are an expert Instagram Shopping and social commerce specialist. Generate content optimized for Instagram's visual-first shopping experience.
Requirements:
- Title: Short, catchy, Instagram-friendly product name. Max 80 chars.
- Description: Engaging copy with emojis, lifestyle language, and social proof hooks. 500-800 chars. Write like an influencer, not a catalog.
- bulletPoints: 5 punchy features with emojis that work in Instagram captions
- tags: 15 Instagram hashtags (without #) mixing branded, niche, and trending tags
- seoTitle: Instagram Shopping product title
- metaDescription: Short product tagline for the shop tab
- searchTerms: Instagram Explore and search discovery terms
- platformSpecific: Include { "captionTemplate": string, "storyTemplate": string, "reelHook": string, "collabTags": string[], "aestheticStyle": string, "bestPostTime": string, "contentPillars": string[] }`,

  gumroad: `You are an expert Gumroad product listing specialist. Generate content optimized for Gumroad's creator-economy marketplace, ideal for digital products, courses, memberships, and unique physical goods.
Requirements:
- Title: Clear, value-driven product title. Max 80 chars.
- Description: Creator-style product page copy. Conversational, benefit-focused. Include what the buyer gets, who it's for, and social proof hooks. 800-1200 chars. Use markdown formatting.
- bulletPoints: 5 "what you'll get" style bullet points
- tags: 8 Gumroad discovery tags
- seoTitle: SEO title for Gumroad product page
- metaDescription: Short value proposition for search
- searchTerms: Terms Gumroad shoppers search for
- platformSpecific: Include { "pricingModel": "one_time"|"subscription"|"pay_what_you_want", "suggestedPrice": number, "minimumPrice": number, "deliverables": string[], "targetCreator": string, "category": string, "coverImagePrompt": string, "previewContent": string }`,

  website: `You are an expert e-commerce website copywriter for affordablestorestuff.com. Generate content for a custom storefront.
Requirements:
- Title: Clean, benefit-driven product title. Max 80 chars.
- Description: Rich product description with storytelling, benefits, and specifications. 1000+ chars.
- bulletPoints: 5 key selling points
- tags: 10 SEO keywords for the website
- seoTitle: SEO-optimized page title (max 60 chars)
- metaDescription: SEO meta description (max 160 chars)
- searchTerms: Internal site search terms
- platformSpecific: Include { "shortDescription": string, "features": string[], "specifications": Record<string, string>, "faqItems": { question: string, answer: string }[] }`,
};

function buildProductContext(product: Product, brandProfile?: BrandProfile): string {
  let context = `Product: ${product.title}
Description: ${product.description || "No description provided"}
Price: $${product.price}
Category: ${product.category || "General"}
SKU: ${product.sku || "N/A"}`;

  if (product.tags && (product.tags as string[]).length > 0) {
    context += `\nTags: ${(product.tags as string[]).join(", ")}`;
  }

  if (brandProfile) {
    context += `\n\nBrand Voice:
- Tone: ${brandProfile.tone}
- Target Audience: ${brandProfile.targetAudience}
- Brand Keywords: ${(brandProfile.keywords as string[]).join(", ")}
- Brand Description: ${brandProfile.description}`;
  }

  return context;
}

export async function generateListingContent(
  product: Product,
  marketplace: string,
  brandProfile?: BrandProfile
): Promise<ListingData> {
  const systemPrompt = MARKETPLACE_PROMPTS[marketplace] || MARKETPLACE_PROMPTS.website;
  const productContext = buildProductContext(product, brandProfile);

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate a complete marketplace listing for this product. Return ONLY valid JSON with these exact fields: title, description, bulletPoints (array of strings), tags (array of strings), seoTitle, metaDescription, searchTerms (array of strings), platformSpecific (object with marketplace-specific fields as described).

${productContext}`,
      },
    ],
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  return {
    title: parsed.title || product.title,
    description: parsed.description || product.description,
    bulletPoints: parsed.bulletPoints || [],
    tags: parsed.tags || (product.tags as string[]) || [],
    seoTitle: parsed.seoTitle || product.title,
    metaDescription: parsed.metaDescription || "",
    searchTerms: parsed.searchTerms || [],
    images: [],
    platformSpecific: parsed.platformSpecific || {},
  };
}

export async function generateProductImage(
  product: Product,
  marketplace: string,
  index: number = 0
): Promise<Buffer> {
  const styleGuides: Record<string, string> = {
    amazon: "Professional white background product photography, clean studio lighting, high resolution commercial product shot, no text overlays, centered product",
    etsy: "Lifestyle product photography with warm natural lighting, cozy aesthetic setting, handcrafted feel, styled flat lay or in-use context",
    tiktok: "Trendy social media product photo, vibrant colors, eye-catching composition, lifestyle context, youthful aesthetic, Instagram-worthy",
    shopify: "Premium e-commerce product photography, clean modern aesthetic, neutral background, professional studio quality, brand-forward styling",
    printify: "Print-on-demand product mockup photography, showing print/design clearly, lifestyle context, multiple product angles showing the print quality",
    wix: "Elegant product photography for modern web store, clean background with subtle styling, professional commercial quality",
    instagram: "Instagram-worthy aesthetic product photography, beautiful styling, natural lighting, lifestyle flat lay, social media optimized square composition",
    gumroad: "Creator-economy product visual, modern and minimal, clean digital product showcase, bold typography-friendly composition",
    woocommerce: "Clean e-commerce product photography, white or light gray background, professional studio quality, multiple angle feel",
    website: "Modern e-commerce product photography, clean background, professional lighting, detail-focused, hero image quality",
  };

  const style = styleGuides[marketplace] || styleGuides.website;
  const angles = ["front view hero shot", "angled detail view", "lifestyle context shot", "close-up texture/detail"];
  const angle = angles[index % angles.length];

  const prompt = `${style}. ${angle} of: ${product.title}. ${product.description ? product.description.slice(0, 200) : ""}. Professional e-commerce product image, no text, no watermarks.`;

  return generateImageBuffer(prompt, "1024x1024");
}

export async function uploadImageToStorage(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  const objectStorage = new ObjectStorageService();
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) {
    throw new Error("Object storage not configured");
  }

  const { Storage } = await import("@google-cloud/storage");
  const gcs = new Storage();
  const bucket = gcs.bucket(bucketId);
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").filter(Boolean);
  const basePath = publicPaths[0] || "public";
  const filePath = `${basePath}/product-images/${fileName}`;
  const file = bucket.file(filePath);

  await file.save(imageBuffer, {
    metadata: { contentType: "image/png" },
  });

  try {
    await file.makePublic();
  } catch (e) {
  }

  return `product-images/${fileName}`;
}

export async function runPublishPipeline(
  product: Product,
  marketplace: string,
  brandProfile?: BrandProfile,
  generateImages: boolean = true,
  imageCount: number = 2
): Promise<PublishPipelineResult> {
  const listingData = await generateListingContent(product, marketplace, brandProfile);

  const generatedImages: string[] = [];

  if (generateImages) {
    for (let i = 0; i < imageCount; i++) {
      try {
        const imageBuffer = await generateProductImage(product, marketplace, i);
        const fileName = `${product.id}-${marketplace}-${Date.now()}-${i}.png`;
        const imagePath = await uploadImageToStorage(imageBuffer, fileName);
        generatedImages.push(imagePath);
      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error);
      }
    }
  }

  listingData.images = generatedImages;

  return { listingData, generatedImages };
}
