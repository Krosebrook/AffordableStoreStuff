/**
 * LRU Cache for AI generation responses
 * Prevents duplicate API calls for identical prompts
 */

interface CacheEntry {
  value: any;
  timestamp: number;
  hits: number;
}

// djb2 hash for fingerprinting
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return hash.toString(36);
}

export class AICache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private ttlMs: number;
  private totalHits = 0;
  private totalMisses = 0;

  constructor(maxSize = 100, ttlMs = 3600_000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  private makeKey(provider: string, prompt: string, model?: string): string {
    const raw = `${provider}:${model || "default"}:${prompt}`;
    return djb2Hash(raw);
  }

  get(provider: string, prompt: string, model?: string): any | null {
    const key = this.makeKey(provider, prompt, model);
    const entry = this.cache.get(key);

    if (!entry) {
      this.totalMisses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.totalMisses++;
      return null;
    }

    entry.hits++;
    this.totalHits++;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(provider: string, prompt: string, model: string | undefined, value: any): void {
    const key = this.makeKey(provider, prompt, model);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  getStats() {
    const total = this.totalHits + this.totalMisses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.totalHits,
      misses: this.totalMisses,
      hitRate: total > 0 ? ((this.totalHits / total) * 100).toFixed(1) + "%" : "0%",
      ttlMs: this.ttlMs,
    };
  }

  clear(): void {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }
}

export const aiCache = new AICache();
