/**
 * Builds structured prompts for different generation contexts
 */

interface ProductInfo {
  name: string;
  category: string;
  defaultPrompt: string;
}

interface SessionInfo {
  stylePreference: string;
  additionalPrompt?: string;
  textOverlays?: any[];
}

interface BrandVoice {
  tone?: string;
  writingStyle?: string;
  vocabularyLevel?: string;
  personality?: string[];
  targetAudience?: string;
  avoidWords?: string[];
  preferredPhrases?: string[];
}

// Remove potential prompt injection patterns
export function sanitize(prompt: string): string {
  return prompt
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\x20-\x7E\n]/g, "") // ASCII printable + newline only
    .trim()
    .slice(0, 4000); // Hard limit
}

export function buildMockupPrompt(product: ProductInfo, session: SessionInfo): string {
  let prompt = product.defaultPrompt.replace(
    /\{style\}/g,
    session.stylePreference || "studio"
  );

  if (session.additionalPrompt) {
    prompt += `\n\nAdditional requirements: ${sanitize(session.additionalPrompt)}`;
  }

  if (session.textOverlays && session.textOverlays.length > 0) {
    const overlayDesc = session.textOverlays
      .map((o: any) => `"${o.text}" in ${o.fontFamily} at ${o.fontSize}px`)
      .join(", ");
    prompt += `\n\nText overlays to include: ${overlayDesc}`;
  }

  return sanitize(prompt);
}

export function buildProductPrompt(prompt: string, brandVoice?: BrandVoice): string {
  if (!brandVoice) return sanitize(prompt);

  const constraints: string[] = [];

  if (brandVoice.tone) {
    constraints.push(`Tone: ${brandVoice.tone}`);
  }
  if (brandVoice.writingStyle) {
    constraints.push(`Writing style: ${brandVoice.writingStyle}`);
  }
  if (brandVoice.vocabularyLevel) {
    constraints.push(`Vocabulary: ${brandVoice.vocabularyLevel}`);
  }
  if (brandVoice.personality?.length) {
    constraints.push(`Brand personality: ${brandVoice.personality.join(", ")}`);
  }
  if (brandVoice.targetAudience) {
    constraints.push(`Target audience: ${brandVoice.targetAudience}`);
  }
  if (brandVoice.avoidWords?.length) {
    constraints.push(`Avoid these words: ${brandVoice.avoidWords.join(", ")}`);
  }
  if (brandVoice.preferredPhrases?.length) {
    constraints.push(`Preferred phrases: ${brandVoice.preferredPhrases.join(", ")}`);
  }

  const voiceSection = constraints.length > 0
    ? `Brand Voice Guidelines:\n${constraints.join("\n")}\n\n`
    : "";

  return sanitize(`${voiceSection}${prompt}`);
}

export function buildSocialPrompt(prompt: string, platform: string): string {
  const platformGuidelines: Record<string, string> = {
    instagram: "Optimize for Instagram: use engaging hooks, relevant hashtags (up to 30), and emojis. Keep under 2200 chars.",
    tiktok: "Optimize for TikTok: use trending hooks, short punchy sentences, relevant hashtags. Keep under 300 chars.",
    youtube: "Optimize for YouTube: write an engaging title (under 60 chars), description with keywords, and tags.",
    linkedin: "Optimize for LinkedIn: professional tone, thought leadership angle, 1-3 hashtags. Keep under 3000 chars.",
    pinterest: "Optimize for Pinterest: keyword-rich description, call to action, relevant hashtags. Keep under 500 chars.",
  };

  const guideline = platformGuidelines[platform] || "";
  return sanitize(`${guideline}\n\n${prompt}`);
}
