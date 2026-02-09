import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users, teamMembers } from "@shared/schema";
import { eq, and } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Requires an authenticated session. Attaches req.userId.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  let userId = req.session.userId;

  // Fallback to Replit OIDC
  if (!userId && req.user && (req.user as any).claims?.sub) {
    userId = (req.user as any).claims.sub;
  }

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  req.userId = userId;
  next();
}

/**
 * Requires the authenticated user to have one of the specified roles.
 * Must be used after requireAuth.
 */
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.userId));
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
}

/**
 * Requires the caller to have one of the specified team roles.
 * Reads teamId from req.params.teamId or req.body.teamId.
 * Must be used after requireAuth.
 */
export function requireTeamRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const teamId = String(req.params.teamId || req.body.teamId);
    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    try {
      const [member] = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.userId)));

      if (!member) {
        return res.status(403).json({ message: "Not a member of this team" });
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({ message: "Insufficient team permissions" });
      }

      next();
    } catch (error) {
      console.error("Team role check error:", error);
      res.status(500).json({ message: "Team authorization check failed" });
    }
  };
}
