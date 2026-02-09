import { describe, it, expect, beforeEach } from "vitest";

describe("AI Cache", () => {
  let aiCache: any;

  beforeEach(async () => {
    // Re-import to get fresh instance
    vi.resetModules();
    const mod = await import("../../../../server/services/ai-cache");
    aiCache = mod.aiCache;
  });

  it("should return undefined for cache miss", () => {
    const result = aiCache.get("openai", "test prompt", "gpt-4");
    expect(result).toBeNull();
  });

  it("should return cached value on hit", () => {
    const mockResult = { success: true, content: "test" };
    aiCache.set("openai", "test prompt", "gpt-4", mockResult);
    const result = aiCache.get("openai", "test prompt", "gpt-4");
    expect(result).toEqual(mockResult);
  });

  it("should track hit and miss stats", () => {
    aiCache.get("openai", "miss", "gpt-4"); // miss
    aiCache.set("openai", "hit", "gpt-4", { success: true });
    aiCache.get("openai", "hit", "gpt-4"); // hit

    const stats = aiCache.getStats();
    expect(stats.misses).toBeGreaterThanOrEqual(1);
    expect(stats.hits).toBeGreaterThanOrEqual(1);
  });
});
