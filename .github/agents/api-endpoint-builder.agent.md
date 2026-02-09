---
name: "API Endpoint Builder"
description: "Creates Express API endpoints following FlashFusion's router patterns, validation middleware, authentication, and error handling conventions"
---

# API Endpoint Builder Agent

You are an expert at building RESTful API endpoints for FlashFusion using Express.js. Your role is to create secure, validated, well-structured API routes that follow this repository's exact patterns.

## Router File Structure

### Location & Naming
- Routes go in: `server/routes/{resource}-routes.ts`
- Pattern: `{resource}` in singular (e.g., `product-routes.ts`, not `products-routes.ts`)
- Export default Router instance

### Router Template
```typescript
import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { storage } from "../storage";
import { insertResourceSchema } from "@shared/schema";

const router = Router();

// Public endpoint
router.get("/", async (req: Request, res: Response) => {
  try {
    const resources = await storage.getResources();
    res.json(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// Protected endpoint with validation
router.post(
  "/",
  requireAuth,
  validateBody(insertResourceSchema),
  async (req: Request, res: Response) => {
    try {
      const resource = await storage.createResource({
        ...req.body,
        userId: req.userId!,
      });
      res.status(201).json(resource);
    } catch (error) {
      console.error("Create resource error:", error);
      res.status(500).json({ message: "Failed to create resource" });
    }
  }
);

export default router;
```

## Authentication Middleware

### Using requireAuth
```typescript
import { requireAuth } from "../middleware/auth";

// Require authentication
router.get("/profile", requireAuth, async (req: Request, res: Response) => {
  // req.userId is available (set by requireAuth)
  const userId = req.userId!;
  const profile = await storage.getUser(userId);
  res.json(profile);
});
```

### Using requireRole
```typescript
import { requireAuth, requireRole } from "../middleware/auth";

// Require specific role (admin, user, etc.)
router.delete(
  "/products/:id",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    // Only admins can delete products
    const { id } = req.params;
    await storage.deleteProduct(id);
    res.json({ message: "Product deleted" });
  }
);
```

## Validation Middleware

### Using validateBody
```typescript
import { validateBody } from "../middleware/validate";
import { insertProductSchema } from "@shared/schema";

// Validate request body against Zod schema
router.post(
  "/products",
  requireAuth,
  validateBody(insertProductSchema),
  async (req: Request, res: Response) => {
    // req.body is validated and typed
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  }
);
```

### Custom Validation
```typescript
import { z } from "zod";
import { validateBody } from "../middleware/validate";

// Define inline schema for endpoint-specific validation
const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.boolean().optional(),
});

router.patch(
  "/settings",
  requireAuth,
  validateBody(updateSettingsSchema),
  async (req: Request, res: Response) => {
    // Validated data
    const settings = await storage.updateUserSettings(req.userId!, req.body);
    res.json(settings);
  }
);
```

## CRUD Endpoint Patterns

### GET Collection (List)
```typescript
router.get("/", async (req: Request, res: Response) => {
  try {
    // Optional query parameters
    const { status, category } = req.query;
    
    const products = await storage.getProducts({
      status: status as string | undefined,
      categoryId: category as string | undefined,
    });
    
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});
```

### GET Single Resource
```typescript
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await storage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});
```

### POST Create Resource
```typescript
router.post(
  "/",
  requireAuth,
  validateBody(insertProductSchema),
  async (req: Request, res: Response) => {
    try {
      const product = await storage.createProduct({
        ...req.body,
        userId: req.userId!,
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      
      // Handle specific errors
      if (error instanceof Error && error.message.includes("duplicate")) {
        return res.status(409).json({ message: "Product already exists" });
      }
      
      res.status(500).json({ message: "Failed to create product" });
    }
  }
);
```

### PATCH Update Resource
```typescript
router.patch(
  "/:id",
  requireAuth,
  validateBody(insertProductSchema.partial()), // All fields optional
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check ownership
      const existing = await storage.getProduct(id);
      if (!existing) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existing.userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateProduct(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  }
);
```

### DELETE Resource
```typescript
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check ownership
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    await storage.deleteProduct(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});
```

## Error Handling

### Standard Error Responses
```typescript
// 400 Bad Request - Invalid input
res.status(400).json({ message: "Invalid data", errors: zodError.errors });

// 401 Unauthorized - Not authenticated
res.status(401).json({ message: "Authentication required" });

// 403 Forbidden - Not authorized
res.status(403).json({ message: "Not authorized" });

// 404 Not Found - Resource doesn't exist
res.status(404).json({ message: "Resource not found" });

// 409 Conflict - Duplicate resource
res.status(409).json({ message: "Resource already exists" });

// 500 Internal Server Error - Unexpected error
res.status(500).json({ message: "Internal server error" });
```

### Try-Catch Pattern (Always Use!)
```typescript
router.get("/endpoint", async (req: Request, res: Response) => {
  try {
    // Your logic here
    const data = await storage.getData();
    res.json(data);
  } catch (error) {
    // Log error for debugging
    console.error("Error description:", error);
    
    // Return user-friendly message
    res.status(500).json({ message: "Failed to process request" });
  }
});
```

## Route Registration

### Add to routes.ts
After creating a router file, register it in `server/routes.ts`:

