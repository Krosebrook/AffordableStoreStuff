# API Documentation

Complete API reference for FlashFusion v2.2

## Base URL

```
Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication

FlashFusion uses session-based authentication with HTTP-only cookies.

### Authentication Flow

1. User logs in or registers
2. Server creates session and sets cookie
3. Client includes cookie automatically in subsequent requests
4. Server validates session for protected endpoints

### Session Cookie

```
Cookie Name: flashfusion.sid
HTTP Only: true
Secure: true (production)
SameSite: Lax
Max Age: 24 hours
```

## API Endpoints

### Authentication

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "user@example.com",
  "fullName": "John Doe",
  "createdAt": "2026-01-30T10:00:00.000Z"
}
```

**Validation Rules:**
- Username: Email format, max 255 characters
- Password: Min 8 characters
- Full Name: Max 255 characters

**Errors:**
- `400` - Validation error
- `409` - User already exists

---

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "user@example.com",
  "fullName": "John Doe"
}
```

**Errors:**
- `400` - Invalid credentials
- `401` - Authentication failed

---

#### Get Current User

```http
GET /api/auth/me
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "user@example.com",
  "fullName": "John Doe"
}
```

**Errors:**
- `401` - Not authenticated

---

#### Logout

```http
POST /api/auth/logout
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

**Note:** Always returns 200 even if email doesn't exist (security)

---

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

**Errors:**
- `400` - Invalid or expired token

---

#### Verify Reset Token

```http
GET /api/auth/verify-reset-token?token=reset-token
```

**Response (200 OK):**
```json
{
  "valid": true
}
```

**Response (400 Bad Request):**
```json
{
  "valid": false,
  "error": "Token expired"
}
```

---

### Products

#### List Products

```http
GET /api/products
```

**Query Parameters:**
- `category` (optional) - Filter by category ID
- `search` (optional) - Search in name and description
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter
- `limit` (optional) - Results per page (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Premium T-Shirt",
    "description": "High-quality cotton t-shirt",
    "price": "29.99",
    "stock": 100,
    "images": ["https://example.com/image1.jpg"],
    "categoryId": 1,
    "tags": ["clothing", "casual"],
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
]
```

---

#### Get Single Product

```http
GET /api/products/:id
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Premium T-Shirt",
  "description": "High-quality cotton t-shirt",
  "price": "29.99",
  "stock": 100,
  "images": ["https://example.com/image1.jpg"],
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Apparel",
    "slug": "apparel"
  },
  "tags": ["clothing", "casual"],
  "createdAt": "2026-01-30T10:00:00.000Z"
}
```

**Errors:**
- `404` - Product not found

---

#### Create Product

**Authentication Required**

```http
POST /api/products
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": "29.99",
  "stock": 100,
  "images": ["https://example.com/image.jpg"],
  "categoryId": 1,
  "tags": ["tag1", "tag2"]
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "name": "New Product",
  "description": "Product description",
  "price": "29.99",
  "stock": 100,
  "images": ["https://example.com/image.jpg"],
  "categoryId": 1,
  "tags": ["tag1", "tag2"],
  "createdAt": "2026-01-30T11:00:00.000Z"
}
```

**Validation:**
- Name: Required, max 200 characters
- Price: Required, positive number
- Stock: Required, non-negative integer
- Images: Array of URLs

**Errors:**
- `401` - Not authenticated
- `400` - Validation error

---

#### Update Product

**Authentication Required**

```http
PATCH /api/products/:id
Content-Type: application/json

