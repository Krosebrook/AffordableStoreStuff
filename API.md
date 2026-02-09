# FlashFusion v3.0.0 API Reference

Base URL: `/api`

## Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login with credentials |
| POST | /auth/logout | Yes | End session |
| GET | /auth/me | Yes | Get current user |

## Products (`/api/products`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /products | No | List all products |
| GET | /products/:id | No | Get single product |
| POST | /products | Yes | Create product |
| PATCH | /products/:id | Yes | Update product |
| DELETE | /products/:id | Yes | Delete product |

## Categories (`/api/categories`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /categories | No | List categories |
| POST | /categories | Yes | Create category |

## Cart (`/api/cart`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /cart | No | Get cart items (session-based) |
| POST | /cart | No | Add item to cart |
| PATCH | /cart/:id | No | Update item quantity |
| DELETE | /cart/:id | No | Remove item |
| DELETE | /cart | No | Clear cart |

## Orders (`/api/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /orders | Yes | List user orders |
| GET | /orders/:id | Yes | Get order details |
| POST | /orders | Yes | Create order from cart |

## Merch Studio (`/api/merch`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /merch/products | No | List all 31 POD products |
| GET | /merch/products/:id | No | Get product details |
| POST | /merch/sessions | Yes | Create mockup session |
| GET | /merch/sessions | Yes | List user sessions |
| POST | /merch/seed | No | Seed product catalog |

## Social Media (`/api/social`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /social/platforms | Yes | List connected platforms |
| POST | /social/platforms | Yes | Connect platform |
| DELETE | /social/platforms/:id | Yes | Disconnect platform |
| GET | /social/platforms/stats | Yes | Platform statistics |
| GET | /social/content | Yes | List content |
| GET | /social/content/:id | Yes | Get content by ID |
| POST | /social/content | Yes | Create content |
| PATCH | /social/content/:id | Yes | Update content |
| DELETE | /social/content/:id | Yes | Delete content |
| POST | /social/content/:id/publish | Yes | Publish content |
| POST | /social/content/:id/schedule | Yes | Schedule content |
| GET | /social/stats | Yes | Content statistics |
| GET | /social/analytics | Yes | Analytics snapshots |
| GET | /social/analytics/summary | Yes | Analytics summary (charts) |
| GET | /social/analytics/engagement | Yes | Engagement data |
| GET | /social/analytics/followers | Yes | Follower growth |
| GET | /social/scheduling/optimal-times | Yes | Optimal posting times |
| GET | /social/scheduling/calendar | Yes | Scheduling calendar |

## Team (`/api/team`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /team/workspaces | Yes | Create workspace |
| GET | /team/workspaces | Yes | List user workspaces |
| GET | /team/workspaces/:id/members | Yes | List members |
| POST | /team/workspaces/:id/invite | Yes | Invite member |
| POST | /team/invites/:code/accept | Yes | Accept invite |
| PATCH | /team/members/:id/role | Yes | Update member role |
| DELETE | /team/members/:id | Yes | Remove member |

## Billing (`/api/billing`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /billing/plans | No | List subscription plans |
| GET | /billing/subscription | Yes | Get current subscription |
| POST | /billing/checkout | Yes | Create Stripe checkout |
| POST | /billing/portal | Yes | Create Stripe portal |
| POST | /billing/webhook | No | Stripe webhook handler |
| GET | /billing/usage | Yes | Get usage data |

## AI Tools (`/api/ai`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /ai/product-concepts/generate | Yes | Generate product concept |
| GET | /ai/product-concepts | Yes | List concepts |
| GET | /ai/brand-voices | Yes | List brand voices |
| POST | /ai/brand-voices | Yes | Create brand voice |
| POST | /ai/stream | Yes | Stream AI generation |

## Ecom Templates (`/api/integrations/templates`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /integrations/templates | No | List all 6 templates |
| GET | /integrations/templates/:id | No | Get template with code |
| POST | /integrations/templates/:id/generate | Yes | Generate code with variables |

## Seed (`/api/seed`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /seed | No | Seed products + categories |
