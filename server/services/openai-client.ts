import OpenAI from "openai";

/**
 * Shared OpenAI client instance.
 * Importing this module from multiple server files will reuse the same instance.
 */
export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const AI_MODEL = process.env.AI_MODEL ?? "gpt-4o";