{
  "price": "24.99",
  "stock": 95
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Premium T-Shirt",
  "price": "24.99",
  "stock": 95,
  ...
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Product not found
- `400` - Validation error

---

#### Delete Product

**Authentication Required**

```http
DELETE /api/products/:id
```

**Response (204 No Content)**

**Errors:**
- `401` - Not authenticated
- `404` - Product not found

---

### Categories

#### List Categories

```http
GET /api/categories
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Apparel",
    "slug": "apparel",
    "parentId": null,
    "children": [
      {
        "id": 2,
        "name": "T-Shirts",
        "slug": "t-shirts",
        "parentId": 1
      }
    ]
  }
]
```

---

#### Create Category

**Authentication Required**

```http
POST /api/categories
Content-Type: application/json

{
  "name": "New Category",
  "slug": "new-category",
  "parentId": null
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "New Category",
  "slug": "new-category",
  "parentId": null
}
```

---

### Shopping Cart

#### Get Cart

```http
GET /api/cart
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "productId": 1,
    "quantity": 2,
    "product": {
      "id": 1,
      "name": "Premium T-Shirt",
      "price": "29.99",
      "images": ["https://example.com/image.jpg"]
    }
  }
]
```

---

#### Add to Cart

```http
POST /api/cart
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "productId": 1,
  "quantity": 2
}
```

**Errors:**
- `400` - Invalid product or quantity
- `404` - Product not found

---

#### Update Cart Item

```http
PATCH /api/cart/:id
Content-Type: application/json

{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "productId": 1,
  "quantity": 3
}
```

**Errors:**
- `404` - Cart item not found
- `400` - Invalid quantity

---

#### Remove from Cart

```http
DELETE /api/cart/:id
```

**Response (204 No Content)**

**Errors:**
- `404` - Cart item not found

---

#### Clear Cart

```http
DELETE /api/cart
```

**Response (204 No Content)**

---

### Orders

#### List Orders

**Authentication Required**

```http
GET /api/orders
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "total": "59.98",
    "status": "pending",
    "shippingAddress": "123 Main St, City, State 12345",
    "billingAddress": "123 Main St, City, State 12345",
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
]
```

---

#### Get Order

**Authentication Required**

```http
GET /api/orders/:id
```

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "total": "59.98",
  "status": "pending",
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "123 Main St, City, State 12345",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": "29.99",
      "product": {
        "name": "Premium T-Shirt",
        "images": ["https://example.com/image.jpg"]
      }
    }
  ],
  "createdAt": "2026-01-30T10:00:00.000Z"
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Order not found

---

#### Create Order

**Authentication Required**

```http
POST /api/orders
Content-Type: application/json

{
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "123 Main St, City, State 12345"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "total": "59.98",
  "status": "pending",
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "123 Main St, City, State 12345",
  "items": [...],
  "createdAt": "2026-01-30T11:00:00.000Z"
}
```

**Note:** Creates order from current cart items and clears cart

**Errors:**
- `401` - Not authenticated
- `400` - Empty cart or invalid address

---

### AI Features

#### Brand Voices

##### List Brand Voices

**Authentication Required**

```http
GET /api/ai/brand-voices
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "Professional Tech",
    "tone": "professional",
    "guidelines": "Use technical terminology, be concise",
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
]
```

---

##### Create Brand Voice

**Authentication Required**

```http
POST /api/ai/brand-voices
Content-Type: application/json

{
  "name": "Casual Friendly",
  "tone": "casual",
  "guidelines": "Use conversational language, be approachable"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "userId": 1,
  "name": "Casual Friendly",
  "tone": "casual",
  "guidelines": "Use conversational language, be approachable",
  "createdAt": "2026-01-30T11:00:00.000Z"
}
```

---

#### Product Concepts

##### List Product Concepts

**Authentication Required**

```http
GET /api/ai/product-concepts
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "conceptData": {
      "niche": "sustainable fashion",
      "targetAudience": "eco-conscious millennials",
      "productIdeas": [...]
    },
    "status": "completed",
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
]
```

---

##### Generate Product Concept

**Authentication Required**

```http
POST /api/ai/product-concepts/generate
Content-Type: application/json

{
  "brandVoiceId": 1,
  "niche": "sustainable fashion",
  "targetAudience": "eco-conscious millennials",
  "productType": "clothing"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "conceptData": {
    "niche": "sustainable fashion",
    "targetAudience": "eco-conscious millennials",
    "productIdeas": [
      {
        "name": "Eco-Friendly T-Shirt",
        "description": "Made from 100% organic cotton...",
        "price": 29.99,
        "tags": ["sustainable", "organic"]
      }
    ]
  },
  "status": "completed"
}
```

**Errors:**
- `401` - Not authenticated
- `400` - Validation error
- `500` - AI service error

---

#### Campaigns

##### List Campaigns

**Authentication Required**

```http
GET /api/ai/campaigns
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "Spring Sale 2026",
    "type": "email",
    "status": "active",
    "generatedAssets": {
      "subject": "Spring Into Savings!",
      "body": "..."
    },
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
]
```

---

##### Create Campaign

**Authentication Required**

```http
POST /api/ai/campaigns
Content-Type: application/json

{
  "name": "Summer Sale 2026",
  "type": "social",
  "brandVoiceId": 1,
  "targetAudience": "young adults",
  "goal": "increase engagement"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "userId": 1,
  "name": "Summer Sale 2026",
  "type": "social",
  "status": "draft",
  "createdAt": "2026-01-30T11:00:00.000Z"
}
```

