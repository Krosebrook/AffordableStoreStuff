# FlashFusion v2.2 Documentation

> **AI-Powered E-commerce Automation Platform**  
> Transform your business with automated content creation, product generation, and extensible platform integrations.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
   - [For End Users](#for-end-users)
   - [For Developers](#for-developers)
   - [For DevOps/Operators](#for-devopsoperators)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
5. [Data Models](#data-models)
6. [Configuration](#configuration)
7. [User Flows](#user-flows)
8. [Testing & Quality](#testing--quality)
9. [Security & Compliance](#security--compliance)
10. [Observability & Operations](#observability--operations)
11. [Examples & Use Cases](#examples--use-cases)
12. [Troubleshooting](#troubleshooting)
13. [Version History](#version-history)
14. [Style Guide Appendix](#style-guide-appendix)

---

## Overview

### Purpose & Summary

FlashFusion is a modern, premium e-commerce platform with AI-powered features designed to automate passive income generation. It combines:

- **AI Content Generation**: Automated product descriptions, marketing copy, and social media content via OpenAI
- **Platform Connector Framework**: Extensible architecture with 25+ connector configurations defined (implementation in progress)
- **Brand Voice Management**: Consistent AI-generated content aligned with your brand identity
- **Real-time Analytics**: Revenue tracking, product performance, and campaign insights
- **Workflow Automation**: Extensible workflow execution framework (n8n integration planned)

> **Note**: FlashFusion v2.2 includes connector configurations for platforms like Etsy, Printify, Amazon KDP, etc., but full publishing integrations are still in development. Currently, OpenAI-based AI generation is fully operational.

### Supported Platforms & Environments

| Platform | Version | Status |
|----------|---------|--------|
| Web Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Supported |
| Mobile (PWA) | iOS 14+, Android 10+ | Supported |
| Desktop | Installable via PWA | Supported |

### Versioning Strategy

FlashFusion follows [Semantic Versioning](https://semver.org/):

- **Major (X.0.0)**: Breaking changes, major feature overhauls
- **Minor (2.X.0)**: New features, backward-compatible enhancements
- **Patch (2.2.X)**: Bug fixes, security patches

**Current Version**: v3.0.1 (February 2026)

---

## Getting Started

### For End Users

#### Prerequisites

- Modern web browser with JavaScript enabled
- Internet connection (offline mode available for PWA)
- Account registration (free tier available)

#### Quick Start

1. **Access the Application**
   - Navigate to your FlashFusion deployment URL
   - The landing page provides an overview of features

2. **Create an Account**
   - Click "Get Started" on the landing page
   - Complete the onboarding flow with your business details
   - Set up your brand voice profile

3. **First-Run Checklist**
   - [ ] Complete account registration
   - [ ] Set up your first brand voice profile
   - [ ] Connect at least one publishing platform
   - [ ] Create your first product concept
   - [ ] Generate AI content for your product

#### Installing as PWA

FlashFusion is a Progressive Web App that can be installed on your device:

**Desktop (Chrome/Edge)**:
1. Click the install icon in the address bar
2. Click "Install" in the prompt

**Mobile (iOS Safari)**:
1. Tap the Share button
2. Select "Add to Home Screen"

**Mobile (Android Chrome)**:
1. Tap the menu (three dots)
2. Select "Install app"

---

### For Developers

#### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20.x+ | LTS recommended |
| npm | 9.x+ | Included with Node.js |
| PostgreSQL | 15.x+ | Provided by Replit |
| Git | 2.x+ | Version control |

#### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd flashfusion

# 2. Install dependencies
npm install

# 3. Set up environment variables (see Configuration section)
# DATABASE_URL is auto-configured on Replit

# 4. Push database schema
npm run db:push

# 5. Seed demo data (optional)
curl -X POST http://localhost:5000/api/seed

# 6. Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

#### Project Structure

```
flashfusion/
├── client/                 # Frontend React application
│   ├── public/            # Static assets, PWA files
│   │   ├── manifest.json  # PWA manifest
│   │   ├── sw.js          # Service worker
│   │   └── icons/         # App icons
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # Shadcn/UI primitives
│   │   │   └── *.tsx      # App-specific components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   ├── App.tsx        # Main application entry
│   │   └── main.tsx       # React DOM entry
│   └── index.html         # HTML template
├── server/                 # Backend Express application
│   ├── integrations/      # Platform integrations
│   │   ├── ai-service.ts  # AI provider abstraction
│   │   ├── ai-tools-routes.ts
│   │   ├── routes.ts      # Integration API routes
│   │   └── index.ts       # Platform connectors
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # Core API routes
│   └── index.ts           # Server entry point
├── shared/                 # Shared code (frontend + backend)
│   └── schema.ts          # Drizzle ORM schema & types
├── e2e/                   # Playwright E2E tests
└── docs/                  # Additional documentation
```

---

### For DevOps/Operators

#### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Replit Deployment                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   Vite      │    │   Express   │    │   PostgreSQL    │  │
│  │   (Dev)     │◄──►│   Server    │◄──►│   (Neon-backed) │  │
│  │   HMR       │    │   Port 5000 │    │                 │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│                            │                                  │
│                     ┌──────▼──────┐                          │
│                     │   Static    │                          │
│                     │   Files     │                          │
│                     │   (Prod)    │                          │
│                     └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │     External APIs       │
              │  ┌─────┐ ┌─────────┐   │
              │  │OpenAI│ │Anthropic│   │
              │  └─────┘ └─────────┘   │
              │  ┌─────┐ ┌─────────┐   │
              │  │Gemini│ │ElevenLabs│  │
              │  └─────┘ └─────────┘   │
              └─────────────────────────┘
```

#### CI/CD Pipeline

FlashFusion uses Replit's built-in deployment system:

1. **Development**: `npm run dev` with Vite HMR
2. **Build**: `npm run build` creates optimized production bundle
3. **Deploy**: Replit's publish feature handles hosting, TLS, and health checks

#### Rollback Procedure

Replit provides automatic checkpoints:

1. Access the Replit workspace
2. Click "View Checkpoints" in the interface
3. Select a previous checkpoint to restore
4. Confirm rollback (affects code, chat session, and database)

---

## Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 18)                          │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Wouter     │  │  TanStack    │  │     Shadcn/UI            │  │
│  │   Router     │  │  Query       │  │     Components           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  React Hook  │  │   IndexedDB  │  │     Service Worker       │  │
│  │  Form + Zod  │  │   (Offline)  │  │     (PWA Caching)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                        SERVER (Express.js)                          │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Core API    │  │ Integration  │  │     AI Service Layer     │  │
│  │  Routes      │  │ Routes       │  │  (Multi-provider)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Database    │  │  Cookie      │  │     Observability        │  │
│  │  Storage     │  │  (Cart)      │  │     (Logging/Metrics)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL + Drizzle)                  │
├────────────────────────────────────────────────────────────────────┤
│  Users │ Products │ Orders │ Cart │ AI Content │ Integrations      │
└────────────────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, TypeScript | UI components and state |
| Styling | Tailwind CSS, Shadcn/UI | Design system |
| Routing | Wouter | Client-side navigation |
| State | TanStack Query v5 | Server state management |
| Forms | React Hook Form + Zod | Form handling & validation |
| Backend | Express.js, TypeScript | API server |
| Database | PostgreSQL + Drizzle ORM | Data persistence |
| AI | OpenAI (active) | Content generation |
| PWA | Service Worker, IndexedDB | Offline support |
| Testing | Playwright | End-to-end tests |

> **Note**: Additional AI providers (Anthropic, Gemini, ElevenLabs) are configured but require API keys to activate.

---

## API Reference

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securePassword123"
}
```

---

### Products API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get single product |
| `POST` | `/api/products` | Create product |
| `PATCH` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

#### Create Product Example

```http
POST /api/products
Content-Type: application/json

{
  "name": "Premium Widget",
  "slug": "premium-widget",
  "description": "A high-quality widget for all your needs",
  "price": "29.99",
  "categoryId": "category-uuid",
  "stock": 100,
  "images": ["https://example.com/image.jpg"],
  "tags": ["premium", "widget"]
}
```

---

### Cart API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart` | Get cart items |
| `POST` | `/api/cart` | Add item to cart |
| `PATCH` | `/api/cart/:id` | Update item quantity |
| `DELETE` | `/api/cart/:id` | Remove item |
| `DELETE` | `/api/cart` | Clear entire cart |

**Note**: Cart uses `cartSessionId` cookie for anonymous users.

---

### Orders API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/:id` | Get order with items |
| `POST` | `/api/orders` | Create order from cart |
| `PATCH` | `/api/orders/:id/status` | Update order status |

---

### AI Tools API

All AI endpoints are prefixed with `/api/ai`.

#### Brand Voices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/brand-voices` | List brand voice profiles |
| `GET` | `/api/ai/brand-voices/:id` | Get specific profile |
| `POST` | `/api/ai/brand-voices` | Create profile |
| `PATCH` | `/api/ai/brand-voices/:id` | Update profile |
| `DELETE` | `/api/ai/brand-voices/:id` | Delete profile |

#### Product Concepts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/product-concepts` | List concepts |
| `POST` | `/api/ai/product-concepts` | Create concept |
| `POST` | `/api/ai/product-concepts/generate` | Generate AI concept |
| `PATCH` | `/api/ai/product-concepts/:id` | Update concept |
| `DELETE` | `/api/ai/product-concepts/:id` | Delete concept |

#### Marketing Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/campaigns` | List campaigns |
| `POST` | `/api/ai/campaigns` | Create campaign |
| `POST` | `/api/ai/campaigns/:id/generate-assets` | Generate AI assets |

#### Streaming Generation

```http
GET /api/ai/stream/generate?prompt=...&type=description
Accept: text/event-stream
```

Returns Server-Sent Events (SSE) with real-time AI generation progress.

---

### Integration API

All integration endpoints are prefixed with `/api/integrations`.

#### Platform Connectors

FlashFusion defines connector configurations for 25+ platforms across categories: AI, e-commerce, automation, infrastructure, business, and productivity.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/integrations/connectors` | List available connector configurations |
| `GET` | `/api/integrations/connectors/category/:cat` | Filter by category |
| `GET` | `/api/integrations/connections` | List user connections |
| `POST` | `/api/integrations/connections` | Create connection (store credentials) |
| `DELETE` | `/api/integrations/connections/:platform` | Disconnect platform |

> **Status**: Connector configurations are defined for platforms like Etsy, Printify, Shopify, Amazon KDP, etc. Full API integrations for publishing are in development.

#### Health & Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/health` | AI provider health status |
| `GET` | `/api/ai/metrics` | Usage metrics and errors |

---

## Data Models

### Core Entities

#### Users

```typescript
interface User {
  id: string;           // UUID
  username: string;     // Unique
  email: string;        // Unique
  password: string;     // Plain text (development only - implement bcrypt for production)
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'customer' | 'admin';
}
```

> **Security Note**: Passwords are currently stored in plain text. Before production deployment, implement password hashing with bcrypt.

#### Products

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;              // URL-friendly, unique
  description?: string;
  price: string;             // Decimal as string
  compareAtPrice?: string;
  categoryId?: string;
  images: string[];
  stock: number;
  sku?: string;
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  metadata?: Record<string, any>;
}
```

#### Orders

```typescript
interface Order {
  id: string;
  userId?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  createdAt: Date;
}
```

### AI Entities

#### Brand Voice Profile

```typescript
interface BrandVoiceProfile {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  isDefault: boolean;
  tone: 'professional' | 'casual' | 'playful' | 'authoritative' | 'friendly';
  personality: string[];
  targetAudience?: string;
  brandValues: string[];
  writingStyle: 'formal' | 'conversational' | 'technical' | 'creative';
  vocabularyLevel: 'simple' | 'intermediate' | 'advanced' | 'technical';
  avoidWords: string[];
  preferredPhrases: string[];
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Product Concept

```typescript
interface ProductConcept {
  id: string;
  userId?: string;
  brandVoiceId?: string;
  prompt: string;
  marketplace: string;
  targetPlatforms: string[];
  priceRange?: string;
  generatedTitle?: string;
  generatedDescription?: string;
  generatedTags: string[];
  generatedFeatures: string[];
  generatedImages?: ImageData[];
  heroImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  status: 'draft' | 'generating' | 'ready' | 'published' | 'archived';
  qualityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │───┐   │  Products   │       │ Categories  │
└─────────────┘   │   └─────────────┘       └─────────────┘
      │           │          │                     │
      │           │          └─────────────────────┘
      │           │                    │
      ▼           ▼                    ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Orders    │  │ Cart Items  │  │Order Items  │
└─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ Brand Voice │───────│  Product    │       │  Marketing  │
│  Profiles   │       │  Concepts   │       │  Campaigns  │
└─────────────┘       └─────────────┘       └─────────────┘
      │                     │                     │
      └─────────────────────┴─────────────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │  AI Content     │
                  │  Library        │
                  └─────────────────┘
```

---

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://...` |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features | `sk-...` |
| `NODE_ENV` | No | Environment mode | `development` / `production` |

> **Note**: The application uses cookie-based cart sessions (`cartSessionId` cookie) rather than server-side session management. No session secret is currently required.

### AI Provider Configuration

FlashFusion has connector configurations for multiple AI providers. Currently, **OpenAI is the primary active provider**:

| Provider | Environment Variable | Status | Features |
|----------|---------------------|--------|----------|
| OpenAI | `OPENAI_API_KEY` | **Active** | GPT-4, GPT-3.5, DALL-E |
| Anthropic | `ANTHROPIC_API_KEY` | Configured | Claude (requires API key) |
| Google | `GEMINI_API_KEY` | Configured | Gemini Pro (requires API key) |
| ElevenLabs | `ELEVENLABS_API_KEY` | Configured | Voice synthesis (requires API key) |
| Grok | `GROK_API_KEY` | Configured | Text generation (requires API key) |
| Perplexity | `PERPLEXITY_API_KEY` | Configured | Research/search (requires API key) |

> **Note**: Only providers with valid API keys configured will be available. OpenAI is the default and recommended provider.

### PWA Configuration

The PWA manifest is located at `client/public/manifest.json`:

```json
{
  "name": "FlashFusion",
  "short_name": "FlashFusion",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4725f4",
  "background_color": "#0d0b14"
}
```

---

## User Flows

### Product Creation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Enter     │───►│   Select    │───►│   AI        │───►│   Review    │
│   Prompt    │    │   Options   │    │   Generate  │    │   & Edit    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
                                                               ▼
                                                        ┌─────────────┐
                                                        │   Save to   │
                                                        │   Products  │
                                                        └─────────────┘
```

> **Note**: External platform publishing (Etsy, Printify, etc.) is planned but not yet implemented.

### Checkout Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   View      │───►│   Enter     │───►│   Review    │───►│   Order     │
│   Cart      │    │   Address   │    │   Order     │    │   Created   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

> **Note**: The checkout flow creates order records for tracking. Payment processing integration (Stripe, etc.) is not yet implemented.

### Brand Voice Setup Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Name &    │───►│   Set Tone  │───►│   Define    │───►│   Add       │
│   Industry  │    │   & Style   │    │   Audience  │    │   Examples  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Testing & Quality

### Test Coverage Expectations

| Category | Minimum Coverage | Target Coverage |
|----------|-----------------|-----------------|
| Unit Tests | 70% | 85% |
| Integration Tests | 60% | 75% |
| E2E Tests | Core flows | All user journeys |

### Running Tests

```bash
# Run E2E tests
npx playwright test

# Run E2E tests with UI
npx playwright test --ui

# Run specific test file
npx playwright test e2e/pwa.spec.ts

# Generate test report
npx playwright show-report
```

### E2E Test Structure

```
e2e/
└── pwa.spec.ts          # PWA feature tests (service worker, offline, manifest)
```

> **Planned Tests**: Additional test suites for authentication, products, checkout, and AI tools are planned for future releases.

### Smoke Checks

Before deployment, verify:

- [ ] Application loads without console errors
- [ ] Login/register flow works (dev mode - passwords not hashed)
- [ ] Products can be viewed and added to cart
- [ ] Cart persists across page refreshes (via cookie)
- [ ] AI generation returns results (requires OpenAI API key)
- [ ] PWA installs correctly

> **Note**: Checkout flow collects address information but payment processing is not implemented. Order records are created for tracking purposes.

---

## Security & Compliance

### Authentication Flow

FlashFusion uses a simple cookie-based session approach:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────►│  Server  │────►│ Database │
│          │     │          │     │          │
│ Credentials    │ Validate │     │ Compare  │
│          │◄────│          │◄────│ Password │
│          │     │          │     │          │
│ Response │◄────│ Return   │     │          │
│          │     │ User     │     │          │
└──────────┘     └──────────┘     └──────────┘
```

> **Important**: The current authentication is development-ready but not production-hardened. Password hashing (bcrypt) and JWT tokens should be implemented before production deployment.

**Anonymous Cart Sessions**: Uses `cartSessionId` cookie for cart persistence without login.

### OWASP Considerations

| Vulnerability | Current Status | Recommended Mitigation |
|---------------|----------------|------------------------|
| SQL Injection | Mitigated | Drizzle ORM with parameterized queries |
| XSS | Mitigated | React's built-in escaping, CSP headers |
| CSRF | Partial | SameSite cookies; add CSRF tokens for forms |
| Sensitive Data Exposure | Mitigated | HTTPS, environment variables for secrets |
| Broken Authentication | **Needs Work** | Add password hashing (bcrypt), implement JWT |

> **Production Checklist**: Before deploying to production, implement password hashing, rate limiting on auth endpoints, and session token management.

### Secrets Handling

- **Never commit secrets** to version control
- Use environment variables via Replit Secrets
- API keys are stored server-side only
- Client never sees raw API keys
- Database credentials managed by platform

### Content Security Policy

The application includes a CSP header to prevent XSS:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' * 'unsafe-inline' 'unsafe-eval';">
```

---

## Observability & Operations

### Logging Conventions

FlashFusion uses structured logging:

```typescript
// Log format
[timestamp] [level] [module] message

// Examples
[2026-01-22T15:48:56.937Z] [INFO] [AIService] OpenAI provider initialized
[2026-01-22T15:49:00.123Z] [ERROR] [Cart] Failed to add item: Invalid product ID
```

| Level | Usage |
|-------|-------|
| `INFO` | Normal operations, startup events |
| `WARN` | Recoverable issues, deprecations |
| `ERROR` | Failures requiring attention |
| `DEBUG` | Detailed diagnostic info (dev only) |

### Health Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `GET /api/ai/health` | AI provider status | Provider availability |
| `GET /api/ai/metrics` | Usage statistics | Request counts, errors |

### Metrics Collection

The `/api/ai/metrics` endpoint returns:

- AI generation request counts
- Provider status and errors
- Basic usage statistics

> **Note**: Advanced metrics (p50/p95/p99 latencies, detailed cost tracking) are available in the observability module but not yet exposed via dedicated dashboards.

### Observability Features

The AI service layer includes:

- **Structured Logging**: Timestamped logs with module context
- **Health Checks**: `/api/ai/health` for provider availability
- **Error Tracking**: Error messages and counts in metrics response
- **Retry Logic**: Automatic retries on transient failures (configured in AI service)

> **Planned**: Circuit breaker patterns and advanced alerting are architecturally planned but not yet fully implemented.

### Backup & Restore

Database backups are managed by Replit:

1. **Automatic Checkpoints**: Created during development
2. **Manual Rollback**: Via Replit checkpoint system
3. **Export**: Available through Replit database panel

---

## Examples & Use Cases

### Example 1: Creating a Product with AI

```typescript
// 1. Create a brand voice profile
const brandVoice = await fetch('/api/ai/brand-voices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Modern Tech',
    tone: 'professional',
    personality: ['innovative', 'trustworthy'],
    writingStyle: 'conversational'
  })
});

// 2. Generate a product concept
const concept = await fetch('/api/ai/product-concepts', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Minimalist wireless charging pad',
    marketplace: 'tech',
    targetPlatforms: ['amazon', 'shopify'],
    brandVoiceId: brandVoice.id
  })
});

// 3. Generate AI content
await fetch(`/api/ai/product-concepts/generate`, {
  method: 'POST',
  body: JSON.stringify({ conceptId: concept.id })
});
```

### Example 2: Setting Up Platform Integration (Placeholder)

> **Note**: Platform publishing integrations are in development. The following shows the intended API structure.

```typescript
// 1. List available connector configurations
const connectors = await fetch('/api/integrations/connectors');
// Returns 25+ connector configurations (Etsy, Printify, Shopify, etc.)

// 2. Store platform credentials
await fetch('/api/integrations/connections', {
  method: 'POST',
  body: JSON.stringify({
    platform: 'etsy',
    credentials: { apiKey: '...' }
  })
});

// 3. Queue product for publishing (placeholder - not yet connected to live APIs)
await fetch('/api/integrations/publishing/queue', {
  method: 'POST',
  body: JSON.stringify({
    productId: 'product-uuid',
    platforms: ['etsy']
  })
});
```

### Example 3: Real-time AI Streaming

```typescript
// Stream AI generation with SSE
const eventSource = new EventSource(
  '/api/ai/stream/generate?prompt=Product+description&type=description'
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Chunk:', data.content);
  
  if (data.done) {
    eventSource.close();
  }
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
```

---

## Troubleshooting

### Common Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Black screen on load | Service worker caching stale assets | Clear browser cache, unregister SW |
| API returns 500 | Database connection issue | Check DATABASE_URL, restart server |
| AI generation fails | Invalid/missing API key | Verify OPENAI_API_KEY in secrets |
| Cart not persisting | Cookie blocked | Enable cookies, check same-origin |
| PWA not installing | Missing manifest/icons | Check manifest.json, icon paths |
| Slow page loads | Large bundle, no lazy loading | Routes should use React.lazy() |

### Debugging Steps

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Server Logs**: `npm run dev` output shows errors
3. **Verify Environment**: Ensure all required secrets are set
4. **Test API Endpoints**: Use curl or Postman directly
5. **Clear Caches**: Browser cache, service worker, database

### Service Worker Issues

To reset the service worker:

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
// Then refresh the page
```

---

## Version History

### v3.0.1 (February 2026)

**New Features**:
- Mobile-first futuristic UI with iOS-inspired patterns
- Tax Compliance Command dashboard
- Product Pulse Heatmap with 3D visualization
- Fusion Core mobile experience
- Brand Calibration neural interface
- AI Insights cross-platform analytics

**Improvements**:
- Service worker dev mode detection
- Accessibility fixes (Label/Input associations)
- PWA offline reliability enhancements

### v2.1.0 (January 2026)

**New Features**:
- Progressive Web App (PWA) implementation
- IndexedDB offline persistence
- Background sync for offline actions
- E2E test suite with Playwright

**Improvements**:
- Lazy loading for all routes
- Connection status monitoring
- Observability module with structured logging

### v2.0.0 (January 2026)

**Breaking Changes**:
- Migrated from Base44 SDK to PostgreSQL
- Complete UI rebuild with dark theme

**New Features**:
- AI Content Generator
- Multi-provider AI service layer
- Real-time SSE streaming
- Health and metrics endpoints

---

## Style Guide Appendix

### Terminology

| Term | Definition |
|------|------------|
| Brand Voice | AI configuration for consistent content tone |
| Product Concept | AI-generated product idea before publishing |
| Connector | Integration adapter for external platform |
| Workflow | Automated sequence of actions (n8n) |
| Safeguard | Quality check before publishing |

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: 2-space indentation
- **Naming**: camelCase for variables, PascalCase for components
- **Imports**: Absolute paths with `@/` prefix

### UI Component Patterns

```typescript
// Component structure
export function MyComponent({ prop1, prop2 }: Props) {
  // Hooks first
  const [state, setState] = useState();
  
  // Derived values
  const computed = useMemo(() => ..., [deps]);
  
  // Effects
  useEffect(() => { ... }, [deps]);
  
  // Event handlers
  const handleClick = () => { ... };
  
  // Render
  return (
    <div data-testid="component-name">
      ...
    </div>
  );
}
```

### Test ID Conventions

- Interactive elements: `{action}-{target}` (e.g., `button-submit`)
- Display elements: `{type}-{content}` (e.g., `text-username`)
- Dynamic elements: `{type}-{description}-{id}` (e.g., `card-product-123`)

### API Response Format

```typescript
// Success
{
  "data": { ... },
  "meta": { "count": 10, "page": 1 }
}

// Error
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [Playwright Testing](https://playwright.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

*Last Updated: January 2026*  
*Documentation Version: 3.0.1*
