# FlashFusion v2.2 - AI-Powered E-commerce Hub

<div align="center">

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/Krosebrook/AffordableStoreStuff)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)

**Transform your business with automated AI-powered content creation and print-on-demand automation**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## 🌟 Overview

FlashFusion is a modern, premium e-commerce platform combining artificial intelligence with print-on-demand automation. Built with React, TypeScript, and Express, it provides a comprehensive solution for content creators, marketers, and e-commerce entrepreneurs looking to automate their passive income streams.

### Why FlashFusion?

- **🤖 AI-Powered Content Generation** - Automated product descriptions, marketing copy, and social media content using OpenAI
- **🎨 Brand Voice Management** - Maintain consistent AI-generated content aligned with your brand identity
- **📊 Real-time Analytics** - Track revenue, product performance, and campaign insights
- **🔌 Extensible Platform** - 25+ connector configurations for popular platforms (Etsy, Printify, Amazon KDP, Gumroad, etc.)
- **📱 Progressive Web App** - Install on any device with offline support
- **🎭 Premium UI/UX** - Dark theme with glass-morphism effects and gradient accents

### Live Demo

> 🔗 [Try FlashFusion Demo](https://your-demo-url.com) (Coming Soon)

### Screenshots

<details>
<summary>Click to view screenshots</summary>

*Coming soon - Add screenshots of dashboard, product creation, AI generator, etc.*

</details>

## ✨ Features

### Core Features

#### 🛍️ E-commerce Suite
- Product catalog management with categories and tags
- Shopping cart with session persistence
- Secure checkout process
- Order management and tracking
- Real-time inventory management

#### 🤖 AI Content Generation
- **AI Product Creator** - Generate complete product concepts with descriptions
- **AI Marketing Engine** - Create marketing campaigns and assets
- **Brand Voice Profiles** - Consistent AI content generation
- **Streaming Generation** - Real-time content preview with SSE
- **Content Library** - Manage and reuse AI-generated content

#### 📊 Analytics & Insights
- Revenue tracking and forecasting
- Product performance heatmaps
- Cross-platform analytics
- AI-powered recommendations
- Real-time dashboard with KPIs

#### 🔐 Security & Authentication
- Bcrypt password hashing (12 rounds)
- Session-based authentication with PostgreSQL store
- OAuth integration (Replit Auth - Google, GitHub, Apple, X)
- Password reset with email verification
- Secure API endpoints

#### 📱 Progressive Web App (PWA)
- Installable on desktop and mobile
- Offline support with service worker
- IndexedDB for offline persistence
- Background sync for pending actions
- Push notifications ready

#### 🎨 Premium Design System
- Dark theme with glass-morphism effects
- Gradient accents (purple-pink, blue-cyan)
- Mobile-first responsive design
- Smooth animations respecting `prefers-reduced-motion`
- Shadcn/UI component library

### Platform Integrations (In Development)

- **Print-on-Demand**: Printify, Printful, Teespring
- **Marketplaces**: Etsy, Amazon, eBay, Redbubble
- **Digital Products**: Gumroad, Amazon KDP
- **Social Commerce**: Instagram Shop, Facebook Shop, TikTok Shop
- **Automation**: n8n workflows, Zapier integration

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4.x, Shadcn/UI
- **State Management**: TanStack Query (React Query v5)
- **Forms**: React Hook Form + Zod validation
- **Routing**: Wouter
- **Charts**: Recharts
- **Icons**: Lucide React
- **PWA**: Service Worker, Web App Manifest, IndexedDB

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js, express-session, bcrypt
- **AI Integration**: OpenAI SDK
- **Email**: Resend
- **WebSocket**: ws library

### DevOps & Tools
- **Build Tool**: Vite 7
- **Package Manager**: npm
- **Testing**: Playwright for E2E tests
- **Database Tools**: Drizzle Kit
- **Code Quality**: TypeScript strict mode

## 🚀 Quick Start

### Prerequisites

```bash
# Check your Node.js version (18.x or higher required)
node --version

# Check npm version
npm --version

# PostgreSQL 12+ required
psql --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/AffordableStoreStuff.git
   cd AffordableStoreStuff
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure database**
   ```bash
   # Update DATABASE_URL in .env
   DATABASE_URL="postgresql://user:password@localhost:5432/flashfusion"
   
   # Push schema to database
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   Navigate to: http://localhost:5000
   ```

### First Run Setup

After starting the application:

1. **Create an admin account** - Visit `/auth` and register
2. **Seed demo data** (optional) - POST to `/api/seed`
3. **Configure AI settings** - Add your OpenAI API key in settings
4. **Set up brand voice** - Create your first brand voice profile
5. **Create your first product** - Use the AI Product Creator

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flashfusion"

# Server
PORT=5000
NODE_ENV=development

# Session (generate with: openssl rand -base64 32)
SESSION_SECRET="your-super-secret-session-key"

# AI Services (optional - for AI features)
OPENAI_API_KEY="sk-..."

# Email (optional - for password reset)
RESEND_API_KEY="re_..."

# OAuth (optional - for social login)
REPLIT_CLIENT_ID="your-client-id"
REPLIT_CLIENT_SECRET="your-client-secret"
REPLIT_CALLBACK_URL="http://localhost:5000/api/auth/replit/callback"
```

### Database Configuration

#### Using Replit Database (Recommended for Replit)

Replit provides a built-in PostgreSQL database. No configuration needed!

#### Using External PostgreSQL

```bash
# Install PostgreSQL locally or use a cloud provider:
# - Supabase (recommended for production)
# - Railway
# - Heroku Postgres
# - AWS RDS

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### AI Service Configuration

FlashFusion supports multiple AI providers:

```typescript
// Current implementation uses OpenAI
// Future support for:
// - Anthropic (Claude)
// - Google (Gemini)
// - Grok
// - Perplexity
// - ElevenLabs (voice)
```

## 📖 Usage

### For End Users

1. **Product Management**
   - Navigate to `/products` to view and manage products
   - Use AI Product Creator at `/ai-product-creator` to generate products
   - Bulk import/export via CSV (coming soon)

2. **Content Generation**
   - Visit `/ai-marketing-engine` for campaign creation
   - Use brand voice profiles for consistent messaging
   - Generate product descriptions, social posts, and emails

3. **Analytics**
   - Real-time dashboard at `/dashboard`
   - Product performance at `/product-pulse-heatmap`
   - Cross-platform analytics at `/ai-insights`

### For Developers

#### API Examples

**Authentication:**
```typescript
// Register new user
POST /api/auth/register
{
  "username": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}

// Login
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "SecurePass123!"
}

