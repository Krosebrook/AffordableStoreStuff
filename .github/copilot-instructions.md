# FlashFusion v3.0 - GitHub Copilot Instructions

## Project Overview

FlashFusion is a full-stack AI-powered e-commerce platform with print-on-demand automation. Built with React 18, TypeScript 5.6, Express 5, and PostgreSQL.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 7, Tailwind CSS, Shadcn/UI
- **Backend**: Express 5, Node.js 18+
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query v5
- **Authentication**: Session-based (express-session) + Replit OAuth
- **AI**: OpenAI SDK (GPT-4o, DALL-E 3)
- **Payments**: Stripe
- **Testing**: Vitest (unit), Playwright (E2E)

## Build & Run Commands

```bash
# Install dependencies
npm install

# Development
npm run dev          # Start dev server on port 5000

# Type checking
npm run check        # TypeScript type check

# Database
npm run db:push      # Push schema changes (dev)
npm run db:generate  # Generate migration
npm run db:migrate   # Apply migration

# Testing
npx vitest run       # Run unit tests
npx playwright test  # Run E2E tests

# Production
npm run build        # Build for production
npm start            # Start production server
```

## Code Style

### File Naming
- Use **kebab-case** for all file names
- `product-routes.ts`, `ai-service.ts`, `use-auth.ts`

### Import Organization
```typescript
// 1. External packages
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal absolute (@/* aliases)
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

// 3. Relative imports
import { apiRequest } from "./lib/queryClient";
```

### Naming Conventions
- Variables/functions: camelCase
- Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Database columns: snake_case (in DB), camelCase (in code)

### TypeScript
- **Strict mode enabled** - no implicit `any`
- Import types: `import type { Product } from "@shared/schema";`
- Always import types from `@shared/schema` for consistency
- No `@ts-ignore` - fix type errors properly

## Architecture Patterns

### API Routes
- Location: `server/routes/{resource}-routes.ts`
- Always use try-catch for error handling
- Validate inputs with Zod schemas
- Check authentication with `requireAuth` middleware
- Check authorization before modifications

```typescript
router.post("/", requireAuth, validateBody(schema), async (req, res) => {
  try {
    const data = await storage.createResource(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Operation failed" });
  }
});
```

### Database Schema
- All schemas in: `shared/schema.ts`
- Use Drizzle ORM for all database operations
- Never query database directly in routes - use storage layer
- Export Zod schema and TypeScript types for each table

```typescript
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
```

### React Components
- Location: `client/src/components/{component-name}.tsx`
- Use Shadcn/UI components from `@/components/ui/`
- Use TanStack Query for data fetching
- Add `data-testid` attributes for E2E testing

```typescript
export function Component({ title }: { title: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["resource"],
    queryFn: () => fetch("/api/resource").then(r => r.json()),
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  return <div data-testid="component">{title}</div>;
}
```

### State Management
- **Server state**: Use TanStack Query (not useState)
- **UI state**: Use useState/useReducer
- Query keys should be descriptive arrays
- Invalidate queries after mutations

```typescript
const { mutate } = useMutation({
  mutationFn: (data) => fetch("/api/resource", { method: "POST", body: JSON.stringify(data) }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["resources"] });
  },
});
```

## Security Requirements

1. **Authentication**: All protected routes must use `requireAuth` middleware
2. **Password Hashing**: Use bcrypt with 12 rounds (SALT_ROUNDS constant)
3. **Input Validation**: Validate all inputs with Zod schemas
4. **Resource Ownership**: Check ownership before update/delete
5. **Rate Limiting**: Applied globally, stricter on auth endpoints
6. **CORS**: Exact origin matching (not startsWith)
7. **No Secrets in Code**: Use environment variables
8. **Sanitize Logs**: Never log passwords, tokens, or sensitive data

## Testing Requirements

### Unit Tests (Vitest)
- Location: `tests/unit/server/{module}/{file}.test.ts`
- Mock dependencies: `vi.mock("../../../../server/storage")`
- Always use `beforeEach` to reset mocks
- Test happy path, error cases, and edge cases

### E2E Tests (Playwright)
- Location: `e2e/{feature}.spec.ts`
- Use `data-testid` attributes for element selection
- Test complete user workflows
- Wait for navigation and network events (not arbitrary timeouts)

## Common Patterns

### Error Handling
```typescript
// Server-side
try {
  const result = await operation();
  res.json(result);
} catch (error) {
  console.error("Error description:", error);
  res.status(500).json({ message: "User-friendly message" });
}

// Client-side
const { data, error } = useQuery({ ... });
if (error) return <ErrorMessage />;
```

### AI Integration
- Use OpenAI SDK for GPT-4o (not gpt-3.5-turbo)
- Implement streaming with SSE for better UX
- Track token usage and costs
- Cache repetitive prompts
- Rate limit AI endpoints

### Forms
- Use React Hook Form + Zod for validation
- Use `zodResolver` for integration
- Show validation errors inline

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - 32+ characters (production)
- `NODE_ENV` - development/production/test

### Optional
- `OPENAI_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payments
- `RESEND_API_KEY` - For emails
- `ALLOWED_ORIGINS` - CORS (required in production)

## Don't

❌ Query database directly in routes (use storage layer)
❌ Use `any` type without justification
❌ Skip authentication on protected routes
❌ Hardcode secrets or API keys
❌ Use inline styles (use Tailwind)
❌ Import from `dist/` directory
❌ Use PascalCase for file names
❌ Fetch data in useEffect (use TanStack Query)
❌ Store server data in useState
❌ Skip error handling

## Do

✅ Use path aliases (@/* and @shared/*)
✅ Type check with `npm run check`
✅ Test changes before committing
✅ Follow existing patterns in the codebase
✅ Add data-testid for testable UI elements
✅ Validate all user inputs
✅ Check resource ownership before modifications
✅ Invalidate queries after mutations
✅ Log errors with console.error

## Custom Agents
Use specialized agents for complex tasks:
- `@ai-integration`: For OpenAI and streaming logic.
- `@database-drizzle`: For schema and storage layer changes.
- `@safeguards-validator`: For trademark and moderation logic.
- `@publishing-pod`: For Printify/Etsy integrations and image processing.
- `@ui-component-builder`: For Shadcn/UI and Tailwind components.
- `@api-endpoint-builder`: For Express 5 routes and Zod validation.
- `@unit-test-writer`: For Vitest server-side tests.
- `@e2e-test-writer`: For Playwright browser tests.
- `@state-management`: For TanStack Query patterns.
- `@pr-description`: For generating standardized PR summaries.
✅ Return user-friendly error messages

## Custom Agents Available

FlashFusion has 10+ specialized coding agents in `.github/agents/`:
- `unit-test-writer` - Write Vitest unit tests
- `e2e-test-writer` - Write Playwright E2E tests
- `test-fixer` - Debug and fix failing tests
- `type-safety-enforcer` - Strengthen TypeScript types
- `code-style-enforcer` - Enforce code conventions
- `api-endpoint-builder` - Create Express API endpoints
- `database-migration-agent` - Manage Drizzle schema changes
- `ui-component-builder` - Build React components with Shadcn/UI
- `state-management-agent` - Implement TanStack Query patterns
- `ai-integration-agent` - Integrate OpenAI features
- `auth-security-agent` - Implement auth and security
- `ci-cd-agent` - Manage GitHub Actions workflows

Refer to these agents for detailed guidance on specific tasks.
