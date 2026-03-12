import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * JWT secret. Must be set via JWT_SECRET environment variable in production.
 * The default value is intentionally insecure — override it before deploying.
 */
const JWT_SECRET =
  process.env.JWT_SECRET ?? "change-me-in-production-please";

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[AUTH] FATAL: JWT_SECRET environment variable is not set. " +
        "Set JWT_SECRET before starting the server in production."
    );
  } else {
    console.warn(
      "[AUTH] WARNING: JWT_SECRET is not set. Using an insecure default. " +
        "This is only acceptable for local development."
    );
  }
}

// ============================================================
// JWT utilities (built on Node.js crypto — no external deps)
// ============================================================

export interface TokenPayload {
  id: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a signed HS256 JWT.
 * @param payload     Fields to embed (id, username). iat/exp are added automatically.
 * @param expiresInSec Token lifetime in seconds (default: 7 days).
 */
export function createToken(
  payload: Omit<TokenPayload, "iat" | "exp">,
  expiresInSec = 7 * 24 * 3600
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

/**
 * Verify and decode a signed HS256 JWT.
 * Returns the decoded payload or null if the token is invalid/expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;

  // Compute expected signature
  const expected = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(sig, "base64url");
  const expectedBuf = Buffer.from(expected, "base64url");
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString()
    ) as TokenPayload;
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// Express middleware
// ============================================================

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

/**
 * Express middleware that requires a valid Bearer JWT in the Authorization header.
 * Sets `req.user` to the decoded token payload on success.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(auth.slice(7));
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as AuthenticatedRequest).user = payload;
  next();
}

// ============================================================
// In-memory rate limiter (no external deps)
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodically evict expired entries to prevent unbounded memory growth.
const cleanupInterval: ReturnType<typeof setInterval> = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 60_000);
// Allow the process to exit even if this interval is still active (Node.js).
(cleanupInterval as unknown as { unref?: () => void }).unref?.();

/**
 * Express rate-limiting middleware.
 * Uses IP address + path as the bucketing key.
 * @param max      Maximum requests allowed within the window.
 * @param windowMs Window size in milliseconds.
 */
export function rateLimit(max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (entry.count >= max) {
      res.setHeader(
        "Retry-After",
        String(Math.ceil((entry.resetAt - now) / 1000))
      );
      res
        .status(429)
        .json({ error: "Too many requests, please try again later" });
      return;
    }
    entry.count++;
    next();
  };
}