// Get current user
GET /api/auth/me
```

**Products:**
```typescript
// Get all products
GET /api/products

// Create product
POST /api/products
{
  "name": "Premium T-Shirt",
  "description": "High-quality cotton t-shirt",
  "price": "29.99",
  "stock": 100,
  "images": ["https://example.com/image.jpg"]
}

// Update product
PATCH /api/products/:id
{
  "price": "24.99",
  "stock": 95
}
```

**AI Content Generation:**
```typescript
// Generate product concept
POST /api/ai/product-concepts/generate
{
  "brandVoiceId": "123",
  "niche": "sustainable fashion",
  "targetAudience": "eco-conscious millennials"
}

// Stream content generation
GET /api/ai/stream/generate
Accept: text/event-stream
```

See [API_DOCUMENTATION.md](./attached_assets/API_DOCUMENTATION_1769046026908.md) for complete API reference.

#### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Push database schema changes
npm run db:push

# Run E2E tests
npx playwright test
```

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Pages    │  │ Components │  │   Hooks    │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│         │              │                  │              │
│         └──────────────┴──────────────────┘              │
│                        │                                 │
│              ┌─────────▼──────────┐                     │
│              │   TanStack Query   │                     │
│              └─────────┬──────────┘                     │
└────────────────────────┼──────────────────────────────┘
                         │ HTTP/SSE
