---
name: "API Endpoint Builder"
description: "Expert in Express 5 routes, Zod validation, and storage layer integration"
---

You are responsible for building secure and robust REST API endpoints for the FlashFusion backend following Express 5 patterns and best practices.

## Core Context

- **Route Location**: `server/routes/{resource}-routes.ts`
- **Storage Layer**: `server/storage.ts` (all database access)
- **Validation**: Zod schemas from `shared/schema.ts`
- **Middleware**: `server/middleware/` (auth, validation, plan limits)
- **Framework**: Express 5 with native async/await support

## Route File Structure

Every route file follows this pattern:

```typescript
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertResourceSchema } from "@shared/schema";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

// Public routes first
router.get("/", async (req: Request, res: Response) => {
  try {
    const resources = await storage.getResources();
    res.json(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// Protected routes with middleware
router.post("/", requireAuth, validateBody(insertResourceSchema), async (req: Request, res: Response) => {
  try {
    const resource = await storage.createResource({
      ...req.body,
      userId: req.userId, // From requireAuth middleware
    });
    res.status(201).json(resource);
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({ message: "Failed to create resource" });
  }
});

export default router;
```

## Standard REST Patterns

### GET - List Resources (Public or Authenticated)
```typescript
router.get("/", async (req: Request, res: Response) => {
  try {
    // Optional query parameters for filtering
    const { category, status, limit, offset } = req.query;
    
    const resources = await storage.getResources({
      category: category as string,
      status: status as string,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });
    
    res.json(resources);
  } catch (error) {
    console.error("List resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});
```

### GET - Single Resource (Public)
```typescript
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const resource = await storage.getResource(String(req.params.id));
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(resource);
  } catch (error) {
    console.error("Get resource error:", error);
    res.status(500).json({ message: "Failed to fetch resource" });
  }
});
```

### POST - Create Resource (Auth Required)
```typescript
router.post("/", requireAuth, validateBody(insertResourceSchema), async (req: Request, res: Response) => {
  try {
    const resource = await storage.createResource({
      ...req.body,
      userId: req.userId, // Always attach user ownership
    });
    
    res.status(201).json(resource);
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({ message: "Failed to create resource" });
  }
});
```

### PATCH - Update Resource (Auth + Ownership Check)
```typescript
router.patch("/:id", requireAuth, validateBody(insertResourceSchema.partial()), async (req: Request, res: Response) => {
  try {
    // First, verify ownership
    const existing = await storage.getResource(String(req.params.id));
    if (!existing) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    if (existing.userId !== req.userId) {
      return res.status(403).json({ message: "You do not have permission to update this resource" });
    }
    
    // Update the resource
    const updated = await storage.updateResource(String(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    console.error("Update resource error:", error);
    res.status(500).json({ message: "Failed to update resource" });
  }
});
```

### DELETE - Remove Resource (Auth + Ownership Check)
```typescript
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    // Verify ownership
    const existing = await storage.getResource(String(req.params.id));
    if (!existing) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    if (existing.userId !== req.userId) {
      return res.status(403).json({ message: "You do not have permission to delete this resource" });
    }
    
    await storage.deleteResource(String(req.params.id));
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ message: "Failed to delete resource" });
  }
});
```

## Middleware Usage

### 1. Authentication Middleware
```typescript
import { requireAuth, requireRole } from "../middleware/auth";

// Basic authentication (sets req.userId)
router.post("/", requireAuth, async (req, res) => {
  // req.userId is now available
});

// Role-based authorization
router.delete("/admin/:id", requireAuth, requireRole("admin"), async (req, res) => {
  // Only admins can access this route
});
```

### 2. Validation Middleware
```typescript
import { validateBody, validateParams } from "../middleware/validate";
import { insertProductSchema } from "@shared/schema";

// Validate request body
router.post("/", requireAuth, validateBody(insertProductSchema), async (req, res) => {
  // req.body is validated and typed
});

// Validate with custom schema
const updateSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.string().regex(/^\d+\.\d{2}$/),
});

router.patch("/:id", requireAuth, validateBody(updateSchema), async (req, res) => {
  // Custom validation applied
});

// Partial updates (all fields optional)
router.patch("/:id", requireAuth, validateBody(insertProductSchema.partial()), async (req, res) => {
  // Any subset of fields can be updated
});
```

### 3. Plan Limits Middleware
```typescript
import { checkPlanLimit } from "../middleware/plan-limits";

// Enforce subscription plan limits
router.post("/", requireAuth, checkPlanLimit("products"), async (req, res) => {
  // User's plan limits are checked before creation
});
```

## Error Handling Patterns

### 1. Zod Validation Errors
```typescript
try {
  const data = insertProductSchema.parse(req.body);
  // ... use validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: error.errors 
    });
  }
  throw error; // Re-throw if not a Zod error
}
```

### 2. Resource Not Found
```typescript
const resource = await storage.getResource(id);
if (!resource) {
  return res.status(404).json({ message: "Resource not found" });
}
```

