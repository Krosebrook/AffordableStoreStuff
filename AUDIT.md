# Codebase Audit Report — AffordableStoreStuff

**Date:** 2026-03-12  
**Auditor:** GitHub Copilot Coding Agent  
**Repository:** `Krosebrook/AffordableStoreStuff`  
**Commit audited:** `f611e45` (branch `copilot/audit-repository-high-medium-scope`)

---

## Executive Summary

AffordableStoreStuff is a full-stack mobile commerce platform combining a React Native / Expo seller app with an Express API backend hosted on Vercel. The codebase is clean, the documentation is thorough, and the technology choices are sound for an early-stage product. However, several issues — ranging from critical security gaps to performance concerns — require attention before the platform is opened to real users.

**Most critical findings across all levels:**

| Priority | Finding | Status |
|----------|---------|--------|
| 🔴 Critical | All API routes are unprotected (no authentication middleware) | Open — see § Low Level |
| 🔴 Critical | Stripe webhook does not verify signatures (allows spoofed events) | **Fixed in this PR** |
| 🔴 Critical | CI failure: `npm ci` fails due to stale `package-lock.json` | **Fixed in this PR** |
| 🟠 High | `x-session-id` header trusted without authentication (cart/wardrobe data isolation) | Open — see § Low Level |
| 🟠 High | No rate limiting on AI generation endpoints (cost/DoS exposure) | Open — see § Medium Level |
| 🟠 High | N+1 database query in `getCartItems` | **Fixed in this PR** |
| 🟡 Medium | `routes.ts` is a single 1 000-line file with no modular decomposition | Open — see § Medium Level |
| 🟡 Medium | Full-table-scan aggregation in `getAiUsageStats` / `getPublishingQueueStats` | **Fixed in this PR** |
| 🟡 Medium | 2 ESLint errors (`react/no-unescaped-entities`) failing strict CI lint step | **Fixed in this PR** |
| 🟢 Low | Duplicate OpenAI client instantiation in `routes.ts` and `publishPipeline.ts` | Open — see § Low Level |
| 🟢 Low | Pervasive use of `any` type in `storage.ts` interface reduces type safety | Open — see § Low Level |

---

## High Level Scope

### Architecture Pattern

The application follows a **modular monolith with serverless deployment** pattern:

```
[Mobile App — Expo / React Native]
         │ HTTPS / SSE
         ▼
[Vercel Serverless Function — Express 5]
  api/index.ts → server/index.ts → server/routes.ts
         │
         ▼
[Supabase — PostgreSQL via connection pooler]
         │
         ├─ [OpenAI API — AI generation, image creation]
         ├─ [Stripe — subscription billing]
         └─ [Google Cloud Storage — product images]
```

This architecture is **appropriate for an early-stage mobile commerce product**. Vercel provides zero-ops deployment with automatic scaling, and Supabase removes database administration overhead. The choice to run Express (not Next.js API routes) is well-justified: the frontend is a native app and does not need SSR.

### Technology Stack Assessment

| Technology | Version | Assessment |
|------------|---------|------------|
| Expo SDK | 54 | ✅ Recent stable; managed workflow simplifies native builds |
| React Native | 0.81.5 | ✅ Up to date |
| Expo Router | ~6.0 | ✅ File-based routing — good DX and deep-link support |
| React Query / TanStack Query | ^5.83 | ✅ Industry standard for server-state management |
| Express | ^5.0.1 | ✅ Express 5 has better async error handling than v4 |
| Drizzle ORM | ^0.39.3 | ✅ Lightweight, type-safe, good for serverless |
| TypeScript | ~5.9.2 | ✅ |
| pg (node-postgres) | ^8.16.3 | ⚠️ Missing `@types/pg` devDependency causes TypeScript errors in `server/db.ts` |
| Stripe | ^17.0 | ✅ |
| bcryptjs | ^2.4.3 | ✅ Correct use for password hashing |
| OpenAI | ^6.22.0 | ✅ |

