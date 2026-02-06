# Architecture Documentation

This document describes the architecture, design decisions, and technical implementation of FlashFusion v2.2.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagrams](#architecture-diagrams)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Performance Optimization](#performance-optimization)
- [Design Decisions](#design-decisions)
- [Future Architecture](#future-architecture)

## System Overview

FlashFusion is a modern full-stack web application built with a React frontend and Express backend, designed to provide an AI-powered e-commerce and print-on-demand automation platform.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │  Wouter    │  │  TanStack  │            │
│  │  18.3.1    │  │  Routing   │  │   Query    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │              │                 │                   │
│         └──────────────┴─────────────────┘                   │
│                        │                                      │
│              ┌─────────▼──────────┐                         │
│              │   Service Worker   │ (PWA)                   │
│              │   IndexedDB        │                         │
│              └─────────┬──────────┘                         │
└────────────────────────┼──────────────────────────────────┘
                         │ HTTP/SSE
┌────────────────────────▼──────────────────────────────────┐
│                      Server Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │  Express   │  │  Passport  │  │    AI      │          │
│  │   5.0.1    │  │   Auth     │  │  Service   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│         │              │                 │                 │
│         └──────────────┴─────────────────┘                 │
│                        │                                    │
│              ┌─────────▼──────────┐                       │
│              │  Database Storage  │                       │
│              │   (Drizzle ORM)    │                       │
│              └─────────┬──────────┘                       │
└────────────────────────┼────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Data Layer                              │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐     │
│  │ Users  │ │Products│ │   Cart   │ │  Orders   │     │
│  └────────┘ └────────┘ └──────────┘ └───────────┘     │
│                   PostgreSQL 14+                         │
└────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
TanStack Query (State Management)
    │
    ▼
HTTP Request (fetch)
    │
    ▼
Express Route Handler
    │
    ├──► Passport (Auth Middleware)
    │
    ├──► Zod (Input Validation)
    │
    ▼
Storage Layer (Drizzle ORM)
    │
    ▼
PostgreSQL Database
    │
    ▼
Response ← ← ← ← ← ← ← ← ← ← ←
```

## Architecture Diagrams

### Component Hierarchy

```
App
├── ThemeProvider
│   └── QueryClientProvider
│       ├── AuthProvider
│       │   ├── SplashScreen
│       │   └── Router
│       │       ├── Public Routes
│       │       │   ├── Landing
│       │       │   └── Auth
│       │       └── Protected Routes
│       │           ├── Dashboard
│       │           ├── Products
│       │           ├── Orders
│       │           ├── AI Tools
│       │           └── Settings
│       └── Global Components
│           ├── Navigation
│           ├── CartDrawer
│           └── OfflineIndicator
```

### Data Flow (Cart Example)

```
┌──────────────┐
│ User clicks  │
│ "Add to Cart"│
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ ProductCard      │
│ calls onAddToCart│
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ TanStack Query       │
│ mutation.mutate()    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/cart       │
│ { productId, qty }   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Express Route        │
│ validates input      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Storage.addToCart()  │
│ Drizzle ORM          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PostgreSQL           │
│ INSERT cart_items    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Response             │
│ { id, productId }    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Query invalidation   │
│ refetch cart data    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ UI Updates           │
│ Cart count badge     │
└──────────────────────┘
```

## Technology Stack

### Frontend

**Core Framework:**
```
React 18.3.1
├── TypeScript 5.6.3
├── Vite 7.3.0 (Build Tool)
└── Wouter 3.3.5 (Routing)
```

**State Management:**
```
TanStack Query 5.60.5
├── Query caching
├── Optimistic updates
└── Background refetching
```

**UI Framework:**
```
Tailwind CSS 4.x
├── Shadcn/UI Components
├── Radix UI Primitives
├── Class Variance Authority
└── Tailwind Merge
```

**Forms & Validation:**
```
React Hook Form 7.55.0
└── Zod 3.24.2 (Schema validation)
```

### Backend

**Core Framework:**
```
Express 5.0.1
├── TypeScript
├── Cookie Parser
└── Express Session
```

**Database:**
```
PostgreSQL 14+
└── Drizzle ORM 0.39.3
    ├── Drizzle Kit (migrations)
    └── Drizzle Zod (validation)
```

**Authentication:**
```
Passport 0.7.0
├── Passport Local
├── Bcrypt 6.0.0 (12 rounds)
└── Connect PG Simple (sessions)
```

**AI Integration:**
```
OpenAI SDK 6.16.0
└── Future: Anthropic, Gemini, etc.
```

### Infrastructure

**PWA:**
```
Service Worker
├── Cache API
├── IndexedDB
└── Background Sync
```

**Build & Dev Tools:**
```
Vite 7.3.0
├── esbuild (bundling)
├── tsx (dev execution)
└── TypeScript compiler
```

**Testing:**
```
Playwright 1.57.0
└── E2E Testing
```

## Component Architecture

### Frontend Component Structure

```typescript
// Atomic Design Pattern (Modified)

// 1. Atoms (Base UI components)
/client/src/components/ui/
├── button.tsx          // Base button component
├── input.tsx           // Form input
├── card.tsx            // Card container
└── badge.tsx           // Status badge

// 2. Molecules (Composite components)
/client/src/components/
├── product-card.tsx    // Product display card
├── stats-card.tsx      // Dashboard stat widget
└── cart-item.tsx       // Cart item row

// 3. Organisms (Complex components)
/client/src/components/
├── app-sidebar.tsx     // Navigation sidebar
├── cart-drawer.tsx     // Shopping cart panel
└── product-grid.tsx    // Product list with filters

// 4. Pages (Route components)
/client/src/pages/
├── landing.tsx         // Landing page
├── dashboard.tsx       // Dashboard
└── products.tsx        // Product catalog
```

### Component Communication

**Props Down, Events Up:**
```typescript
// Parent Component
function ProductList() {
  const handleAddToCart = (productId: number) => {
    // Handle event
  };

  return (
    <ProductCard 
      product={product} 
      onAddToCart={handleAddToCart} 
    />
  );
}

// Child Component
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <button onClick={() => onAddToCart(product.id)}>
      Add to Cart
    </button>
  );
}
```

**Context for Global State:**
```typescript
// Auth Context
const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Backend Architecture

**Layered Architecture:**

```
┌─────────────────────────────────────┐
│         Routes Layer                 │
│  (Express route handlers)            │
│  - Request validation                │
│  - Response formatting               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│        Business Logic Layer          │
│  (Service classes, helpers)          │
│  - Business rules                    │
│  - AI integration                    │
│  - Email service                     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│         Data Access Layer            │
│  (DatabaseStorage class)             │
│  - CRUD operations                   │
│  - Query building                    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│         Database Layer               │
│  (PostgreSQL + Drizzle ORM)          │
│  - Schema definition                 │
│  - Migrations                        │
└─────────────────────────────────────┘
```

**File Structure:**

```typescript
server/
├── index.ts              // Server setup & initialization
├── routes.ts             // API route definitions
├── storage.ts            // Database operations
├── db.ts                 // Database connection
├── email.ts              // Email service
├── lib/
│   ├── ai-service.ts     // AI provider abstraction
│   ├── observability.ts  // Logging & metrics
│   └── utils.ts          // Helper functions
├── integrations/
│   └── ai/
│       ├── openai.ts     // OpenAI integration
│       └── providers.ts  // Provider interface
└── replit_integrations/
    └── auth.ts           // Replit OAuth
```

## Data Flow

### Optimistic Updates (Cart Example)

```typescript
// 1. User clicks "Add to Cart"
const mutation = useMutation({
  mutationFn: (item: CartItem) => 
    fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify(item)
    }),
  
  // 2. Optimistically update UI immediately
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['cart']);
    
    // Snapshot previous value
    const previousCart = queryClient.getQueryData(['cart']);
    
    // Optimistically update cache
    queryClient.setQueryData(['cart'], (old: CartItem[]) => 
      [...old, newItem]
    );
    
    return { previousCart };
  },
  
  // 3. If mutation fails, rollback
  onError: (err, newItem, context) => {
    queryClient.setQueryData(['cart'], context.previousCart);
  },
  
  // 4. Always refetch after error or success
  onSettled: () => {
    queryClient.invalidateQueries(['cart']);
  }
});
```

### Server-Sent Events (AI Streaming)

```
Client                    Server
  │                          │
  ├──── GET /api/ai/stream ─▶│
  │                          │
  │                          ├─ Start generation
  │                          │
  │◀── event: start ─────────┤
  │                          │
  │◀── event: progress ──────┤ "Premium"
  │                          │
  │◀── event: progress ──────┤ " T-Shirt"
  │                          │
  │◀── event: progress ──────┤ " made from"
  │                          │
  │◀── event: complete ──────┤
  │                          │
  └─ Display full content    │
```

```typescript
// Client-side SSE consumption
const eventSource = new EventSource('/api/ai/stream/generate?prompt=...');

eventSource.addEventListener('progress', (e) => {
  const data = JSON.parse(e.data);
  setContent(prev => prev + data.chunk);
});

eventSource.addEventListener('complete', (e) => {
  const data = JSON.parse(e.data);
  setIsComplete(true);
  eventSource.close();
});
```

## Database Design

### Schema Overview

```sql
-- Core Tables
users                    -- User accounts
categories               -- Product categories (hierarchical)
products                 -- Product catalog
cart_items               -- Shopping cart
orders                   -- Order records
order_items              -- Order line items

-- AI Features
brand_voices             -- Brand voice profiles
product_concepts         -- AI-generated concepts
campaigns                -- Marketing campaigns
content_library          -- Generated content

-- Auth & Sessions
sessions                 -- Session store (connect-pg-simple)
password_reset_tokens    -- Password reset tokens
```

### Entity Relationships

```
users (1) ──────── (∞) orders
  │                      │
  │                      │
  │                      └── (∞) order_items ──── (1) products
  │                                                     │
  │                                                     │
  ├── (∞) cart_items ──────────────────────────────────┘
  │
  ├── (∞) brand_voices
  │
  ├── (∞) product_concepts
  │
  └── (∞) campaigns

categories (1) ──── (∞) categories (self-referential)
categories (1) ──── (∞) products
```

### Key Database Patterns

**Soft Deletes:**
```typescript
// products table includes deleted_at
const activeProducts = await db
  .select()
  .from(products)
  .where(isNull(products.deletedAt));
```

**Timestamps:**
```typescript
// All tables include created_at and updated_at
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  // ... other fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
```

**Session Storage:**
```typescript
// PostgreSQL-backed sessions via connect-pg-simple
app.use(session({
  store: new pgSession({
    pool: db,
    tableName: 'sessions'
  }),
  // ... config
}));
```

## API Design

### RESTful Principles

**Resource-Based URLs:**
```
GET    /api/products      # List products
GET    /api/products/:id  # Get single product
POST   /api/products      # Create product
PATCH  /api/products/:id  # Update product
DELETE /api/products/:id  # Delete product
```

**HTTP Methods:**
- `GET` - Retrieve resources (idempotent, safe)
- `POST` - Create resources (non-idempotent)
- `PATCH` - Partial update (idempotent)
- `PUT` - Full replacement (idempotent, not used)
- `DELETE` - Remove resource (idempotent)

**Status Codes:**
```
200 OK              # Successful GET, PATCH
201 Created         # Successful POST
204 No Content      # Successful DELETE
400 Bad Request     # Validation error
401 Unauthorized    # Not authenticated
403 Forbidden       # Not authorized
404 Not Found       # Resource doesn't exist
409 Conflict        # Resource already exists
500 Server Error    # Internal error
```

### Input Validation

```typescript
// Zod schema for validation
const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000),
  price: z.string().regex(/^\d+\.\d{2}$/),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()),
  categoryId: z.number().int().positive()
});

// Express route with validation
app.post('/api/products', async (req, res) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await storage.createProduct(data);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

## Security Architecture

### Defense in Depth

**Layer 1: Network**
- HTTPS/TLS encryption
- CORS policy
- Rate limiting (planned)

**Layer 2: Application**
- Input validation (Zod)
- Output encoding (React)
- CSRF protection (SameSite cookies)
- XSS prevention (CSP headers planned)

**Layer 3: Authentication**
- Bcrypt password hashing (12 rounds)
- Session-based auth
- HTTP-only cookies
- Secure & SameSite flags

**Layer 4: Authorization**
- User-based resource access
- Protected routes
- API endpoint guards

**Layer 5: Data**
- Parameterized queries (Drizzle ORM)
- Encrypted connections (SSL)
- No sensitive data in logs

### Authentication Flow

```
Registration:
User → Hash Password → Store in DB → Create Session → Set Cookie

Login:
User → Verify Password → Create Session → Set Cookie

Authenticated Request:
Cookie → Validate Session → Load User → Process Request

Logout:
Destroy Session → Clear Cookie
```

## Performance Optimization

### Frontend Optimization

**Code Splitting:**
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/dashboard'));
const Products = lazy(() => import('./pages/products'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/dashboard" component={Dashboard} />
</Suspense>
```

**Asset Optimization:**
- Vite tree shaking
- Minification
- Gzip compression
- Image optimization

**Caching Strategy:**
```typescript
// Service Worker caching
// Cache-first for static assets
// Network-first for API calls
```

### Backend Optimization

**Database Optimization:**
```typescript
// Index frequently queried fields
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id)
}, (table) => ({
  categoryIdx: index('category_idx').on(table.categoryId),
  nameIdx: index('name_idx').on(table.name)
}));
```

**Query Optimization:**
```typescript
// Fetch related data in single query
const orders = await db
  .select()
  .from(orders)
  .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
  .leftJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orders.userId, userId));
```

**Connection Pooling:**
```typescript
// PostgreSQL connection pool
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

## Design Decisions

### Why React over Vue/Svelte?

**Reasons:**
- Largest ecosystem and community
- Excellent TypeScript support
- Mature tooling (Vite, TanStack Query)
- Extensive component libraries (Radix UI, Shadcn)
- Team familiarity

### Why Express over NestJS/Fastify?

**Reasons:**
- Simplicity and flexibility
- Minimal boilerplate
- Large ecosystem of middleware
- Easy to understand and maintain
- Sufficient for current scale

### Why Drizzle over Prisma/TypeORM?

**Reasons:**
- Lightweight and fast
- SQL-like syntax
- Type-safe without code generation
- Better control over queries
- No schema drift issues

### Why Session-based Auth over JWT?

**Reasons:**
- Better security (HTTP-only cookies)
- Easier revocation
- Simpler implementation
- No token expiration handling on client
- Suitable for web application

### Why PostgreSQL over MongoDB?

**Reasons:**
- ACID compliance
- Relational data model fits use case
- Strong consistency guarantees
- Excellent query capabilities
- Better for e-commerce transactions

## Future Architecture

### Planned Improvements (v2.3+)

**Microservices (Optional):**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   API       │  │   Auth      │  │   AI        │
│  Gateway    │──│   Service   │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
       │
       ├──────┬──────────┬──────────┬──────────┐
       │      │          │          │          │
  ┌────▼───┐ │     ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
  │Products│ │     │ Orders │ │  Cart  │ │Campaign│
  │Service │ │     │Service │ │Service │ │Service │
  └────────┘ │     └────────┘ └────────┘ └────────┘
```

**Message Queue:**
```
App → Queue (Redis/RabbitMQ) → Workers
                               ├─ Email Worker
                               ├─ AI Worker
                               └─ Integration Worker
```

**Caching Layer:**
```
Request → Cache (Redis) ─┬─ HIT → Return cached data
                         └─ MISS → Database → Cache → Return
```

**CDN Integration:**
```
Static Assets → CDN (CloudFlare/CloudFront)
Images → Image CDN (Cloudinary/ImageKit)
```

---

**Last Updated:** January 2026

**Version:** 2.2.0
