# AffordableStoreStuff

## Overview

AffordableStoreStuff is an AI-powered e-commerce management platform built as a mobile-first Expo React Native application with an Express backend. It allows store owners to manage products, marketplace listings, orders, and AI-generated content (product descriptions, marketing copy) from a single mobile interface.

The app follows a client-server architecture: the Expo frontend communicates with an Express API server, which handles business logic, AI generation (via OpenAI), and PostgreSQL data persistence through Drizzle ORM.

Key capabilities:
- **Product Management**: CRUD operations for products with SKU, inventory, pricing, categories, and tags
- **Multi-Marketplace Listings**: Publish products to Amazon, Etsy, TikTok Shop, WooCommerce, and custom websites
- **AI Publish Pipeline**: Full automated publish flow that generates platform-specific titles, descriptions, bullet points, tags, SEO metadata, search terms, platform-specific fields, and AI product images for each marketplace
- **Order Management**: Track orders across marketplaces with status workflow (pending → processing → shipped → fulfilled)
- **AI Studio**: Generate product descriptions and marketing copy using OpenAI with streaming SSE responses
- **Brand Profiles**: Save brand voice/tone settings for consistent AI-generated content
- **Content Library**: Save and organize AI-generated content with favorites
- **Subscription Tiers**: Free/Pro/Enterprise plan structure with AI credit limits

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Navigation**: Tab-based layout with 5 main tabs (Dashboard, Products, AI Studio, Marketplace, Orders) plus stack screens for detail/create views and settings
- **State Management**: TanStack React Query for server state; no separate client state library
- **Fonts**: Inter font family (400, 500, 600, 700 weights) loaded via `@expo-google-fonts/inter`
- **Styling**: React Native StyleSheet (no utility CSS framework); color constants defined in `constants/colors.ts`
- **Platform Support**: iOS, Android, and Web. Platform-specific adjustments exist throughout (e.g., web top inset, keyboard handling)
- **API Communication**: Custom `apiRequest` helper in `lib/query-client.ts` that constructs URLs from `EXPO_PUBLIC_DOMAIN` environment variable. Uses `expo/fetch` for requests.
- **Key UI Libraries**: react-native-gesture-handler, react-native-keyboard-controller, expo-blur, expo-image, expo-haptics

### Backend (Express)

- **Runtime**: Node.js with Express 5, written in TypeScript (compiled with tsx for dev, esbuild for production)
- **API Pattern**: RESTful JSON API at `/api/*` routes, registered in `server/routes.ts`
- **AI Integration**: OpenAI SDK configured via Replit AI Integrations environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`). Supports streaming SSE responses for AI generation endpoints.
- **Storage Layer**: `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class using Drizzle ORM. This abstraction layer makes it possible to swap storage implementations.
- **CORS**: Dynamic CORS configuration supporting Replit dev/deployment domains and localhost for Expo web development
- **Static Serving**: In production, serves pre-built Expo web assets. In development, proxies to Expo Metro bundler.
- **Object Storage**: Google Cloud Storage integration (`server/objectStorage.ts`) for file uploads with signed URLs and ACL policies

### Database (PostgreSQL + Drizzle ORM)

- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server for type safety)
- **Tables**:
  - `users` - Authentication with subscription tier tracking and AI credit limits
  - `products` - Product catalog with JSONB fields for tags and images
  - `marketplace_listings` - Per-marketplace listing records linked to products
  - `orders` - Order tracking with marketplace source and customer info
  - `brand_profiles` - Brand voice settings (tone, keywords, target audience)
  - `content_library` - Saved AI-generated content with favorites
  - `ai_generations` - AI usage logging for credit tracking
  - `conversations` / `messages` - Chat/conversation storage (defined in `shared/models/chat.ts`)
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)
- **Connection**: `pg` Pool with `DATABASE_URL` environment variable

### Replit Integration Modules

Located in `server/replit_integrations/`, these are pre-built modules:
- **chat/**: Conversation CRUD with message history storage
- **audio/**: Voice recording, speech-to-text, text-to-speech, and voice chat via OpenAI
- **image/**: Image generation using `gpt-image-1` model
- **batch/**: Rate-limited batch processing with retry logic (p-limit, p-retry)

Client-side audio utilities exist in `.replit_integration_files/client/` with React hooks for voice recording and streaming playback.

### Build & Deployment

- **Dev Mode**: Two processes run simultaneously — Expo Metro bundler (`expo:dev`) and Express server (`server:dev`)
- **Production Build**: `expo:static:build` creates static web assets, `server:build` bundles Express with esbuild, `server:prod` serves everything
- **Build Script**: Custom `scripts/build.js` handles Expo static web export with Metro bundler

### Path Aliases

- `@/*` → project root
- `@shared/*` → `./shared/*`

## External Dependencies

### Required Services
- **PostgreSQL Database**: Connected via `DATABASE_URL` environment variable. Used by Drizzle ORM for all data persistence.
- **OpenAI API** (via Replit AI Integrations): Connected via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`. Powers product description generation, marketing copy, image generation, voice/audio features.

### Optional Services
- **Google Cloud Storage**: Used for object/file storage (product images, uploads). Configured via `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` environment variables. Requires Google Auth credentials.

### Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (required for AI features)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL (required for AI features)
- `EXPO_PUBLIC_DOMAIN` — Domain for API communication from client
- `REPLIT_DEV_DOMAIN` — Replit development domain (set automatically)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` — GCS bucket (optional)

### Key NPM Packages
- `expo` ~54.0.27, `react-native` 0.81.5, `react` 19.1.0
- `drizzle-orm` ^0.39.3 with `pg` ^8.16.3
- `openai` ^6.22.0
- `@tanstack/react-query` ^5.83.0
- `express` ^5.0.1
- `@google-cloud/storage` ^7.19.0
- `p-limit` ^7.3.0 and `p-retry` ^7.1.1 for batch processing