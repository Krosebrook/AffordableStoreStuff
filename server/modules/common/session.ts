import type { Request, Response } from "express";
import { randomUUID } from "crypto";

export function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.cartSessionId;

  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie("cartSessionId", sessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
  }

  return sessionId;
}
