import { describe, it, expect } from "vitest";
import { sanitize, buildMockupPrompt, buildProductPrompt, buildSocialPrompt } from "../../../../server/services/prompt-builder";

describe("Prompt Builder", () => {
  describe("sanitize", () => {
    it("should normalize whitespace", () => {
      const result = sanitize("hello   world\n\n\nfoo");
      expect(result).not.toContain("\n\n\n");
    });

    it("should enforce max length", () => {
      const longText = "a".repeat(5000);
      const result = sanitize(longText);
      expect(result.length).toBeLessThanOrEqual(4000);
    });

    it("should handle empty input", () => {
      expect(sanitize("")).toBe("");
    });
  });

  describe("buildMockupPrompt", () => {
    it("should replace style placeholder", () => {
      const result = buildMockupPrompt(
        { defaultPrompt: "A {style} photo of a shirt" } as any,
        { stylePreference: "minimal" } as any
      );
      expect(result).toContain("minimal");
      expect(result).not.toContain("{style}");
    });
  });

  describe("buildSocialPrompt", () => {
    it("should add platform constraints for instagram", () => {
      const result = buildSocialPrompt("Write a post", "instagram");
      expect(result).toContain("Instagram");
    });

    it("should return original prompt for unknown platform", () => {
      const result = buildSocialPrompt("Write a post", "unknown");
      expect(result).toBe("Write a post");
    });
  });
});
