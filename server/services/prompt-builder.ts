interface BrandContext {
  tone?: string;
  targetAudience?: string;
  keywords?: string[];
  writingStyle?: string;
  vocabularyLevel?: string;
  avoidWords?: string[];
  preferredPhrases?: string[];
  personality?: string[];
  brandValues?: string[];
}

export function buildBrandSystemPrompt(brand?: BrandContext): string {
  let prompt = "You are an expert e-commerce content creator.";

  if (!brand) return prompt;

  if (brand.tone) {
    prompt += ` Write in a ${brand.tone} tone.`;
  }
  if (brand.targetAudience) {
    prompt += ` Target audience: ${brand.targetAudience}.`;
  }
  if (brand.writingStyle) {
    prompt += ` Writing style: ${brand.writingStyle}.`;
  }
  if (brand.vocabularyLevel) {
    prompt += ` Vocabulary level: ${brand.vocabularyLevel}.`;
  }
  if (brand.personality?.length) {
    prompt += ` Brand personality: ${brand.personality.join(", ")}.`;
  }
  if (brand.brandValues?.length) {
    prompt += ` Core values: ${brand.brandValues.join(", ")}.`;
  }
  if (brand.keywords?.length) {
    prompt += ` Incorporate these keywords naturally: ${brand.keywords.join(", ")}.`;
  }
  if (brand.preferredPhrases?.length) {
    prompt += ` Preferred phrases: ${brand.preferredPhrases.join(", ")}.`;
  }
  if (brand.avoidWords?.length) {
    prompt += ` Avoid these words: ${brand.avoidWords.join(", ")}.`;
  }

  return prompt;
}

export function buildProductListingPrompt(
  productType: string,
  platform: string,
  features?: string
): string {
  const platformInstructions: Record<string, string> = {
    amazon: "Optimize for Amazon A9 algorithm. Use keyword-rich title (max 200 chars). Write 5 bullet points highlighting benefits. Include backend search terms.",
    etsy: "Optimize for Etsy search. Handcrafted, story-driven tone. Use long-tail keywords. Include 13 tags.",
    tiktok: "Optimize for TikTok Shop. Short, punchy descriptions. Trend-aware language. Include viral hooks.",
    shopify: "Clean, professional product copy. Focus on brand storytelling and lifestyle benefits.",
    woocommerce: "SEO-optimized for WordPress/WooCommerce. Include structured data hints.",
    general: "Create versatile product copy optimized for search and conversions.",
  };

  return `Generate a complete ${platform} product listing for: "${productType}".
${features ? `Key features: ${features}` : ""}

Platform-specific instructions: ${platformInstructions[platform] || platformInstructions.general}

Return a JSON object with:
- title: Compelling product title
- description: Detailed description (150-250 words)
- bulletPoints: Array of 5 key selling points
- tags: Array of 10 SEO-optimized tags
- suggestedPrice: Reasonable price as a number
- category: Best product category
- seoTitle: SEO title for search engines
- metaDescription: Meta description (max 160 chars)
- searchTerms: Array of 5 backend search terms`;
}

export function buildMarketingPrompt(
  productTitle: string,
  productDescription: string,
  platform: string
): string {
  const platformGuides: Record<string, string> = {
    tiktok: "Write a viral TikTok script. Hook in first 3 seconds. Casual, energetic. 15-30 seconds. Trending hashtags.",
    instagram: "Write an Instagram caption with aesthetic storytelling. Include emojis naturally and 10 relevant hashtags.",
    pinterest: "Write a Pinterest pin description. SEO-optimized with seasonal keywords. Include CTA.",
    email: "Write a promotional email with compelling subject line, preview text, and body with clear CTA.",
    linkedin: "Write a professional LinkedIn post. Business-focused, thought leadership angle.",
    general: "Write versatile marketing copy adaptable across platforms.",
  };

  return `Create marketing content for:
Product: ${productTitle}
Description: ${productDescription}
Platform: ${platform}

${platformGuides[platform] || platformGuides.general}

Return JSON with:
- headline: Attention-grabbing headline
- body: Main copy
- callToAction: Strong CTA
- hashtags: Array of relevant hashtags
- tips: Array of 3 performance optimization tips`;
}

export function buildSocialPostPrompt(
  topic: string,
  platform: string,
  brandContext?: BrandContext
): string {
  let prompt = `Create a social media post for ${platform} about: ${topic}.`;

  if (brandContext?.tone) {
    prompt += ` Tone: ${brandContext.tone}.`;
  }

  prompt += `\n\nReturn JSON with:
- caption: The post text
- hashtags: Array of relevant hashtags
- bestTimeToPost: Suggested posting time
- contentTips: Array of 2 tips for engagement`;

  return prompt;
}