### Primary Domain

The platform serves **two distinct user roles** within a single codebase:

1. **Seller dashboard** (`app/(tabs)/`) — Product management, AI-powered listing generation, multi-marketplace publishing (Amazon, Etsy, TikTok Shop, Shopify, WooCommerce, etc.), order tracking, brand profiles, content library, social media scheduling, team management, subscription billing.

2. **Consumer shop** (`app/(shop)/`) — Product catalog, shopping cart, AI style quiz, digital wardrobe management, AI stylist chat.

The dual-role design is a reasonable product decision but introduces **architectural coupling** that should be monitored (see Medium Level § Separation of Concerns).

### Code Organisation

```
app/            Expo Router screens (file-based routing) — well structured
server/         Express API — good separation of concerns within the directory
  routes.ts     ⚠️ Single mega-file (~1 000 lines) — needs decomposition
  storage.ts    Interface + DatabaseStorage class — good pattern
  services/     Domain services (image, Stripe, prompt builder, queue) — good
shared/         Drizzle schema + Zod insert schemas — excellent shared-type approach
lib/            Client utilities (API client, Query config) — minimal, correct
components/     3 components — very sparse; most UI is inline in screens
constants/      colours only — fine at this scale
```

### High Level Strengths

- **Documentation is excellent**: `ARCHITECTURE.md`, `DEPLOYMENT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `.env.example`, and inline code comments all exist and are accurate.
- **Shared schema**: `shared/schema.ts` is used by both client and server, providing compile-time type safety across the boundary.
- **Drizzle ORM** is a strong choice for Vercel serverless — no heavy runtime, no migration files needed for early iteration.
- **Connection pool tuning**: pool size is set to 3 on Vercel (vs 10 locally) — this is a production-aware decision.
- **SSE streaming** for AI content: correctly implements Server-Sent Events for real-time streaming rather than long polling or WebSockets (which are incompatible with Vercel).
- **`patch-package`** used to track Expo asset patch — shows awareness of dependency management.

### High Level Concerns & Recommendations

#### 🔴 Critical — No CI Workflow for This Branch
**Finding:** The repository has a `CI` workflow that runs `npm ci` → lint → typecheck, but it was targeting `main`. The current PR branch (`copilot/audit-repository-high-medium-scope`) does not yet have a passing CI run because the `package-lock.json` was stale.

**Fix applied in this PR:** Running `npm install` has regenerated `package-lock.json` so `npm ci` will succeed.

**Recommendation:** Ensure the CI workflow runs on all pull request branches. In `.github/workflows/ci.yml`, add `on: pull_request`.

---

#### 🟡 Medium — Missing `@types/pg` DevDependency
**Finding:** `server/db.ts` imports `pg` but `@types/pg` is not in `devDependencies`, causing TypeScript error `TS7016: Could not find a declaration file for module 'pg'`.

```typescript
// server/db.ts — causes TS7016
import pg from "pg";
```

**Recommendation (Medium priority):**
```bash
npm install --save-dev @types/pg
```

---

## Medium Level Scope

### Module and Package Structure

The `server/` directory follows a clean layered architecture:

```
routes.ts → storage.ts (IStorage interface) → db.ts (pg Pool + Drizzle)
              ↑
          services/ (image-generation, stripe, prompt-builder, publishing-queue)
