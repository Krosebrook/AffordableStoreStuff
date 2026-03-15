# AffordableStoreStuff

A full-stack mobile commerce platform built with Expo/React Native and Node.js/Express, designed for managing product listings, AI-powered content generation, and multi-marketplace publishing.

## Architecture

```
Mobile App (Expo / React Native)
    | HTTPS
Vercel (Express API - serverless functions)
    | PostgreSQL (pooled connection)
Supabase (Database)
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed design decisions and data flow.

## Tech Stack

- **Frontend**: Expo SDK 54, React Native, Expo Router, React Query
- **Backend**: Express 5, Node.js, TypeScript
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **AI**: OpenAI API (content generation, listing optimization, image generation)
- **Hosting**: Vercel (API), EAS (mobile builds)
- **Payments**: Stripe (subscription billing)

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase, OpenAI, and Stripe credentials
```

See [.env.example](.env.example) for all available variables.

### 3. Set Up Database

```bash
node --env-file=.env ./node_modules/.bin/drizzle-kit push
```

### 4. Run Locally

```bash
# Terminal 1: API server
npm run server:dev

# Terminal 2: Expo app
npm run dev
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment instructions covering:
- Supabase database setup
- Vercel API deployment
- EAS mobile builds
- Google Play Store submission
- Rollback procedures

### Quick Deploy

```bash
# API
vercel --prod

# Mobile
eas build --platform android --profile production
eas submit --platform android --profile production
```

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/request-reset` | Request password reset email |
| POST | `/api/auth/reset-password` | Complete password reset with token |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| PUT | `/api/product-images` | Update product images |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

### Marketplace Listings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | List all listings |
| GET | `/api/listings/:id` | Get listing by ID |
| GET | `/api/products/:id/listings` | Get listings for a product |
| POST | `/api/listings` | Create a listing |
| PUT | `/api/listings/:id` | Update a listing |
| POST | `/api/listings/:id/publish` | Publish a listing |
| POST | `/api/listings/:id/confirm-publish` | Confirm listing publication |
| POST | `/api/listings/:id/regenerate-content` | Regenerate listing content with AI |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create an order |
| PUT | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/:id/items` | Get order items |
| POST | `/api/orders/:id/items` | Add item to order |

### AI Generation (SSE streaming)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-product` | Generate product listing content |
| POST | `/api/ai/generate-marketing` | Generate marketing copy |
| GET | `/api/ai/usage` | Get AI usage statistics |

### Brand Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brand-profiles` | List brand profiles |
| POST | `/api/brand-profiles` | Create a brand profile |
| PUT | `/api/brand-profiles/:id` | Update a brand profile |
| DELETE | `/api/brand-profiles/:id` | Delete a brand profile |

### Content Library

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | List content items |
| POST | `/api/content` | Create content item |
| PUT | `/api/content/:id/favorite` | Toggle favorite status |
| DELETE | `/api/content/:id` | Delete content item |

### Publishing Queue

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/publishing-queue` | List queued items |
| GET | `/api/publishing-queue/stats` | Get queue statistics |
| POST | `/api/publishing-queue` | Add item to queue |
| PUT | `/api/publishing-queue/:id/status` | Update item status |
| DELETE | `/api/publishing-queue/:id` | Remove from queue |

### Social Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/social/platforms` | List connected platforms |
| POST | `/api/social/content` | Create social content |
| GET | `/api/social/content` | List social content |
| GET | `/api/social/analytics` | Get social analytics |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List teams |
| POST | `/api/teams` | Create a team |
| GET | `/api/teams/:id/members` | List team members |
| POST | `/api/teams/:id/members` | Add team member |
| PUT | `/api/teams/:teamId/members/:memberId` | Update member role |
| DELETE | `/api/teams/:teamId/members/:memberId` | Remove team member |

### Marketing Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create a campaign |
| PUT | `/api/campaigns/:id` | Update a campaign |
| DELETE | `/api/campaigns/:id` | Delete a campaign |

### Shop (Consumer-facing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop/cart` | Get cart items |
| POST | `/api/shop/cart` | Add to cart |
| PUT | `/api/shop/cart/:id` | Update cart item |
| DELETE | `/api/shop/cart/:id` | Remove from cart |
| GET | `/api/shop/style-profile` | Get style profile |
| POST | `/api/shop/style-profile` | Create/update style profile |
| POST | `/api/shop/stylist-chat` | Chat with AI stylist (SSE) |
| GET | `/api/shop/wardrobe` | List wardrobe items |
| POST | `/api/shop/wardrobe` | Add wardrobe item |
| DELETE | `/api/shop/wardrobe/:id` | Remove wardrobe item |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/plans` | List subscription plans |
| GET | `/api/billing/subscription` | Get current subscription |
| POST | `/api/billing/checkout` | Create checkout session |
| POST | `/api/billing/webhook` | Stripe webhook handler |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/objects/upload` | Upload file to cloud storage |

## Project Structure

```
app/                    Expo Router screens (file-based routing)
  (tabs)/               Seller tab navigation (dashboard, products, orders)
  (shop)/               Consumer shop (catalog, cart, stylist)
  product/              Product detail and creation screens
api/                    Vercel serverless entry point
components/             Reusable React Native UI components
hooks/                  Custom React hooks
lib/                    Client utilities (API client, query config)
server/                 Express API backend
  services/             Business logic (image gen, Stripe, publishing)
shared/                 Shared types and Drizzle ORM schema
assets/                 Images, icons, privacy policy
scripts/                Build scripts
```

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, tech decisions |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Full deployment guide (Vercel, EAS, Play Store) |
| [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) | Development workflow and code style |
| [.github/SECURITY.md](.github/SECURITY.md) | Security practices and vulnerability reporting |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [.env.example](.env.example) | Environment variable reference |

## Troubleshooting

### `drizzle-kit: command not found`
Run `npm install` first. `drizzle-kit` is a devDependency. Use `npx drizzle-kit push` or `node --env-file=.env ./node_modules/.bin/drizzle-kit push`.

### `DATABASE_URL must be set`
Create a `.env` file from `.env.example` and set your Supabase connection string. For drizzle-kit, use `node --env-file=.env` to load it.

### Special characters in database password
URL-encode special characters: `!` = `%21`, `?` = `%3F`, `@` = `%40`, `#` = `%23`. Use single quotes in bash to prevent shell interpretation.

### `Cannot find module '@shared/schema'`
Server files use relative imports (`../shared/schema`). If you see this error, a file may still have the old `@shared/` alias. Update it to a relative path.

### CORS errors from mobile app
Mobile apps send requests without an `Origin` header, which is allowed by the CORS config. If you see CORS errors from a web browser, ensure the origin is in the allowed list.

### Vercel deployment returns 500
Check Vercel Function Logs in the dashboard. Common causes:
- `DATABASE_URL` not set in Vercel environment variables
- Database connection string uses direct URL (port 5432) instead of pooler (port 6543)

### EAS build fails
- Ensure `eas login` is completed
- Check that `app.json` owner matches your Expo account username
- Run `eas build --platform android --profile preview` first to test with an APK

## License

Copyright (c) 2026 AffordableStoreStuff. All rights reserved. See [LICENSE](LICENSE).