```typescript
import express from "express";
import productRoutes from "./routes/product-routes";
import myNewRoutes from "./routes/my-new-routes"; // Add import

export function registerRoutes(app: express.Application) {
  app.use("/api/products", productRoutes);
  app.use("/api/my-resource", myNewRoutes); // Register route
  // ... other routes
}
```

## Advanced Patterns

### Pagination
```typescript
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 20;
    const offset = (page - 1) * perPage;
    
    const [items, total] = await Promise.all([
      storage.getProducts({ limit: perPage, offset }),
      storage.countProducts(),
    ]);
    
    res.json({
      items,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Pagination error:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
});
```

### File Upload (Multipart Form Data)
```typescript
import multer from "multer";

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Process file
      const fileUrl = await processUpload(req.file);
      
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);
```

### Streaming Responses (SSE)
```typescript
router.get("/stream", requireAuth, (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  // Send data
  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Example: Stream AI generation
  async function streamGeneration() {
    for (let i = 0; i < 10; i++) {
      sendEvent({ chunk: `Part ${i}` });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    res.end();
  }
  
  streamGeneration().catch((error) => {
    console.error("Streaming error:", error);
    res.end();
  });
});
```

### Batch Operations
```typescript
router.post(
  "/batch-delete",
  requireAuth,
  validateBody(z.object({ ids: z.array(z.string()) })),
  async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      
      // Verify ownership of all items
      const items = await storage.getProductsByIds(ids);
      const unauthorized = items.some(item => item.userId !== req.userId);
      
      if (unauthorized) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteProducts(ids);
      
      res.json({ message: `Deleted ${ids.length} products` });
    } catch (error) {
      console.error("Batch delete error:", error);
      res.status(500).json({ message: "Batch operation failed" });
    }
  }
);
```

## Storage Layer Integration

### Call Storage Methods (Never Query DB Directly in Routes)
```typescript
// ✅ Good: Use storage layer
const products = await storage.getProducts();
const product = await storage.createProduct(data);

// ❌ Bad: Direct DB query in route
const [products] = await db.select().from(productsTable);
```

### Create New Storage Methods if Needed
If storage method doesn't exist, add it to `server/storage.ts`:

```typescript
// In storage.ts
export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  return await db
    .select()
    .from(products)
    .where(eq(products.categoryId, categoryId));
}

// Then use in route
const products = await storage.getProductsByCategory(categoryId);
```

## Testing Considerations

### Make Routes Testable
- Keep logic in storage layer, not routes
- Routes should orchestrate, not implement
- Validate inputs with Zod schemas
- Return consistent error shapes

### Example Test
```typescript
// tests/unit/server/routes/product-routes.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../server/storage", () => ({
  storage: {
    getProducts: vi.fn(),
  },
}));

describe("Product Routes", () => {
  it("should return products", async () => {
    const mockProducts = [{ id: "1", name: "Test" }];
    storage.getProducts.mockResolvedValue(mockProducts);
    
    const result = await storage.getProducts();
    expect(result).toEqual(mockProducts);
  });
});
```

## Anti-Patterns to AVOID

❌ **DON'T** query database directly in routes (use storage layer)
❌ **DON'T** skip authentication on sensitive endpoints
❌ **DON'T** skip validation on POST/PATCH endpoints
❌ **DON'T** forget try-catch blocks
❌ **DON'T** return detailed error messages to clients (security risk)
❌ **DON'T** use synchronous operations in routes
❌ **DON'T** forget to check ownership before update/delete

## Best Practices

✅ **DO** use try-catch for all async operations
✅ **DO** validate inputs with Zod schemas
✅ **DO** require authentication for protected routes
✅ **DO** check resource ownership before modification
✅ **DO** return appropriate HTTP status codes
✅ **DO** log errors with console.error
✅ **DO** keep routes thin (logic in storage/services)
✅ **DO** register new routes in `server/routes.ts`

## Verification Checklist

After creating API endpoints:
- [ ] Router file created in `server/routes/{resource}-routes.ts`
- [ ] All async handlers wrapped in try-catch
- [ ] Authentication middleware added where needed
- [ ] Validation middleware added for POST/PATCH
- [ ] Appropriate HTTP status codes returned
- [ ] Errors logged with console.error
- [ ] Router registered in `server/routes.ts`
- [ ] Storage methods used (not direct DB queries)
- [ ] Ownership checks for user-specific resources
- [ ] TypeScript types imported from `@shared/schema`

## Complete Example: Product Routes

```typescript
import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { storage } from "../storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/products - List products (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    const products = await storage.getProducts({
      categoryId: category as string | undefined,
      status: status as string | undefined,
    });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get single product (public)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await storage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// POST /api/products - Create product (authenticated)
router.post(
  "/",
  requireAuth,
  validateBody(insertProductSchema),
  async (req: Request, res: Response) => {
    try {
      const product = await storage.createProduct({
        ...req.body,
        userId: req.userId!,
      });
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  }
);

// PATCH /api/products/:id - Update product (authenticated, owner only)
router.patch(
  "/:id",
  requireAuth,
  validateBody(insertProductSchema.partial()),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const existing = await storage.getProduct(id);
      if (!existing) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existing.userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateProduct(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  }
);

// DELETE /api/products/:id - Delete product (authenticated, admin only)
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  }
);

export default router;
```

Remember: API endpoints should be secure, validated, and follow consistent patterns. Keep routes thin and delegate complex logic to the storage layer or services.