```

The `IStorage` interface in `storage.ts` is a textbook **Repository Pattern** — it abstracts database access behind an interface, making future testing and backend swapping straightforward.

### Dependency Graph — Coupling Assessment

| Relationship | Coupling | Assessment |
|---|---|---|
| `routes.ts` → `storage.ts` | Medium | Appropriate — route handlers delegate to storage |
| `routes.ts` → `publishPipeline.ts` | Medium | OK — pipeline is a domain service |
| `publishPipeline.ts` → `objectStorage.ts` | Low | Good |
| `routes.ts` → `services/stripe-service.ts` | Low (only webhook route now) | ✅ After this PR |
| `server/db.ts` → `shared/schema.ts` | Low | Correct — schema is shared |
| `api/index.ts` → `server/index.ts` | Low | Correct — thin adapter |

**Problem area:** `routes.ts` imports and instantiates an OpenAI client at module level **and** `publishPipeline.ts` does the same. This is a violation of the DRY principle and means two separate OpenAI client objects exist simultaneously.

### Separation of Concerns

**Positive:** The storage interface cleanly separates database concerns from routing logic. Services in `server/services/` have clear single-purpose functions.

**Negative — routes.ts as a God File:**

`server/routes.ts` at ~1 000 lines registers all ~55 API routes across 12 domains in a single function. This violates the Single Responsibility Principle and creates merge conflict risk on any backend change.

**Recommended refactor (High priority):**
```
server/routes/
  index.ts          (imports and registers all sub-routers)
  products.ts
  listings.ts
  orders.ts
  ai.ts
  auth.ts
  billing.ts
  shop.ts
  social.ts
  teams.ts
  campaigns.ts
  publishingQueue.ts
```

Each file exports an Express `Router`. The main `registerRoutes` function becomes:
```typescript
import productsRouter from "./routes/products";
// ...
app.use("/api", productsRouter);
```

### Configuration Management

**Positive:** Environment variables are documented in `.env.example` with clear descriptions, required/optional labels, and example values. Secrets are never committed.

**Concerns:**

1. The application throws at startup if `DATABASE_URL` is not set (correct), but **silently allows missing OpenAI, Stripe, and GCS credentials** — callers fail at runtime with opaque errors. Consider a startup validation function.

2. The mobile app has two env-var fallbacks (`EXPO_PUBLIC_API_URL` → `EXPO_PUBLIC_DOMAIN`) but neither is validated at build time, meaning a misconfigured build silently ships and crashes on first API call.

**Recommendation (Medium priority):** Add a startup validator:
```typescript
// server/config.ts
export function validateConfig() {
  const required = ["DATABASE_URL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  // Warn about optional but important vars
  const recommended = ["AI_INTEGRATIONS_OPENAI_API_KEY", "STRIPE_SECRET_KEY"];
  recommended.filter((k) => !process.env[k]).forEach((k) => {
    console.warn(`WARNING: ${k} is not set — related features will be disabled`);
  });
}
```

### Testing Strategy

**Finding:** There are **zero tests** in the repository. No test framework is installed, no test scripts exist in `package.json`, and no test files (`*.test.*`, `*.spec.*`) exist anywhere.

This is the single largest risk for a production codebase. Without tests:
- Refactoring is dangerous
- Regressions go undetected
- CI provides no functional coverage

**Recommendations (High priority):**

1. Install a server-side test framework:
   ```bash
   npm install --save-dev vitest @types/supertest supertest
   ```

2. Start with unit tests for pure functions:
   - `server/services/prompt-builder.ts` — pure functions, trivially testable
   - `server/publishPipeline.ts` `buildProductContext()` — pure function

3. Add integration tests for critical paths:
   - `POST /api/auth/register` / `POST /api/auth/login`
   - `GET /api/products` / `POST /api/products`
   - `POST /api/billing/webhook` (with mock Stripe signature)

### No Rate Limiting on AI Endpoints

**Finding:** `POST /api/ai/generate-product` and `POST /api/ai/generate-marketing` are completely unprotected. Any unauthenticated caller can trigger unlimited OpenAI API calls, incurring unbounded costs.

**Recommendation (High priority):** Apply `express-rate-limit` to all AI generation endpoints:
```typescript
import rateLimit from "express-rate-limit";

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 AI requests per minute per IP
  message: { error: "Too many AI generation requests. Please wait before retrying." },
});

