# FlashFusion v2.2 - AI-Powered Ecommerce Hub

## Overview
FlashFusion is a modern, premium ecommerce platform with AI-powered features built with React, Express, and PostgreSQL. It features a stunning dark-themed UI with glass-morphism effects, gradient accents, and smooth animations. Version 2.2 introduces a mobile-first futuristic design language with iOS-inspired UI patterns.

## Recent Changes (January 2026)
- **Database Migration**: Migrated from Base44 SDK to Replit's built-in PostgreSQL database using Drizzle ORM
- **Complete UI Rebuild**: Premium dark theme with glass-morphism effects and gradient accents
- **Full Ecommerce Suite**: Products, cart, checkout, and order management
- **AI Content Generator**: Mock AI content generation for product descriptions, emails, and social posts
- **Session Fix**: Implemented cookie-based session handling for persistent anonymous carts (cartSessionId cookie)
- **AI Tools Suite**: AI Product Creator, AI Marketing Engine, AI Brand Voice Settings pages with full CRUD
- **Real-time Streaming**: SSE-based streaming generation with progress indicators and live content preview
- **AI Service Layer**: Multi-provider AI service (OpenAI, Anthropic, Gemini, ElevenLabs, Grok, Perplexity)
- **Observability Module**: Structured logging, metrics collection, error tracking, circuit breakers, retry logic
- **Health & Metrics Endpoints**: /api/ai/health and /api/ai/metrics for monitoring
- **Progressive Web App (PWA)**:
  - Full PWA implementation with manifest, service worker, and offline support
  - Service worker with cache-first strategy for assets and network-first for API calls
  - Lazy loading for all routes using React.lazy() with Suspense fallbacks
  - IndexedDB storage for offline persistence (drafts, uploads, downloads)
  - Connection status monitoring and graceful offline UI
- **E2E Test Suite**: Playwright tests for PWA features and core functionality
- **PWA & Offline Strategy**:
  - Manifest: `client/public/manifest.json` defines installability and theme
  - Service Worker: `client/public/sw.js` handles caching (Cache-First/Network-First)
  - Persistence: `client/src/lib/indexed-db.ts` stores offline state
  - Sync: Background sync for pending actions via `use-offline` hook
  - UI: `OfflineIndicator` and `ConnectionStatus` provide real-time feedback
- **Page Performance**: All routes are lazily loaded with a high-priority global loader to prevent layout shifts and flashes during hydrate/load.

## Project Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI, Recharts, Wouter (routing)
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query v5)
- **Forms**: React Hook Form with Zod validation
- **PWA**: Service Worker, Web App Manifest, IndexedDB
- **Testing**: Playwright for E2E tests

### Project Structure
```
├── client/src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Shadcn UI components
│   │   ├── app-sidebar.tsx
│   │   ├── cart-drawer.tsx
│   │   ├── product-card.tsx
│   │   ├── stats-card.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/           # Route pages
│   │   ├── landing.tsx  # Public landing page
│   │   ├── onboarding.tsx # Mobile-first onboarding screen
│   │   ├── store-pulse.tsx # Real-time store dashboard
│   │   ├── ai-influencer-studio.tsx # AI avatar creator
│   │   ├── product-pulse-heatmap.tsx # 3D product treemap with revenue/growth
│   │   ├── fusion-core.tsx # Mobile core with KPI carousel and live feed
│   │   ├── brand-calibration.tsx # Neural calibration and brand archetype sync
│   │   ├── ai-insights.tsx # Cross-platform radar analytics with AI recommendations
│   │   ├── dashboard.tsx
│   │   ├── products.tsx
│   │   ├── orders.tsx
│   │   ├── checkout.tsx
│   │   ├── analytics.tsx
│   │   ├── generator.tsx
│   │   └── auth.tsx
│   ├── lib/            # Utilities
│   │   ├── queryClient.ts
│   │   └── theme-provider.tsx
│   └── App.tsx         # Main app with routing
├── server/
│   ├── db.ts           # Database connection
│   ├── storage.ts      # DatabaseStorage class with all CRUD operations
│   ├── routes.ts       # API endpoints
│   └── index.ts        # Express server setup
├── shared/
│   └── schema.ts       # Drizzle schema & types
└── design_guidelines.md # Frontend design system
```