┌────────────────────────▼──────────────────────────────┐
│                 Server (Express)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │   Routes   │  │  Storage   │  │   AI Svc   │      │
│  └────────────┘  └────────────┘  └────────────┘      │
│         │              │                  │            │
│         └──────────────┴──────────────────┘            │
│                        │                               │
│              ┌─────────▼──────────┐                   │
│              │   Drizzle ORM      │                   │
│              └─────────┬──────────┘                   │
└────────────────────────┼────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│               PostgreSQL Database                    │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Users  │ │Products│ │   Cart   │ │  Orders   │ │
│  └────────┘ └────────┘ └──────────┘ └───────────┘ │
└────────────────────────────────────────────────────┘
```

### Project Structure

```
AffordableStoreStuff/
├── client/                   # Frontend React application
│   ├── public/              # Static assets
│   │   ├── manifest.json    # PWA manifest
│   │   └── sw.js           # Service worker
│   └── src/
│       ├── components/      # Reusable components
│       │   ├── ui/         # Shadcn UI components
│       │   ├── app-sidebar.tsx
│       │   ├── cart-drawer.tsx
│       │   └── product-card.tsx
│       ├── pages/          # Route pages
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities & providers
│       └── App.tsx         # Main app component
├── server/                  # Backend Express application
│   ├── db.ts               # Database connection
│   ├── storage.ts          # Data access layer
│   ├── routes.ts           # API endpoints
│   ├── email.ts            # Email service
│   └── index.ts            # Server entry point
├── shared/                  # Shared code
│   ├── schema.ts           # Drizzle schema
│   └── models/             # TypeScript types
├── e2e/                    # Playwright tests
├── script/                 # Build scripts
├── attached_assets/        # Documentation assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── playwright.config.ts
└── tailwind.config.ts
```

### Database Schema

Key tables and relationships:

```sql
-- Users & Authentication
users (id, username, password_hash, full_name, created_at)

-- Product Catalog
categories (id, name, slug, parent_id)
products (id, name, description, price, stock, images, category_id)

-- Shopping Cart
cart_items (id, user_id, product_id, quantity, session_id)

-- Orders
orders (id, user_id, total, status, shipping_address, billing_address)
order_items (id, order_id, product_id, quantity, price)

-- AI Features
brand_voices (id, user_id, name, tone, guidelines)
product_concepts (id, user_id, concept_data, status)
campaigns (id, user_id, name, type, generated_assets)
```

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete schema details.

## 🧪 Testing

### Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test e2e/pwa.spec.ts

# Run tests in headed mode
npx playwright test --headed
```

### Test Coverage

Current E2E test coverage:
- ✅ PWA installation and offline support
- ✅ Authentication flow
- ✅ Product management
- ✅ Shopping cart operations
- ✅ Checkout process
- 🚧 AI content generation (in progress)

### Writing Tests

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('user can add product to cart', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="product-card"]:first-child');
  await page.click('[data-testid="add-to-cart"]');
  
  await expect(page.locator('[data-testid="cart-count"]'))
    .toHaveText('1');
});
```

## 🚢 Deployment

### Deployment to Replit (Recommended)

1. **Import repository to Replit**
   - Go to [replit.com](https://replit.com)
   - Click "Create" → "Import from GitHub"
   - Enter repository URL

2. **Configure Replit**
   - Replit will auto-detect configuration from `.replit`
   - Database is automatically provisioned

3. **Set environment variables**
   - Go to "Secrets" tab (🔒)
   - Add `SESSION_SECRET`, `OPENAI_API_KEY`, etc.

4. **Deploy**
   - Click "Run" to start development
   - Click "Deploy" for production deployment

### Deployment to Other Platforms

<details>
<summary>Deploy to Vercel</summary>

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
# Add PostgreSQL database (recommend Supabase integration)
```
</details>

