import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// Mock db module
vi.mock("../../../../server/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
  },
}));

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      session: {} as any,
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe("requireAuth", () => {
    it("should return 401 if no session userId", async () => {
      const { requireAuth } = await import("../../../../server/middleware/auth");
      await requireAuth(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next and set userId if session has userId", async () => {
      mockReq.session = { userId: "user-123" } as any;
      const { requireAuth } = await import("../../../../server/middleware/auth");
      await requireAuth(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).userId).toBe("user-123");
    });
  });
});
