# Changelog

All notable changes to FlashFusion are documented in this file.

## [3.0.1] - 2026-02-07

### Added
- Analytics dashboard with Recharts (bar chart, line chart, follower cards)
- Ecom Templates page with template browser and code generation
- Text overlay editor integration in Merch Studio mockup dialog
- Playwright E2E tests (auth flow, checkout flow)
- 5 new unit test files (product, cart, billing routes; usage-tracking, stripe services)

### Fixed
- Pre-existing TypeScript errors in test-utils.tsx, use-offline.ts, ai-product-creator.tsx
- Replaced jest references with vitest equivalents

## [3.0.0] - 2026-02-05

### Added
- **Merch Studio**: 31 POD products across 5 categories, 8 style presets, text overlay editor component
- **Social Media Management**: 5-platform support, content CRUD, scheduling auto-processor, analytics service
- **Team Collaboration**: Workspace creation, RBAC (owner/admin/member/viewer), invite system
- **Billing**: Stripe integration with 3 subscription tiers (Starter $9.99 / Pro $29.99 / Enterprise $99.99)
- **AI Layer**: LRU cache (100 entries, 1hr TTL), cost tracking, prompt builder, batch generation
- **Ecom Templates**: 6 platform integrations (Shopify, Printify, Etsy, TikTok Shop, Amazon KDP, GenAI SDK)
- Auth middleware (requireAuth, requireRole, requireTeamRole)
- Request body validation middleware (Zod)
- Plan limit enforcement middleware
- Error boundary component
- Vitest unit test suite (4 files, 15 tests)
- CI pipeline via GitHub Actions

### Changed
- Upgraded to Express 5 with async route handlers
- Refactored monolithic routes into 12 modular router files
- Schema expanded from 8 to 16 indexed tables with Drizzle relations
- Frontend pages lazy-loaded with React.lazy + Suspense

## [2.2.0] - 2026-01-15

### Added
- AI Product Creator with streaming support
- AI Influencer Studio
- AI Marketing Engine
- AI Brand Voice profiles
- Product Pulse Heatmap
- Fusion Core dashboard
- Brand Calibration tool
- AI Insights page
- Tax Compliance module
- Store Pulse real-time dashboard
- PWA support with offline sync
- Dark/light theme toggle

### Changed
- Initial FlashFusion platform release
- React + Vite + Express + PostgreSQL stack
- Shadcn/UI component library integration