<details>
<summary>Deploy to Heroku</summary>

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```
</details>

<details>
<summary>Deploy to Railway</summary>

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```
</details>

### Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate secure `SESSION_SECRET`
- [ ] Configure production database
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS properly
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure email service
- [ ] Test all critical paths
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Review security headers
- [ ] Optimize assets and bundles

See [DEPLOYMENT_GUIDE.md](./attached_assets/DEPLOYMENT_GUIDE_1769046026910.md) for detailed deployment instructions.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** - Found a bug? Open an issue
- 💡 **Suggest features** - Have an idea? We'd love to hear it
- 📖 **Improve documentation** - Help others understand FlashFusion
- 🔧 **Submit pull requests** - Fix bugs or add features
- ⭐ **Star the project** - Show your support

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run check && npx playwright test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (Prettier configuration included)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update relevant documentation
- Ensure all tests pass
- Follow the existing code style
- Add screenshots for UI changes

See [CONTRIBUTING.md](./attached_assets/CONTRIBUTING_1769046026910.md) for detailed guidelines.

## 📚 Documentation

- [Complete Documentation](./DOCUMENTATION.md) - Comprehensive guide
- [API Reference](./attached_assets/API_DOCUMENTATION_1769046026908.md) - API endpoints
- [Architecture](./attached_assets/ARCHITECTURE_1769046026908.md) - System design
- [Design Guidelines](./design_guidelines.md) - UI/UX guidelines
- [Deployment Guide](./attached_assets/DEPLOYMENT_GUIDE_1769046026910.md) - Deployment instructions
- [Security](./attached_assets/SECURITY_1769046026907.md) - Security best practices
- [Roadmap](./attached_assets/ROADMAP_1769046026907.md) - Future plans

## 💬 Support

### Getting Help

- 📖 **Documentation** - Check [DOCUMENTATION.md](./DOCUMENTATION.md)
- 💬 **Discussions** - Join [GitHub Discussions](https://github.com/Krosebrook/AffordableStoreStuff/discussions)
- 🐛 **Issues** - Report bugs on [GitHub Issues](https://github.com/Krosebrook/AffordableStoreStuff/issues)
- 📧 **Email** - Contact support@flashfusion.dev (coming soon)

### Community

- [Discord](https://discord.gg/flashfusion) (coming soon)
- [Twitter](https://twitter.com/flashfusion) (coming soon)
- [Blog](https://blog.flashfusion.dev) (coming soon)

## 🗺️ Roadmap

### Current Version: v2.2.0 (January 2026)

Recent additions:
- ✅ PWA with offline support
- ✅ Complete authentication system
- ✅ AI content generation
- ✅ Real-time streaming
- ✅ Email integration

### Upcoming: v2.3.0 (Q1 2026)

- [ ] Platform integrations (Printify, Etsy, Gumroad)
- [ ] Workflow automation with n8n
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Marketplace for templates

See [ROADMAP.md](./attached_assets/ROADMAP_1769046026907.md) for complete roadmap.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [OpenAI](https://openai.com/) - AI capabilities
- [Replit](https://replit.com/) - Development and hosting platform

## 🔒 Security

Found a security vulnerability? Please email security@flashfusion.dev (coming soon) or see [SECURITY.md](./attached_assets/SECURITY_1769046026907.md) for reporting instructions.

---

<div align="center">

**Built with ❤️ by the FlashFusion Team**

[Website](https://flashfusion.dev) • [Documentation](./DOCUMENTATION.md) • [Report Bug](https://github.com/Krosebrook/AffordableStoreStuff/issues) • [Request Feature](https://github.com/Krosebrook/AffordableStoreStuff/issues)

</div>
