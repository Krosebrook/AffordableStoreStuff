# AffordableStoreStuff

A full-stack mobile commerce platform built with Expo/React Native and Node.js/Express, designed for managing product listings, AI-powered content generation, and multi-marketplace publishing.

## Architecture

```
Mobile App (Expo / React Native)
    ↓ HTTPS
Vercel (Express API — serverless functions)
    ↓ PostgreSQL (pooled connection)
Supabase (Database)
```

## Tech Stack

- **Frontend**: Expo SDK 54, React Native, Expo Router, React Query
- **Backend**: Express 5, Node.js, TypeScript
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **AI**: OpenAI API (content generation, listing optimization)
- **Hosting**: Vercel (API), EAS (mobile builds)
- **Payments**: Stripe (subscription billing)

## Project Structure

```
├── app/                  # Expo Router screens & layouts
├── api/                  # Vercel serverless entry point
├── components/           # React Native UI components
├── hooks/                # Custom React hooks
├── lib/                  # Client-side utilities
├── server/               # Express API server
│   ├── index.ts          # App setup & initialization
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Database access layer
│   ├── db.ts             # PostgreSQL connection
│   ├── objectStorage.ts  # Google Cloud Storage integration
│   └── publishPipeline.ts # AI-powered listing generation
├── shared/
│   └── schema.ts         # Drizzle ORM schema (shared types)
├── vercel.json           # Vercel deployment config
├── eas.json              # EAS Build configuration
└── app.json              # Expo app configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Expo CLI (`npx expo`)
- EAS CLI (`npm i -g eas-cli`)
- Vercel CLI (`npm i -g vercel`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **connection pooler** URL (Transaction mode, port 6543)
3. Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

4. Push the schema:

```bash
node --env-file=.env ./node_modules/.bin/drizzle-kit push
```

### 3. Run Locally

Start the API server:
```bash
node --env-file=.env npx tsx server/index.ts
```

Start the Expo dev server (in another terminal):
```bash
npx expo start
```

### 4. Deploy API to Vercel

```bash
vercel login
vercel          # first deploy
vercel --prod   # promote to production
```

Set environment variables in Vercel dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase pooler connection string |
| `NODE_ENV` | Yes | Set to `production` |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | For AI features | OpenAI API key |
| `AI_MODEL` | No | OpenAI model (defaults to `gpt-4o`) |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |

### 5. Build & Publish Mobile App

```bash
eas login
eas secret:create --name EXPO_PUBLIC_API_URL --value https://your-app.vercel.app
eas build --platform android --profile production
eas submit --platform android --profile production
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a product |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/ai/generate-listing` | AI-generate listing content |
| POST | `/api/ai/optimize-listing` | AI-optimize existing listing |
| GET | `/api/marketplace-listings` | List marketplace listings |
| POST | `/api/billing/checkout` | Create checkout session |

## Environment Variables

All sensitive values belong in `.env` (local) or Vercel dashboard (production). Never commit secrets.

## License

Private — All rights reserved.