---

##### Generate Campaign Assets

**Authentication Required**

```http
POST /api/ai/campaigns/:id/generate-assets
Content-Type: application/json

{
  "platforms": ["facebook", "instagram", "twitter"]
}
```

**Response (200 OK):**
```json
{
  "campaignId": 1,
  "assets": {
    "facebook": {
      "post": "Check out our summer sale!",
      "image": "url-to-generated-image"
    },
    "instagram": {...},
    "twitter": {...}
  }
}
```

---

#### Streaming Generation

**Authentication Required**

Server-Sent Events endpoint for real-time AI content generation.

```http
GET /api/ai/stream/generate?prompt=Generate%20product%20description
Accept: text/event-stream
```

**Event Stream:**
```
event: start
data: {"status":"started"}

event: progress
data: {"chunk":"Premium"}

event: progress
data: {"chunk":" T-Shirt"}

event: progress
data: {"chunk":" made"}

event: complete
data: {"status":"completed","content":"Premium T-Shirt made..."}
```

**Event Types:**
- `start` - Generation started
- `progress` - Content chunk
- `complete` - Generation finished
- `error` - Error occurred

---

#### AI Health

```http
GET /api/ai/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "providers": {
    "openai": {
      "status": "operational",
      "latency": 245
    },
    "anthropic": {
      "status": "not_configured"
    }
  },
  "timestamp": "2026-01-30T10:00:00.000Z"
}
```

---

#### AI Metrics

**Authentication Required (Admin)**

```http
GET /api/ai/metrics
```

**Response (200 OK):**
```json
{
  "totalRequests": 1234,
  "successfulRequests": 1200,
  "failedRequests": 34,
  "averageLatency": 328,
  "errors": [
    {
      "provider": "openai",
      "error": "Rate limit exceeded",
      "count": 5,
      "lastOccurred": "2026-01-30T09:45:00.000Z"
    }
  ]
}
```

---

### Utility Endpoints

#### Seed Database

**Development Only**

```http
POST /api/seed
```

**Response (200 OK):**
```json
{
  "message": "Database seeded successfully",
  "created": {
    "users": 2,
    "categories": 5,
    "products": 20,
    "orders": 10
  }
}
```

**Note:** Only available in development mode

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

**Status:** Documented but not yet implemented

**Planned Limits:**
- `/api/auth/login` - 5 requests per 15 minutes
- `/api/auth/register` - 3 requests per hour
- `/api/ai/*` - 100 requests per hour
- Other endpoints - 100 requests per 15 minutes

**Headers (future):**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706607600
```

---

## Pagination

**Query Parameters:**
- `limit` - Results per page (default: 50, max: 100)
- `offset` - Number of results to skip (default: 0)

**Example:**
```http
GET /api/products?limit=20&offset=40
```

---

## Filtering & Sorting

### Products

```http
GET /api/products?category=1&minPrice=10&maxPrice=100&sort=price&order=asc
```

**Query Parameters:**
- `category` - Filter by category ID
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search query
- `sort` - Sort field (price, name, createdAt)
- `order` - Sort order (asc, desc)

---

## WebSocket API (Future)

**Planned for v2.3:**
- Real-time order updates
- Live inventory changes
- Collaborative features

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Authentication
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password'
  })
});

// Get products
const products = await fetch('/api/products')
  .then(res => res.json());

// Add to cart
await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    productId: 1,
    quantity: 2
  })
});
```

### Using with React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch products
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: () => fetch('/api/products').then(res => res.json())
});

// Add to cart
const addToCart = useMutation({
  mutationFn: (item: CartItem) =>
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(item)
    }).then(res => res.json()),
  onSuccess: () => {
    queryClient.invalidateQueries(['cart']);
  }
});
```

---

## Testing

### cURL Examples

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test123!","fullName":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"test@example.com","password":"Test123!"}'

# Get products (with session)
curl http://localhost:5000/api/products \
  -b cookies.txt

# Add to cart
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId":1,"quantity":2}'
```

---

## Changelog

### v2.2.0 (Current)
- Added password reset endpoints
- Added AI streaming generation
- Added campaign management
- Enhanced error responses

### v2.1.0
- Initial API release
- Basic CRUD operations
- Session authentication

---

**Need Help?**

- [GitHub Issues](https://github.com/Krosebrook/AffordableStoreStuff/issues)
- [Documentation](./DOCUMENTATION.md)
- [Examples](./examples/) (coming soon)

**Last Updated:** January 2026
