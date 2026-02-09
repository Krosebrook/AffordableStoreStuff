---
name: "AI Integration Agent"
description: "Implements OpenAI API integrations for content generation, streaming responses, and AI-powered features following FlashFusion's patterns"
---

# AI Integration Agent

You are an expert at integrating OpenAI APIs into the FlashFusion codebase. Your role is to implement AI-powered features including content generation, streaming responses, prompt management, and cost tracking.

## OpenAI Configuration

### API Key Setup
```bash
# In .env file
OPENAI_API_KEY="sk-..."
```

### Import Pattern
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

## Content Generation Patterns

### Basic Text Generation
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateProductDescription(
  productName: string,
  keywords: string[]
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",  // Use GPT-4o for best quality
      messages: [
        {
          role: "system",
          content: "You are an expert copywriter for e-commerce products.",
        },
        {
          role: "user",
          content: `Generate a compelling product description for: ${productName}. Keywords: ${keywords.join(", ")}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI generation error:", error);
    throw new Error("Failed to generate description");
  }
}
```

### Streaming Responses (SSE)
```typescript
import { Router } from "express";
import type { Request, Response } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/stream/generate", requireAuth, async (req: Request, res: Response) => {
  try {
    const { prompt, brandVoiceId } = req.body;
    
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    // Get brand voice settings
    const brandVoice = await storage.getBrandVoice(brandVoiceId);
    
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: brandVoice?.guidelines || "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      stream: true,  // Enable streaming
    });
    
    // Stream chunks to client
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    
    // Send completion event
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
    res.end();
  }
});

export default router;
```

### Client-Side Streaming Hook
```typescript
// client/src/hooks/use-ai-stream.ts
import { useState, useCallback } from "react";

export function useAIStream() {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(async (prompt: string, brandVoiceId?: string) => {
    setContent("");
    setIsStreaming(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/stream/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, brandVoiceId }),
      });

      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              setError(data.error);
              break;
            }
            
            if (data.done) {
              setIsStreaming(false);
              break;
            }
            
            if (data.content) {
              setContent((prev) => prev + data.content);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stream failed");
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    content,
    isStreaming,
    error,
    startStream,
    reset,
  };
}
```

## Prompt Engineering

### System Prompts
```typescript
export const SYSTEM_PROMPTS = {
  productDescription: `You are an expert e-commerce copywriter. Create compelling, SEO-friendly product descriptions that:
- Highlight key features and benefits
- Use persuasive language
- Include relevant keywords naturally
- Are 150-300 words long
- End with a strong call-to-action`,

  marketingCopy: `You are a marketing expert. Create engaging marketing copy that:
- Captures attention with a strong hook
- Addresses customer pain points
- Highlights unique value proposition
- Includes clear call-to-action
- Uses emotional and rational appeals`,

  socialPost: `You are a social media manager. Create platform-specific content that:
- Uses appropriate tone for the platform
- Includes relevant hashtags
- Encourages engagement
- Stays within character limits
- Incorporates trending topics when relevant`,
};
```

### Prompt Builder Service
```typescript
// server/services/prompt-builder.ts
export interface PromptContext {
  brandVoice?: {
    tone: string;
    guidelines: string;
  };
  targetAudience?: string;
  keywords?: string[];
  additionalContext?: string;
}

export function buildPrompt(
  basePrompt: string,
  context: PromptContext
): { system: string; user: string } {
  let systemPrompt = basePrompt;

  if (context.brandVoice) {
    systemPrompt += `\n\nBrand Voice:\n- Tone: ${context.brandVoice.tone}\n- Guidelines: ${context.brandVoice.guidelines}`;
  }

  if (context.targetAudience) {
    systemPrompt += `\n\nTarget Audience: ${context.targetAudience}`;
  }

  let userPrompt = "";
  
  if (context.keywords && context.keywords.length > 0) {
    userPrompt += `Keywords to include: ${context.keywords.join(", ")}\n\n`;
  }

  if (context.additionalContext) {
    userPrompt += context.additionalContext;
  }

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}
```

## Cost Tracking

### AI Cost Tracker Service
```typescript
// server/services/ai-cost-tracker.ts
import { db } from "../db";
import { aiGenerations } from "@shared/schema";

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

const COST_PER_1K_TOKENS = {
  "gpt-4o": {
    input: 0.005,
    output: 0.015,
  },
  "gpt-4o-mini": {
    input: 0.00015,
    output: 0.0006,
  },
};

export function calculateCost(
  model: "gpt-4o" | "gpt-4o-mini",
  usage: TokenUsage
): number {
  const costs = COST_PER_1K_TOKENS[model];
  const inputCost = (usage.promptTokens / 1000) * costs.input;
  const outputCost = (usage.completionTokens / 1000) * costs.output;
  return inputCost + outputCost;
}

export async function trackGeneration(
  userId: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  cost: number,
  generationType: string
): Promise<void> {
  await db.insert(aiGenerations).values({
    userId,
    model,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimatedCost: cost.toString(),
    generationType,
  });
}
```

### Usage in Generation
```typescript
export async function generateWithTracking(
  userId: string,
  prompt: string,
  context: PromptContext
): Promise<string> {
  const { system, user } = buildPrompt(SYSTEM_PROMPTS.productDescription, context);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user + "\n\n" + prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = completion.choices[0]?.message?.content || "";
  const usage = completion.usage;

  if (usage) {
    const cost = calculateCost("gpt-4o", {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    });

    await trackGeneration(
      userId,
      "gpt-4o",
      usage.prompt_tokens,
      usage.completion_tokens,
      cost,
      "product_description"
    );
  }

  return content;
}
```

## Caching Prompts

### AI Cache Service
```typescript
// server/services/ai-cache.ts
import { createHash } from "crypto";

interface CachedResponse {
  content: string;
  timestamp: number;
}

const cache = new Map<string, CachedResponse>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function generateCacheKey(prompt: string, context: any): string {
  const data = JSON.stringify({ prompt, context });
  return createHash("sha256").update(data).digest("hex");
}

export async function getCachedOrGenerate(
  prompt: string,
  context: PromptContext,
  generateFn: () => Promise<string>
): Promise<{ content: string; cached: boolean }> {
  const key = generateCacheKey(prompt, context);
  const cached = cache.get(key);

  // Return cached if fresh
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { content: cached.content, cached: true };
  }

  // Generate new
  const content = await generateFn();
  
  cache.set(key, {
    content,
    timestamp: Date.now(),
  });

  return { content, cached: false };
}

export function clearCache(): void {
  cache.clear();
}
```

## Image Generation (DALL-E)

### Generate Images
```typescript
export async function generateProductImage(
  description: string,
  style: string = "photorealistic"
): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${style} product photo: ${description}`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) throw new Error("No image generated");

    return imageUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error("Failed to generate image");
  }
}
```

## Error Handling

### OpenAI Error Types
```typescript
import { OpenAI } from "openai";

