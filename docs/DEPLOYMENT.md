# Deployment Guide

## Prerequisites

- Node.js 20+
- npm
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- [EAS CLI](https://docs.expo.dev/eas/): `npm i -g eas-cli`
- Supabase account with a project created
- Google Play Developer account ($25 one-time fee)

## Part 1: Database (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Choose a region close to your users
3. Set and save your database password

### 2. Get Connection String
1. Go to **Settings > Database > Connection string > URI**
2. Select **Transaction mode** (port 6543) — this is the pooler URL
3. Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 3. Push Schema
```bash
# URL-encode special characters in password (! = %21, ? = %3F, @ = %40)
# Create .env with your DATABASE_URL, then:
node --env-file=.env ./node_modules/.bin/drizzle-kit push
```

### 4. Verify
Check Supabase Dashboard > Table Editor — you should see all 24 tables.

## Part 2: API (Vercel)

### 1. Connect GitHub Repo
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `AffordableStoreStuff` from GitHub
3. Framework Preset: **Other**
4. Click **Deploy**

### 2. Set Environment Variables
Go to Vercel project > **Settings > Environment Variables**:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Supabase pooler URL | Yes |
| `NODE_ENV` | `production` | Yes |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key | For AI features |
| `AI_MODEL` | `gpt-4o` | No (defaults to gpt-4o) |
| `STRIPE_SECRET_KEY` | Stripe secret key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For payments |

### 3. Redeploy
After setting env vars, trigger a redeploy from the Vercel dashboard or push a commit.

### 4. Verify
```bash
curl https://your-app.vercel.app/api/products
# Should return [] or product data
```

## Part 3: Mobile App (EAS + Play Store)

### 1. Login to EAS
```bash
eas login
```

### 2. Set Production API URL
```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value https://your-app.vercel.app
```

### 3. Google Play Service Account Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com) > IAM > Service Accounts
2. Create a service account (e.g., `play-store-deploy`)
3. Create a JSON key > download as `play-store-key.json`
4. Place it in the project root (it's gitignored)
5. Go to [Google Play Console](https://play.google.com/console) > Setup > API access
6. Link your Cloud project and grant the service account **Release manager** permissions

### 4. Build
```bash
# Production AAB for Play Store
eas build --platform android --profile production

# Preview APK for testing (installs directly on device)
eas build --platform android --profile preview
```

### 5. Submit to Play Store
```bash
eas submit --platform android --profile production
```
This uploads to the **internal testing** track (configured in `eas.json`).

### 6. Promote
In Google Play Console, go to your app > Testing > Internal testing > Promote to Production.

## Rollback Procedures

### API Rollback (Vercel)
1. Go to Vercel dashboard > Deployments
2. Find the last working deployment
3. Click the three dots > **Promote to Production**

### Database Rollback
Supabase automatically creates daily backups. To restore:
1. Go to Supabase Dashboard > Database > Backups
2. Select a backup point and restore

### Mobile App Rollback
- **JS-only changes**: Push an EAS Update that reverts to previous code
  ```bash
  eas update --branch production --message "Rollback to v1.0.x"
  ```
- **Native changes**: Submit a new build with the previous version's code

## Pre-Deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] `npm run lint` passes with no errors
- [ ] Database schema is up to date (`drizzle-kit push`)
- [ ] API endpoints return expected responses
- [ ] `play-store-key.json` is in project root (for submissions)
- [ ] `versionCode` in `app.json` is incremented (for Play Store updates)
- [ ] Privacy policy is accessible at a public URL
- [ ] App listing metadata is complete in Play Console

## Version Bumping

For each Play Store release, increment both:

1. **`version`** in `app.json` — human-readable (e.g., `1.0.0` → `1.1.0`)
2. **`android.versionCode`** in `app.json` — integer, must always increase (e.g., `1` → `2`)

```bash
# After updating app.json:
eas build --platform android --profile production
eas submit --platform android --profile production
```