app.post("/api/ai/generate-product", aiRateLimiter, async (req, res) => { ... });
app.post("/api/ai/generate-marketing", aiRateLimiter, async (req, res) => { ... });
```

### Medium Level Strengths

- **Repository pattern** (`IStorage` interface) enables future dependency injection and testing.
- **SSE streaming** is correctly implemented with `flushHeaders()`, `no-cache` headers, and graceful error handling after headers are sent.
- **Publish pipeline** cleanly separates concerns: content generation → image generation → upload → storage — each step is independently catchable.
- **Database indices** on high-cardinality foreign keys (`user_id`, `team_id`, `order_id`, `status`) are defined in the schema — good proactive performance work.

---

## Low Level (Feature Deep-Dive)

### Feature 1: Authentication System (`/api/auth/*`)

**Files:** `server/routes.ts` (lines 677–717), `shared/schema.ts` (users table)

#### What it does

- `POST /api/auth/register` — creates a user with bcrypt-hashed password.
- `POST /api/auth/login` — verifies credentials and returns user info.
- `POST /api/auth/request-reset` — stub that returns a success message without doing anything.

#### Code Review

**Positive:** bcrypt usage is correct (`bcrypt.hash(password, 10)`). No plaintext passwords are stored or compared.

```typescript
// ✅ Correct bcrypt usage
const hashedPassword = await bcrypt.hash(password, 10);
const user = await storage.createUser({ username, password: hashedPassword });
```

**Critical Problem 1 — Login returns user data but issues no session token:**

```typescript
// server/routes.ts line 703
res.json({ id: user.id, username: user.username, subscriptionTier: user.subscriptionTier });
```

The login endpoint returns user data but issues no JWT, session cookie, or other credential. There is no mechanism to verify a caller's identity on subsequent requests — meaning every other endpoint runs without identity verification.

**Critical Problem 2 — All ~55 routes are completely open:**

There is no authentication middleware. Any unauthenticated client can call any endpoint — `POST /api/products`, `DELETE /api/brand-profiles/:id`, `GET /api/orders`, etc.

**Critical Problem 3 — Password reset stub:**

```typescript
app.post("/api/auth/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    // In production, send email with reset link
    res.json({ message: "If an account exists with that email, a reset link has been sent." });
  }
```

The `passwordResetTokens` table exists in the schema but is never written to. Users who lose their password are permanently locked out.

**Recommended fix (Critical priority):**

1. Issue a JWT on login:
```typescript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET must be set");

// On successful login:
const token = jwt.sign(
  { sub: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: "7d" }
);
res.json({ token, id: user.id, username: user.username });
```

2. Add an authentication middleware:
```typescript
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { sub: string };
    (req as any).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

3. Apply `authenticate` middleware to all protected routes.

---

### Feature 2: Stripe Billing & Webhook (`/api/billing/*`)

**Files:** `server/routes.ts` (lines 719–758), `server/services/stripe-service.ts`

#### What it does

- `GET /api/billing/plans` — lists subscription plans from database.
- `GET /api/billing/subscription` — returns user's current subscription.
- `POST /api/billing/checkout` — stub that returns a placeholder message.
- `POST /api/billing/webhook` — receives Stripe webhook events.

#### Code Review

**Critical Problem — Webhook signature verification was missing:**

Before this PR, the webhook handler accepted any POST request without verifying the Stripe signature:

```typescript
// BEFORE (insecure)
app.post("/api/billing/webhook", async (req, res) => {
  try {
    // Stripe webhook handling
    res.json({ received: true });
  }
});
```

An attacker could send fabricated Stripe events (e.g., `customer.subscription.created` with an arbitrary user ID) and the server would process them.

**Fix applied in this PR:** The webhook now calls `constructWebhookEvent()` from `stripe-service.ts`, which verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`. Requests without a valid signature receive a `400` response.

```typescript
// AFTER (secure) — server/routes.ts
const event = await constructWebhookEvent(rawBody, sig);
```

**High Problem — Checkout stub is unimplemented:**

```typescript
app.post("/api/billing/checkout", async (req, res) => {
  try {
    const { userId, planId } = req.body;
    // Stripe checkout session creation would go here
    res.json({ message: "Checkout session created", planId });
  }
```

The Stripe service (`stripe-service.ts`) already has `createCheckoutSession()` implemented, but it is never called from the route. Users cannot actually subscribe.

**Recommendation (High priority):** Wire up the existing service functions:
```typescript
import { createCustomer, createCheckoutSession } from "./services/stripe-service";

app.post("/api/billing/checkout", async (req, res) => {
  const { userId, planId, email, successUrl, cancelUrl } = req.body;
  // Look up plan's Stripe price ID from DB
  const plan = await storage.getSubscriptionPlanById(planId);
  if (!plan?.stripePriceId) {
    return res.status(400).json({ error: "Plan not available for purchase" });
  }
  const customerId = await createCustomer(email);
  const checkoutUrl = await createCheckoutSession(customerId, plan.stripePriceId, successUrl, cancelUrl);
  res.json({ checkoutUrl });
});
```

**Positive:** `stripe-service.ts` is well-structured. The `getStripe()` guard function prevents runtime errors when `STRIPE_SECRET_KEY` is not set. `constructWebhookEvent` correctly uses `webhooks.constructEvent` for signature verification.

---

### Feature 3: AI Content Generation (`/api/ai/*`)

**Files:** `server/routes.ts` (lines 224–372), `server/publishPipeline.ts`, `server/services/prompt-builder.ts`, `server/services/image-generation.ts`

#### What it does

- `POST /api/ai/generate-product` — streams AI-generated product listing content via SSE.
- `POST /api/ai/generate-marketing` — streams platform-specific marketing copy via SSE.
- The publish pipeline (`publishPipeline.ts`) generates full listings with optional product images using OpenAI's image model.

#### Code Review

**Positive:** SSE streaming is implemented correctly:

```typescript
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache, no-transform");
res.setHeader("X-Accel-Buffering", "no");
res.flushHeaders();
// ...
res.write(`data: ${JSON.stringify({ content })}\n\n`);
```

The `X-Accel-Buffering: no` header is required to prevent Nginx/Vercel from buffering SSE chunks — its presence shows operational experience.

**Positive:** Error handling after `headersSent`:
```typescript
if (res.headersSent) {
  res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
  res.end();
} else {
  res.status(500).json({ error: "AI generation failed" });
}
```
This correctly handles the case where the SSE stream has already started when an error occurs.

**Medium Problem — Duplicate OpenAI client instances:**

`routes.ts` and `publishPipeline.ts` each create their own `OpenAI` instance at module level:

```typescript
// server/routes.ts line 9
const openai = new OpenAI({ apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY, ... });

// server/publishPipeline.ts line 6
const openai = new OpenAI({ apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY, ... });
```

**Recommendation (Low priority):** Extract to `server/services/openai-client.ts`:
```typescript
import OpenAI from "openai";
export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});
export const AI_MODEL = process.env.AI_MODEL || "gpt-4o";
```

**Medium Problem — Token counting is an approximation:**

```typescript
tokensUsed: Math.ceil(fullContent.length / 4),
```

Characters-divided-by-4 is a rough approximation of tokens. OpenAI streaming responses include usage data in the final chunk (`stream_options: { include_usage: true }`). Using actual token counts would make `getAiUsageStats()` accurate.

**Medium Problem — No input validation on generate endpoints:**

The `productType`, `brandProfile`, `features` inputs from `req.body` are passed directly into OpenAI prompts. A malicious user could perform prompt injection or send extremely large inputs that cost significant tokens.

**Recommendation (Medium priority):** Validate and sanitize inputs with Zod:
```typescript
import { z } from "zod";

const generateProductSchema = z.object({
  productType: z.string().min(1).max(200),
  features: z.string().max(500).optional(),
  brandProfile: z.object({
    tone: z.string().max(100),
    targetAudience: z.string().max(200),
    keywords: z.array(z.string().max(50)).max(20),
  }).optional(),
});

// In route handler:
const parsed = generateProductSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
```

---

### Feature 4: Shopping Cart (`/api/shop/cart`)

**Files:** `server/routes.ts` (lines 489–533), `server/storage.ts` (`getCartItems`, `addToCart`)

#### What it does

Session-based shopping cart allowing anonymous users to add, update, and remove items.

#### Code Review

**High Problem — Session ID is a client-controlled header with no authentication:**

```typescript
const getSessionId = (req: any): string => {
  return req.headers["x-session-id"] as string || "guest-default";
};
```

Any client can send `x-session-id: any-other-users-session-id` and access or modify another user's cart. All users who do not send this header share a single `"guest-default"` session.

This is the correct pattern for anonymous carts, but the fallback to `"guest-default"` means multiple users share one cart silently.

**Recommendation (High priority):** Generate and persist session IDs server-side, or require a UUID from the client with a server-side lookup. At minimum, change the fallback:

```typescript
const getSessionId = (req: any): string => {
  const sid = req.headers["x-session-id"] as string;
  if (!sid || sid === "guest-default") {
    // Return a per-request anonymous ID — not persisted
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return sid;
};
```

**Performance fix applied in this PR — N+1 query in `getCartItems`:**

The original implementation issued one SQL query per cart item to fetch the associated product:

```typescript
// BEFORE (N+1)
for (const item of items) {
  const [product] = await db.select().from(products).where(eq(products.id, item.productId));
  result.push({ ...item, product });
}
```

This has been replaced with a single `WHERE id IN (...)` query:

```typescript
// AFTER (fixed)
const productIds = [...new Set(items.map((i) => i.productId))];
const productRows = await db.select().from(products).where(inArray(products.id, productIds));
const productMap = new Map(productRows.map((p) => [p.id, p]));
```

---

### Feature 5: Publishing Queue & Pipeline

**Files:** `server/services/publishing-queue.ts`, `server/publishPipeline.ts`, `server/routes.ts` (lines 374–486)

#### What it does

The publishing pipeline:
1. Calls OpenAI to generate marketplace-specific listing content.
2. Optionally generates product images via OpenAI's image model.
3. Uploads images to Google Cloud Storage.
4. Updates the `marketplace_listings` record in the database.

#### Code Review

**Positive:** The publish pipeline correctly handles partial failures — image generation failures are caught per-image so a single failed image does not abort the entire pipeline:

```typescript
for (let i = 0; i < imageCount; i++) {
  try {
    const imageBuffer = await generateProductImage(product, marketplace, i);
    // ... upload
  } catch (error) {
    console.error(`Failed to generate image ${i + 1}:`, error);
  }
}
```

**Medium Problem — Listing status left as "generating" on pipeline error:**

```typescript
await storage.updateListing(listingId, { status: "generating" });

const result = await runPublishPipeline(...); // may throw

// If runPublishPipeline throws, status remains "generating" forever
```

The catch block in `routes.ts` attempts a status reset:
```typescript
await storage.updateListing(listingId, { status: "draft" }).catch(() => {});
```

However the `.catch(() => {})` silently swallows this recovery failure. If the database is unavailable, the listing is permanently stuck in `"generating"` state.

**Recommendation (Medium priority):** Use a `finally` block for status cleanup and log any secondary failure:

```typescript
try {
  await storage.updateListing(listingId, { status: "generating" });
  const result = await runPublishPipeline(...);
  // ... update to "ready"
  res.json(updatedListing);
} catch (error) {
  console.error("Publish pipeline error:", error);
  res.status(500).json({ error: "Failed to generate listing content" });
} finally {
  // Ensure status is never left as "generating"
  const current = await storage.getListing(listingId).catch(() => null);
  if (current?.status === "generating") {
    await storage.updateListing(listingId, { status: "draft" }).catch((e) => {
      console.error("Failed to reset listing status after error:", e);
    });
  }
}
```

**Medium Problem — GCS image upload silently suppresses `makePublic` failures:**

```typescript
try {
  await file.makePublic();
} catch (e) {
  // swallowed
}
```

If `makePublic` fails (e.g., uniform bucket-level access is enabled on GCS), images will be uploaded but inaccessible to users. The failure should at minimum be logged.

**Recommendation:** Replace with:
```typescript
await file.makePublic().catch((e) => {
  console.error("Failed to make GCS object public:", e);
});
```

**Low Problem — `services/publishing-queue.ts` duplicates storage logic:**

`server/services/publishing-queue.ts` directly queries the `publishingQueue` table via `db`, bypassing the `IStorage` interface. This means queue operations exist in two places (`storage.ts` and `services/publishing-queue.ts`), with potential inconsistency.

**Recommendation (Low priority):** Route all data access through the `IStorage` interface. Remove the standalone functions in `services/publishing-queue.ts` or delegate them to `storage.ts`.

---

## Security Summary

| Vulnerability | Severity | Status |
|---|---|---|
| No authentication on any API endpoint | Critical | Open — JWT auth implementation recommended above |
| Cart/wardrobe isolation relies on client-provided session ID | High | Open — server-side session recommended |
| Stripe webhook accepted without signature verification | Critical | **Fixed in this PR** |
| Stripe checkout session creation is unimplemented (stub) | High | Open — implementation referenced above |
| No rate limiting on AI generation endpoints | High | Open — `express-rate-limit` recommended above |
| AI prompt inputs not validated (prompt injection risk) | Medium | Open — Zod validation recommended above |
| Social platform OAuth tokens stored in plaintext in `social_platforms` table | Medium | Open — tokens should be encrypted at rest |
| GCS `makePublic` failure is silently swallowed | Low | Open — logging fix recommended above |
| Password reset endpoint is a stub (permanently locked-out users) | High | Open — implementation required |

No new security vulnerabilities were introduced by this PR. Two existing vulnerabilities were fixed (Stripe webhook, CI/build failure which could allow bypassing lint checks).

---

## Prioritised Action Plan

### Critical (Do before first real users)
1. **Implement JWT authentication** and protect all non-public API routes.
2. **Implement password reset** using `password_reset_tokens` table + email (Resend SDK is already installed).
3. **Implement Stripe checkout** by wiring `createCheckoutSession()` into the `/api/billing/checkout` route.

### High (Do within first sprint after launch)
4. **Add rate limiting** to AI generation endpoints (`express-rate-limit`).
5. **Fix session isolation** for anonymous cart/wardrobe access.
6. **Add test infrastructure** (Vitest + Supertest).
7. **Install `@types/pg`** devDependency to fix TypeScript errors.

### Medium (Ongoing technical debt)
8. **Decompose `routes.ts`** into per-domain router files under `server/routes/`.
9. **Add input validation** (Zod schemas) on all mutation endpoints.
10. **Fix listing status cleanup** in publish pipeline with `finally` block.
11. **Add startup config validation** to warn on missing optional env vars.
12. **Log (don't suppress) GCS `makePublic` failures.**
13. **Extract shared OpenAI client** into `server/services/openai-client.ts`.
14. **Use real token counts** from OpenAI streaming response for `ai_generations` logging.

### Low (Nice-to-have)
15. Replace `any` types in `storage.ts` interface methods with proper typed insert schemas.
16. Consolidate duplicate imports in `app/_layout.tsx` and `app/(tabs)/_layout.tsx`.
17. Remove unused variable declarations flagged by ESLint warnings.
18. Consider encrypting OAuth tokens at rest in the `social_platforms` table.