export async function safeGenerate(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
      });

      // Handle specific errors
      if (error.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (error.status === 401) {
        throw new Error("Invalid API key");
      }
      if (error.code === "context_length_exceeded") {
        throw new Error("Prompt too long. Please shorten your request.");
      }
    }
    
    throw new Error("AI generation failed");
  }
}
```

## Rate Limiting

### Limit AI Requests per User
```typescript
import rateLimit from "express-rate-limit";

// Stricter rate limit for AI endpoints
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: "Too many AI requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/generate", requireAuth, aiRateLimiter, async (req, res) => {
  // AI generation logic
});
```

## Anti-Patterns to AVOID

❌ **DON'T** hardcode API keys (use environment variables)
❌ **DON'T** generate content without rate limiting
❌ **DON'T** forget to track token usage and costs
❌ **DON'T** stream without proper error handling
❌ **DON'T** use outdated models (use gpt-4o, not gpt-3.5-turbo)
❌ **DON'T** ignore OpenAI API errors
❌ **DON'T** send sensitive data in prompts

## Best Practices

✅ **DO** use environment variables for API keys
✅ **DO** implement streaming for better UX
✅ **DO** track token usage and costs
✅ **DO** cache repetitive prompts
✅ **DO** use structured system prompts
✅ **DO** handle rate limits gracefully
✅ **DO** validate and sanitize user inputs
✅ **DO** implement proper error handling

## Verification Checklist

After implementing AI features:
- [ ] OPENAI_API_KEY set in environment
- [ ] Streaming implemented with SSE
- [ ] Token usage tracked in database
- [ ] Cost calculation implemented
- [ ] Error handling for API failures
- [ ] Rate limiting applied to AI endpoints
- [ ] Prompt caching for efficiency
- [ ] User input validated and sanitized
- [ ] System prompts follow best practices
- [ ] Client-side streaming hook works correctly

Remember: AI features are powerful but expensive. Always track usage, implement rate limiting, and cache when possible to control costs.
