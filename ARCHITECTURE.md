# FlashFusion v3.0.0 Architecture

## System Overview

FlashFusion is a full-stack print-on-demand (POD) and e-commerce platform with AI-powered product generation, social media management, team collaboration, and billing features.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 7, TypeScript 5.6 |
| UI | Shadcn/UI, Tailwind CSS 3, Radix UI primitives |
| Routing | Wouter (client-side) |
| State | TanStack Query v5 (server state), React useState (local state) |
| Backend | Express 5 (ESM), TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| Auth | Session-based (express-session) + Replit OAuth + local auth (bcrypt) |
| Payments | Stripe (subscriptions, checkout, webhooks) |
| AI | OpenAI SDK (GPT-4o, DALL-E 3) |
| Testing | Vitest (unit), Playwright (E2E) |
| Build | Vite (client), esbuild (server) |

## Directory Structure

```
├── client/src/
│   ├── App.tsx              # Router, layout, lazy imports
│   ├── components/
│   │   ├── ui/              # Shadcn/UI primitives
│   │   ├── app-sidebar.tsx  # Navigation sidebar
│   │   ├── cart-drawer.tsx   # Shopping cart drawer
│   │   ├── error-boundary.tsx
│   │   └── text-overlay-editor.tsx
│   ├── hooks/               # Custom hooks (auth, offline, toast, AI stream)
│   ├── lib/                 # Query client, theme, PWA utils
│   └── pages/               # ~20 lazy-loaded page components
├── server/
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # Route orchestrator (mounts all routers)
│   ├── db.ts                # PostgreSQL pool + Drizzle instance
│   ├── storage.ts           # Data access layer
│   ├── middleware/
│   │   ├── auth.ts          # requireAuth, requireRole, requireTeamRole
│   │   ├── validate.ts      # Zod body validation
│   │   └── plan-limits.ts   # Subscription limit enforcement
│   ├── routes/              # Express Router modules
│   │   ├── auth-routes.ts
│   │   ├── product-routes.ts
│   │   ├── category-routes.ts
│   │   ├── cart-routes.ts
│   │   ├── order-routes.ts
│   │   ├── seed-routes.ts
│   │   └── billing-routes.ts
│   ├── services/            # Business logic services
│   │   ├── analytics-service.ts
│   │   ├── scheduling-service.ts
│   │   ├── stripe-service.ts
│   │   ├── usage-tracking-service.ts
│   │   ├── ai-cache.ts
│   │   ├── ai-cost-tracker.ts
│   │   └── prompt-builder.ts
│   ├── integrations/
│   │   ├── ecom-templates.ts  # 6 e-commerce platform templates
│   │   ├── routes.ts
│   │   └── ai-tools-routes.ts
│   ├── merch-routes.ts      # Merch Studio endpoints
│   ├── social-routes.ts     # Social media + analytics endpoints
│   └── team-routes.ts       # Team/workspace endpoints
├── shared/
│   └── schema.ts            # Drizzle schema (16 tables), Zod validation, types
├── tests/
│   ├── unit/                # Vitest unit tests
│   └── e2e/                 # Playwright E2E tests
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

## Key Patterns

### Route Registration
All routers are Express Router instances mounted in `server/routes.ts`:
```typescript
app.use("/api/products", productRouter);
app.use("/api/social", socialRouter);
```

### Authentication Flow
1. Session created via `express-session` with PostgreSQL store
2. Replit OAuth provides SSO (`setupAuth()`)
3. Local auth via bcrypt password hashing
4. `requireAuth` middleware extracts `req.userId` from session
5. `requireRole` / `requireTeamRole` for authorization

### Data Flow
```
Client (React) → TanStack Query → fetch() → Express Router → Middleware → Handler → Drizzle ORM → PostgreSQL
```

### Schema Pattern
```typescript
export const tableName = pgTable("table_name", { ... }, (table) => [index(...)]);
export const insertTableNameSchema = createInsertSchema(tableName);
export type TableName = typeof tableName.$inferSelect;
export type InsertTableName = typeof tableName.$inferInsert;
```

### Frontend Page Pattern
- Pages are lazy-loaded in `App.tsx`
- Protected by `ProtectedRoute` (redirects to `/auth`)
- Wrapped in `DashboardLayout` (sidebar + header)
- Use TanStack Query for data fetching

## Database Schema (16 Tables)

| Table | Purpose |
|-------|---------|
| sessions | Express session storage |
| users | User accounts |
| products | Product catalog |
| categories | Product categories |
| cartItems | Shopping cart |
| orders / orderItems | Order management |
| merchProducts | 31 POD product types |
| merchSessions | AI mockup generation sessions |
| socialPlatforms | Connected social accounts |
| socialContent | Social media posts |
| socialAnalytics | Engagement/follower snapshots |
| teamWorkspaces | Team workspaces |
| teamMembers | Workspace membership + roles |
| teamInvites | Pending invitations |
| subscriptions | Active Stripe subscriptions |
| subscriptionPlans | Plan definitions |
| aiGenerations | AI generation history |
| platformConnectors | Integration registry |
| platformConnections | User API connections |
