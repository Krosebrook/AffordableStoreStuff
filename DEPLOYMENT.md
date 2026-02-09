# Deployment Guide

This comprehensive guide covers deploying FlashFusion to various hosting platforms and production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Build Process](#build-process)
- [Deployment Platforms](#deployment-platforms)
  - [Replit (Recommended)](#replit-recommended)
  - [Vercel](#vercel)
  - [Railway](#railway)
  - [Heroku](#heroku)
  - [AWS](#aws)
  - [DigitalOcean](#digitalocean)
- [Database Setup](#database-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Code Quality
- [ ] All tests passing (`npx playwright test`)
- [ ] Type checking successful (`npm run check`)
- [ ] Build completes without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors in browser

### Security
- [ ] All environment variables configured
- [ ] Secure `SESSION_SECRET` generated (min 32 characters)
- [ ] Database credentials secured
- [ ] API keys rotated for production
- [ ] CORS configured for production domains
- [ ] Rate limiting implemented (future)
- [ ] Security headers configured
- [ ] SSL/TLS certificates ready

### Configuration
- [ ] Environment variables documented
- [ ] Production database provisioned
- [ ] Email service configured (if using)
- [ ] OAuth credentials for production (if using)
- [ ] Monitoring/logging configured

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] CDN configured (if applicable)

### Documentation
- [ ] README.md updated
- [ ] API documentation current
- [ ] Changelog updated
- [ ] Deployment notes documented

## Environment Configuration

### Required Environment Variables

```bash
# Production .env configuration
NODE_ENV=production
PORT=5000

# Database (use production database URL)
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/flashfusion?sslmode=require"

# Session (generate with: openssl rand -base64 32)
SESSION_SECRET="your-production-secret-min-32-chars"

# Optional but recommended
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

### Generating Secure Secrets

```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Generate multiple secrets at once
for i in {1..3}; do openssl rand -base64 32; done
```

## Build Process

### Development Build

```bash
# Install dependencies
npm install

# Type check
npm run check

# Run development server
npm run dev
```

### Production Build

```bash
# Install production dependencies only
npm ci --production

# Build client and server
npm run build

# Output:
# - dist/index.cjs (server bundle)
# - dist/public/ (static assets)
```

### Build Optimization

The build process includes:
- **Vite bundling** - Optimized client bundle
- **Code splitting** - Lazy-loaded routes
- **Tree shaking** - Removes unused code
- **Minification** - Compressed JavaScript/CSS
- **Asset optimization** - Compressed images and fonts

### Build Configuration

See `vite.config.ts` for build settings:

```typescript
export default defineConfig({
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
    sourcemap: false, // Enable for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*']
        }
      }
    }
  }
});
```

## Deployment Platforms

### Replit (Recommended)

Replit provides the easiest deployment with built-in PostgreSQL database.

#### Initial Setup

1. **Import Repository**
   ```
   - Go to replit.com
   - Click "Create" → "Import from GitHub"
   - Enter: https://github.com/Krosebrook/AffordableStoreStuff
   - Click "Import from GitHub"
   ```

2. **Configuration**
   - Replit auto-detects `.replit` configuration
   - Database automatically provisioned
   - No manual configuration needed

3. **Set Secrets**
   ```
   - Click 🔒 "Secrets" tab
   - Add: SESSION_SECRET (generate new)
   - Add: OPENAI_API_KEY (optional)
   - Add: RESEND_API_KEY (optional)
   ```

4. **Deploy**
   ```
   - Click "Run" to start development
   - Click "Deploy" for production
   - Choose deployment tier
   - Click "Deploy"
   ```

#### Replit Features

- ✅ Built-in PostgreSQL database
- ✅ Automatic SSL/HTTPS
- ✅ Zero-downtime deployments
- ✅ Environment variables management
- ✅ Custom domains supported
- ✅ Automatic backups
- ✅ Monitoring included

#### Replit Configuration

`.replit` file (already configured):

```toml
run = "npm run dev"
entrypoint = "server/index.ts"

[deployment]
run = "npm start"
deploymentTarget = "cloudrun"

[env]
PORT = "5000"
NODE_ENV = "production"
```

### Vercel

Vercel is excellent for frontend with serverless functions.

#### Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   # Follow prompts
   ```

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Database Setup for Vercel

Add PostgreSQL integration:

```bash
# Via Vercel dashboard:
# 1. Go to project settings
# 2. Click "Integrations"
# 3. Add "Supabase" or "Railway"
# 4. Connect database
```

Or use external database:

```bash
# Add environment variable in Vercel dashboard
DATABASE_URL="postgresql://..."
```

### Railway

Railway offers simple deployment with PostgreSQL included.

#### Setup

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

5. **Deploy**
   ```bash
   railway up
   ```

#### Railway Configuration

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Environment Variables

```bash
# Set via Railway dashboard or CLI
railway variables set SESSION_SECRET=$(openssl rand -base64 32)
railway variables set OPENAI_API_KEY=sk-...
```

### Heroku

Classic platform-as-a-service with extensive add-on ecosystem.

#### Setup

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from heroku.com/download
   
   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-app-name
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

#### Heroku Configuration

Create `Procfile`:

```
web: npm start
release: npm run db:push
```

Create `app.json`:

```json
{
  "name": "FlashFusion",
  "description": "AI-Powered E-commerce Platform",
  "repository": "https://github.com/Krosebrook/AffordableStoreStuff",
  "keywords": ["node", "express", "react", "postgresql"],
  "addons": [
    {
      "plan": "heroku-postgresql"
    }
  ],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "SESSION_SECRET": {
      "description": "Secret key for session encryption",
      "generator": "secret"
    },
    "OPENAI_API_KEY": {
      "description": "OpenAI API key for AI features",
      "required": false
    }
  },
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ]
}
```

#### Environment Variables

```bash
# Set config vars
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set NODE_ENV=production

# View config
heroku config
```

### AWS

Enterprise-grade deployment on AWS infrastructure.

#### Services Required

- **EC2** or **ECS** - Application hosting
- **RDS** - PostgreSQL database
- **S3** - Static assets (optional)
- **CloudFront** - CDN (optional)
- **Route53** - DNS management
- **Certificate Manager** - SSL certificates

#### Deployment Options

##### Option 1: EC2 Instance

```bash
# 1. Launch EC2 instance (t3.medium recommended)
# 2. SSH into instance
ssh -i key.pem ubuntu@ec2-ip-address

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PostgreSQL client
sudo apt-get install postgresql-client

# 5. Clone repository
git clone https://github.com/Krosebrook/AffordableStoreStuff.git
cd AffordableStoreStuff

# 6. Install dependencies
npm ci --production

# 7. Set environment variables
nano .env
# Add production values

# 8. Build
npm run build

# 9. Install PM2 for process management
npm install -g pm2

# 10. Start application
pm2 start npm --name "flashfusion" -- start
pm2 save
pm2 startup
```

##### Option 2: AWS Elastic Beanstalk

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize
eb init -p node.js flashfusion

# 3. Create environment
eb create flashfusion-prod

# 4. Deploy
eb deploy

# 5. Open in browser
eb open
```

#### RDS Database Setup

```bash
# 1. Create RDS PostgreSQL instance via AWS Console
# 2. Configure security group (allow port 5432)
# 3. Get connection string
# 4. Add to environment variables
```

### DigitalOcean

Simple cloud deployment with App Platform.

#### Setup

1. **Via Dashboard**
   ```
   - Go to cloud.digitalocean.com
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Configure build settings:
     - Build Command: npm run build
     - Run Command: npm start
   - Add environment variables
   - Deploy
   ```

2. **Via doctl CLI**
   ```bash
   # Install doctl
   snap install doctl
   
   # Authenticate
   doctl auth init
   
   # Create app
   doctl apps create --spec app.yaml
   ```

#### DigitalOcean App Spec

Create `app.yaml`:

```yaml
name: flashfusion
services:
- name: web
  github:
    repo: Krosebrook/AffordableStoreStuff
    branch: main
    deploy_on_push: true
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  envs:
  - key: NODE_ENV
    value: production
  - key: SESSION_SECRET
    type: SECRET
  - key: DATABASE_URL
    type: SECRET
databases:
- name: flashfusion-db
  engine: PG
  version: "14"
```

## Database Setup

### PostgreSQL Production Setup

#### Managed Services (Recommended)

**Supabase** (Recommended)
```bash
# 1. Create account at supabase.com
# 2. Create new project
# 3. Get connection string from settings
# 4. Add to DATABASE_URL environment variable
```

**Railway**
```bash
railway add postgresql
railway variables
# Copy DATABASE_URL
```

**Heroku Postgres**
```bash
heroku addons:create heroku-postgresql:mini
```

#### Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE flashfusion;
CREATE USER flashfusion_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE flashfusion TO flashfusion_user;
\q

# Configure pg_hba.conf for remote access
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Database Migration

```bash
# Push schema to database
npm run db:push

# Or manually run migrations (future)
# npm run db:migrate
```

### Database Backup

```bash
# Backup database
pg_dump -h hostname -U username -d database_name > backup_$(date +%Y%m%d).sql

# Restore database
psql -h hostname -U username -d database_name < backup_20260205.sql

# Automated backup script
# Add to crontab: 0 2 * * * /path/to/backup-script.sh
```

## SSL/HTTPS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/flashfusion
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Logging

### Application Monitoring

**Recommended Tools:**
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **New Relic** - APM
- **DataDog** - Infrastructure monitoring

### Setup Sentry

```bash
npm install @sentry/node @sentry/react

# Add to server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

# Add to client/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-client-dsn",
  integrations: [new Sentry.BrowserTracing()],
});
```

### Logging

```bash
# View logs (depends on platform)

# Replit
# View in console or deployment logs

# Heroku
heroku logs --tail

# Railway
railway logs

# PM2
pm2 logs flashfusion
```

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="flashfusion"

# Database backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Upload to S3 (optional)
# aws s3 cp "$BACKUP_DIR/db_$DATE.sql.gz" s3://your-backup-bucket/

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

### Disaster Recovery

1. **Restore from backup**
   ```bash
   gunzip < backup.sql.gz | psql -h host -U user database
   ```

2. **Verify application**
   ```bash
   npm run check
   npm run build
   ```

3. **Redeploy**
   ```bash
   # Deploy to platform
   ```

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check environment variable
echo $DATABASE_URL

# Verify SSL mode
# Add ?sslmode=require to DATABASE_URL
```

#### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

#### Memory Issues

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check logs
# Review application logs for errors
```

### Health Checks

```bash
# Check application health
curl http://localhost:5000/api/auth/me

# Check database
psql $DATABASE_URL -c "SELECT 1"
```

## Post-Deployment

### Verification Checklist

- [ ] Application loads successfully
- [ ] Database connection working
- [ ] Authentication works
- [ ] API endpoints responding
- [ ] Static assets loading
- [ ] SSL certificate valid
- [ ] Performance acceptable
- [ ] Error tracking working
- [ ] Backups configured
- [ ] Monitoring active

### Performance Optimization

```bash
# Enable compression (if not enabled)
# Add to server/index.ts
import compression from 'compression';
app.use(compression());

# Cache static assets
# Configure in nginx or CDN
```

---

**Need Help?**

- [GitHub Issues](https://github.com/Krosebrook/AffordableStoreStuff/issues)
- [Documentation](./DOCUMENTATION.md)
- [Community Discussions](https://github.com/Krosebrook/AffordableStoreStuff/discussions)

**Last Updated:** January 2026
