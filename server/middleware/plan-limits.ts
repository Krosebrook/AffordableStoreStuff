import type { Request, Response, NextFunction } from "express";
import { getUserUsage } from "../services/usage-tracking-service";

type LimitType = "aiCredits" | "products" | "teamMembers" | "storage";

export function enforcePlanLimit(limitType: LimitType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next(); // Let auth middleware handle this
      }

      const usage = await getUserUsage(req.userId);
      const resource = usage[limitType];

      const used = "usedMb" in resource ? resource.usedMb : resource.used;
      const limit = "limitMb" in resource ? resource.limitMb : resource.limit;

      if (limit !== null && used >= limit) {
        return res.status(403).json({
          message: `Plan limit reached for ${limitType}`,
          current: used,
          limit,
          upgrade: true,
        });
      }

      next();
    } catch (error) {
      console.error("Plan limit check error:", error);
      next(); // Don't block on errors
    }
  };
}
