# Architecture

## System Overview

```
┌─────────────────────────────┐
│   Mobile App (Expo/RN)      │
│   - Expo Router (screens)   │
│   - React Query (data)      │
│   - expo/fetch (HTTP)       │
└──────────┬──────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────┐
│   Vercel (Serverless)       │
│   - Express 5 API           │
│   - api/index.ts entrypoint │
│   - 30s max duration        │
└──────────┬──────────────────┘
           │ PostgreSQL (pooled)
           ▼
┌─────────────────────────────┐
│   Supabase                  │
│   - PostgreSQL database     │
│   - Connection pooler       │
│   - 24 tables (Drizzle ORM) │
└─────────────────────────────┘
```

## Key Design Decisions

### Why Expo + React Native?
- Single codebase for iOS and Android
- Managed workflow (EAS handles signing, builds, submissions)
- OTA updates via EAS Update (push JS changes without store review)
- File-based routing with Expo Router

### Why Express on Vercel (not Next.js)?
- The backend was built as a standalone Express API
- Vercel's `@vercel/node` runtime runs Express as a serverless function
- All requests route through `api/index.ts` → Express app
- No SSR needed — the frontend is a native mobile app

### Why Supabase (not raw PostgreSQL)?
- Managed PostgreSQL with automatic backups
- Built-in connection pooler (critical for serverless — prevents connection exhaustion)
- Dashboard for inspecting data during development
- Free tier sufficient for early-stage apps

### Why Drizzle ORM?
- Type-safe schema definition in TypeScript (`shared/schema.ts`)
- Schema push (`drizzle-kit push`) for rapid iteration without migration files
- Shared types between client and server via `shared/` directory
- Lightweight — no heavy runtime like Prisma

## Data Flow

### API Request Lifecycle
```
1. Mobile app calls apiRequest("GET", "/api/products")
2. lib/query-client.ts prepends EXPO_PUBLIC_API_URL
3. HTTPS request hits Vercel
4. vercel.json rewrites all paths to /api → api/index.ts
5. api/index.ts calls initApp() (once per cold start), then passes to Express
6. Express middleware: CORS → body parsing → request logging
7. Route handler in server/routes.ts calls storage method
8. server/storage.ts executes Drizzle query via server/db.ts
9. db.ts uses pg Pool connected to Supabase pooler
10. Response flows back through Express → Vercel → mobile app
```

### AI Content Generation
```
1. User triggers "Generate Listing" from mobile app
2. POST /api/ai/generate-listing with product data
3. Route handler streams response via SSE (text/event-stream)
4. OpenAI API called with product context + brand voice
5. Tokens streamed back to client as Server-Sent Events
6. Client displays content progressively
```

### Publishing Pipeline
```
1. User selects product + marketplace + listing style
2. POST /api/publish triggers runPublishPipeline()
3. Pipeline generates: title, description, tags, SEO content
4. Optionally generates product images via OpenAI (gpt-image-1)
5. Images uploaded to Google Cloud Storage
6. Listing saved to marketplace_listings table
7. Added to publishing_queue for scheduled posting
```

## Database Schema

24 tables organized by domain:

| Domain | Tables |
|--------|--------|
| **Auth** | `users`, `password_reset_tokens` |
| **Products** | `products`, `categories`, `product_concepts` |
| **Marketplace** | `marketplace_listings`, `publishing_queue` |
| **Orders** | `orders`, `order_items`, `cart_items` |
| **Branding** | `brand_profiles`, `brand_voice_profiles`, `content_library` |
| **AI** | `ai_generations` |
| **Social** | `social_platforms`, `social_content`, `social_analytics` |
| **Consumer** | `style_profiles`, `wardrobe_items` |
| **Billing** | `subscription_plans`, `subscriptions` |
| **Teams** | `teams`, `team_members` |
| **Marketing** | `marketing_campaigns` |

## Directory Structure

```
app/                    Expo Router — file-based routing
├── (tabs)/             Main seller tab navigation
│   ├── index.tsx       Dashboard
│   ├── products.tsx    Product management
│   ├── marketplace.tsx Marketplace listings
│   ├── orders.tsx      Order tracking
│   └── ai-studio.tsx   AI content tools
├── (shop)/             Consumer-facing shop
│   ├── index.tsx       Shop home
│   ├── catalog.tsx     Product browsing
│   ├── cart.tsx        Shopping cart
│   └── stylist.tsx     AI stylist
└── product/            Product detail screens

server/                 Express API
├── index.ts            App setup, CORS, middleware, exports
├── routes.ts           All API endpoints (~50 routes)
├── storage.ts          Database access layer
├── db.ts               PostgreSQL pool + Drizzle instance
├── publishPipeline.ts  AI listing generation pipeline
├── objectStorage.ts    Google Cloud Storage client
└── services/
    ├── image-generation.ts  OpenAI image generation
    ├── stripe-service.ts    Stripe billing
    ├── prompt-builder.ts    AI prompt construction
    └── publishing-queue.ts  Queue management

shared/
└── schema.ts           Drizzle ORM table definitions + TypeScript types

api/
└── index.ts            Vercel serverless entry point
```

## Serverless Considerations

- **Cold starts**: `initApp()` runs once per cold start, registers all routes
- **Connection pooling**: pg Pool limited to 3 connections on Vercel (vs 10 locally)
- **Timeouts**: 30s max per request (`vercel.json`). AI streaming endpoints may need more.
- **No filesystem**: Landing page / Expo manifest serving is disabled on Vercel
- **No WebSockets**: SSE (Server-Sent Events) is used instead for streaming
