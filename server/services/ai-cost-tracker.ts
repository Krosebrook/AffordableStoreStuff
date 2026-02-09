/**
 * Tracks AI generation costs per session and aggregate
 */

interface CostEntry {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  timestamp: number;
}

// Cost per 1K tokens (input/output) for common models
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "dall-e-3": { input: 0.04, output: 0 }, // per image, not per token
  "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
  "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
};

class AICostTracker {
  private sessions: Map<string, CostEntry[]> = new Map();
  private globalEntries: CostEntry[] = [];

  estimateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const pricing = MODEL_PRICING[model];
    if (!pricing) {
      // Fallback: average GPT-4o pricing
      return ((promptTokens / 1000) * 0.0025) + ((completionTokens / 1000) * 0.01);
    }
    return ((promptTokens / 1000) * pricing.input) + ((completionTokens / 1000) * pricing.output);
  }

  record(
    sessionId: string | null,
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): CostEntry {
    const entry: CostEntry = {
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCost: this.estimateCost(model, promptTokens, completionTokens),
      timestamp: Date.now(),
    };

    this.globalEntries.push(entry);

    if (sessionId) {
      const sessionEntries = this.sessions.get(sessionId) || [];
      sessionEntries.push(entry);
      this.sessions.set(sessionId, sessionEntries);
    }

    // Keep global entries capped at 10000
    if (this.globalEntries.length > 10000) {
      this.globalEntries = this.globalEntries.slice(-5000);
    }

    return entry;
  }

  getSessionCost(sessionId: string) {
    const entries = this.sessions.get(sessionId) || [];
    const totalCost = entries.reduce((sum, e) => sum + e.estimatedCost, 0);
    const totalTokens = entries.reduce((sum, e) => sum + e.totalTokens, 0);

    return {
      sessionId,
      requests: entries.length,
      totalTokens,
      totalCost: parseFloat(totalCost.toFixed(6)),
      entries,
    };
  }

  getAggregateCost(sinceMs?: number) {
    const since = sinceMs || 0;
    const entries = this.globalEntries.filter((e) => e.timestamp >= since);
    const totalCost = entries.reduce((sum, e) => sum + e.estimatedCost, 0);
    const totalTokens = entries.reduce((sum, e) => sum + e.totalTokens, 0);

    const byProvider: Record<string, { requests: number; cost: number; tokens: number }> = {};
    for (const entry of entries) {
      if (!byProvider[entry.provider]) {
        byProvider[entry.provider] = { requests: 0, cost: 0, tokens: 0 };
      }
      byProvider[entry.provider].requests++;
      byProvider[entry.provider].cost += entry.estimatedCost;
      byProvider[entry.provider].tokens += entry.totalTokens;
    }

    return {
      totalRequests: entries.length,
      totalTokens,
      totalCost: parseFloat(totalCost.toFixed(6)),
      byProvider,
      since: new Date(since).toISOString(),
    };
  }
}

export const costTracker = new AICostTracker();
