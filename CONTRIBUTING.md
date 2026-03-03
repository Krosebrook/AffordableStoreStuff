# Contributing to AffordableStoreStuff

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your values
3. Install dependencies: `npm install`
4. Push database schema: `node --env-file=.env ./node_modules/.bin/drizzle-kit push`
5. Start the API server: `npm run server:dev`
6. Start the Expo app: `npm run dev`

## Development Workflow

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `refactor/description` — Code refactoring

### Commit Messages

Use clear, imperative mood commit messages:

```
Add product image upload endpoint
Fix CORS header for mobile requests
Update README with deployment steps
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `npm run lint` passes with no errors
4. Test locally against both the API server and Expo app
5. Open a PR with:
   - Summary of changes
   - Screenshots (for UI changes)
   - Test plan describing how to verify
6. Request a review

### Code Style

- TypeScript strict mode is enforced
- ESLint is configured via `eslint.config.js` — run `npm run lint`
- Use functional components and hooks in React Native
- Use async/await over raw promises
- Prefer named exports over default exports (except where frameworks require it)

## Project Structure

```
app/          → Expo Router screens (file-based routing)
components/   → Reusable React Native components
hooks/        → Custom React hooks
lib/          → Client-side utilities (API client, query config)
server/       → Express API backend
  routes.ts   → All API route handlers
  storage.ts  → Database access layer (Drizzle ORM)
  db.ts       → PostgreSQL connection pool
  services/   → Business logic (image generation, Stripe, publishing)
shared/       → Shared types and schema (used by both client and server)
```

## Adding a New API Endpoint

1. Add the route handler in `server/routes.ts`
2. Add any new storage methods in `server/storage.ts`
3. If the endpoint needs new tables, update `shared/schema.ts` and run `drizzle-kit push`
4. Add the client-side query/mutation in the relevant screen file

## Adding a New Screen

1. Create the file in `app/` following Expo Router conventions
2. Add navigation in the appropriate layout (`app/(tabs)/_layout.tsx` or `app/(shop)/_layout.tsx`)
3. Use `apiRequest()` from `lib/query-client.ts` for API calls
4. Use React Query (`useQuery`/`useMutation`) for data fetching

## Environment Variables

See `.env.example` for all available variables and their descriptions.

Never commit real credentials. Use Vercel dashboard or EAS secrets for production values.