### Database Schema
- **users**: User accounts with authentication
- **categories**: Product categories with hierarchy support
- **products**: Products with images, pricing, stock, and tags
- **cart_items**: Shopping cart items (supports anonymous sessions)
- **orders**: Order records with shipping/billing addresses
- **order_items**: Individual items in each order

### API Endpoints
```
Auth:
POST /api/auth/register - Create new user account
POST /api/auth/login    - Authenticate user

Products:
GET    /api/products    - List all products
GET    /api/products/:id - Get single product
POST   /api/products    - Create product
PATCH  /api/products/:id - Update product
DELETE /api/products/:id - Delete product

Categories:
GET  /api/categories    - List all categories
POST /api/categories    - Create category

Cart:
GET    /api/cart        - Get cart items
POST   /api/cart        - Add to cart
PATCH  /api/cart/:id    - Update quantity
DELETE /api/cart/:id    - Remove item
DELETE /api/cart        - Clear cart

Orders:
GET  /api/orders        - List all orders
GET  /api/orders/:id    - Get order with items
POST /api/orders        - Create order from cart

AI Tools (all under /api/ai):
GET/POST/PATCH/DELETE /api/ai/brand-voices         - Brand voice profiles
GET/POST/PATCH/DELETE /api/ai/product-concepts     - Product concepts
POST                  /api/ai/product-concepts/generate - Generate concept
GET/POST/PATCH/DELETE /api/ai/campaigns            - Marketing campaigns
POST                  /api/ai/campaigns/:id/generate-assets - Generate assets
GET/POST              /api/ai/stream/generate      - SSE streaming generation
GET/POST              /api/ai/content-library      - AI content library
GET                   /api/ai/health               - Health check with provider status
GET                   /api/ai/metrics              - Metrics and error tracking

Seed:
POST /api/seed          - Seed demo data
```

## Design System (v2.2 - January 2026)

### Design Tokens (from Mockups)
- **Primary Purple**: `#4725f4` (Brand purple)
- **Accent Pink**: `#ec4899` / `#ff2daf` (Hot pink accents)
- **Background Dark**: `#0d0b14` (Deep navy/purple base)
- **Space Black**: `#0c0810` (iOS-style deep sections)
- **Card Dark**: `#131022` (Elevated surfaces)
- **Success Green**: `#0bda76` (Live indicators, positive stats)

### Glow & Shadow Effects
- **Glow Pulse**: `0 0 15px rgba(71, 37, 244, 0.4), 0 0 30px rgba(71, 37, 244, 0.2)`
- **Neon Pink Glow**: `0 0 20px rgba(255, 45, 175, 0.5)`
- **Pulse Ring**: Animated concentric rings for "Operational" status

### Glassmorphism
- **Glass Panel**: `rgba(19, 16, 34, 0.7)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(71, 37, 244, 0.2)`
- **Glass Card**: `rgba(157, 37, 244, 0.05)` + subtle purple border

### Typography
- **Sans**: Inter
- **Display**: Space Grotesk (headings, stats)
- **Mono**: JetBrains Mono

### Key Design Classes
- `.glass` / `.glass-card` - Glass-morphism effects
- `.gradient-text` - Purple to pink gradient text
- `.btn-gradient` - Gradient button with glow
- `.card-glow` - Glow effect on card hover
- `.neon-border-purple` / `.neon-border-pink` - Themed glow borders
- `.pulse-ring` - Animated focus rings
- `.bg-mesh` - Radial gradient mesh background

## User Preferences
- Premium dark theme preferred
- Glass-morphism and gradient effects
- Mobile-responsive design
- Fast, intuitive UX

## Development Commands
```bash
npm run dev      # Start development server
npm run db:push  # Push schema changes to database
```