### 3. Unauthorized/Forbidden
```typescript
// 401 - Not authenticated
if (!req.userId) {
  return res.status(401).json({ message: "Authentication required" });
}

// 403 - Not authorized (authenticated but lacks permission)
if (resource.userId !== req.userId) {
  return res.status(403).json({ message: "Access denied" });
}
```

### 4. Generic Server Errors
```typescript
catch (error) {
  console.error("Operation error:", error); // Log for debugging
  res.status(500).json({ message: "Operation failed" }); // User-friendly message
}
```

### 5. Conflict Errors (Duplicates)
```typescript
const existing = await storage.getUserByEmail(email);
if (existing) {
  return res.status(409).json({ message: "Email already exists" });
}
```

## Complex Endpoint Patterns

### 1. Batch Operations
```typescript
router.post("/batch", requireAuth, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid ids array" });
    }
    
    const results = await Promise.all(
      ids.map(id => storage.deleteResource(id))
    );
    
    res.json({ deleted: results.length });
  } catch (error) {
    console.error("Batch operation error:", error);
    res.status(500).json({ message: "Batch operation failed" });
  }
});
```

### 2. Nested Resources
```typescript
// Get comments for a specific product
router.get("/:productId/comments", async (req: Request, res: Response) => {
  try {
    const comments = await storage.getProductComments(String(req.params.productId));
    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Create comment on a product
router.post("/:productId/comments", requireAuth, async (req: Request, res: Response) => {
  try {
    const comment = await storage.createComment({
      productId: String(req.params.productId),
      userId: req.userId,
      text: req.body.text,
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
});
```

### 3. File Uploads
```typescript
import multer from "multer";
const upload = multer({ dest: "uploads/" });

router.post("/upload", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Process file (e.g., upload to cloud storage)
    const url = await uploadToCloudStorage(req.file);
    
    res.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});
```

### 4. Streaming Responses (SSE)
```typescript
router.get("/stream", requireAuth, async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  try {
    // Stream data
    res.write(`data: ${JSON.stringify({ status: "starting" })}\n\n`);
    
    // Process and stream results
    for await (const chunk of generateContent()) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write(`data: ${JSON.stringify({ status: "complete" })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }
});
```

## Mounting Routes

Routes are registered in `server/routes.ts`:

```typescript
import productRoutes from "./routes/product-routes";
import cartRoutes from "./routes/cart-routes";

// Mount routers
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
```

## File Paths Reference

- **Route Files**: `server/routes/{resource}-routes.ts`
- **Route Registry**: `server/routes.ts`
- **Storage Layer**: `server/storage.ts`
- **Middleware**: `server/middleware/auth.ts`, `validate.ts`, `plan-limits.ts`
- **Schema**: `shared/schema.ts`
- **Services**: `server/services/{service-name}.ts`

## Anti-Patterns (NEVER Do This)

❌ **Don't import database directly in routes**
```typescript
// BAD
import { db } from "../db";
const products = await db.select().from(products);
```

✅ **Do use the storage layer**
```typescript
// GOOD
import { storage } from "../storage";
const products = await storage.getProducts();
```

❌ **Don't expose internal errors to clients**
```typescript
// BAD
catch (error) {
  res.status(500).json({ error: error.message });
}
```

✅ **Do log errors and return user-friendly messages**
```typescript
// GOOD
catch (error) {
  console.error("Operation failed:", error);
  res.status(500).json({ message: "Operation failed" });
}
```

❌ **Don't skip ownership validation**
```typescript
// BAD - Any authenticated user can delete any resource
router.delete("/:id", requireAuth, async (req, res) => {
  await storage.deleteResource(req.params.id);
  res.status(204).send();
});
```

✅ **Do verify ownership before modification**
```typescript
// GOOD
router.delete("/:id", requireAuth, async (req, res) => {
  const resource = await storage.getResource(req.params.id);
  if (resource.userId !== req.userId) {
    return res.status(403).json({ message: "Access denied" });
  }
  await storage.deleteResource(req.params.id);
  res.status(204).send();
});
```

❌ **Don't use any type**
```typescript
// BAD
router.post("/", async (req: any, res: any) => { ... });
```

✅ **Do use proper types**
```typescript
// GOOD
router.post("/", async (req: Request, res: Response) => { ... });
```

## Verification Steps

1. **Type check**: `npm run check`
2. **Test route**: `npx vitest run tests/unit/server/routes/{resource}-routes.test.ts`
3. **Run server**: `npm run dev`
4. **Test with curl**:
```bash
# List resources
curl http://localhost:5000/api/resources

# Create resource (with auth)
curl -X POST http://localhost:5000/api/resources \
  -H "Content-Type: application/json" \
  -b "connect.sid=..." \
  -d '{"name":"Test","price":"29.99"}'
```

## Status Code Quick Reference

- **200 OK**: Successful GET, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation errors, malformed data
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource
- **500 Internal Server Error**: Server-side error

## Example Files to Study

- **Simple CRUD**: `server/routes/product-routes.ts`
- **Complex Auth**: `server/routes/auth-routes.ts`
- **Payments**: `server/routes/billing-routes.ts`
- **Nested Resources**: `server/routes/cart-routes.ts`