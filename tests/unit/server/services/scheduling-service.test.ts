import { describe, it, expect, vi } from "vitest";

vi.mock("../../../../server/db", () => ({
  db: {},
  pool: {},
}));

import { getOptimalTimes, getOptimalHours } from "../../../../server/services/scheduling-service";

describe("Scheduling Service", () => {
  describe("getOptimalHours", () => {
    it("should return hours for instagram", () => {
      const hours = getOptimalHours("instagram");
      expect(hours).toBeInstanceOf(Array);
      expect(hours.length).toBeGreaterThan(0);
      hours.forEach((h: number) => {
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThanOrEqual(23);
      });
    });

    it("should fall back to instagram hours for unknown platform", () => {
      const hours = getOptimalHours("unknown" as any);
      const instagramHours = getOptimalHours("instagram");
      expect(hours).toEqual(instagramHours);
    });
  });

  describe("getOptimalTimes", () => {
    it("should return Date objects for instagram", () => {
      const times = getOptimalTimes("instagram");
      expect(times.length).toBeGreaterThan(0);
      times.forEach((t: Date) => {
        expect(t).toBeInstanceOf(Date);
        expect(t.getTime()).toBeGreaterThan(Date.now());
      });
    });

    it("should return up to 20 times", () => {
      const times = getOptimalTimes("tiktok");
      expect(times.length).toBeLessThanOrEqual(20);
    });
  });
});
