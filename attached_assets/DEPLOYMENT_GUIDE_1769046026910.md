# Deployment Guide

## Overview

This guide covers deployment strategies, configurations, and best practices for deploying FlashFusion v2.1 to various hosting platforms.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] Environment variables configured
- [ ] Build successful locally
- [ ] Dependencies audit completed
- [ ] Security vulnerabilities addressed
- [ ] Documentation updated
- [ ] Performance optimized
- [ ] Error tracking configured

## Build Process

### Production Build

Create an optimized production build:

```bash
npm run build
```

**Build Output:**
```
dist/
├── assets/
│   ├── index-[hash].js       # Main JavaScript bundle
│   ├── vendor-[hash].js      # Vendor dependencies
│   ├── index-[hash].css      # Compiled CSS
│   └── [images/fonts]        # Static assets
└── index.html                # Entry HTML file
```

### Build Configuration

**Vite Configuration** (`vite.config.js`):

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import base44 from '@base44/vite-plugin';

export default defineConfig({
  plugins: [
    base44({
      legacySDKImports: false
    }),
    react(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,  // Set to true for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  }
});
```

### Environment Variables

Create environment-specific `.env` files:

**.env.production:**
```env
VITE_BASE44_APP_ID=your_prod_app_id
VITE_BASE44_SERVER_URL=https://api.base44.com
VITE_BASE44_TOKEN=your_prod_token
VITE_BASE44_FUNCTIONS_VERSION=prod
NODE_ENV=production
```

**.env.staging:**
```env
VITE_BASE44_APP_ID=your_staging_app_id
VITE_BASE44_SERVER_URL=https://staging-api.base44.com
VITE_BASE44_TOKEN=your_staging_token
VITE_BASE44_FUNCTIONS_VERSION=staging
NODE_ENV=staging
```

**Build with specific environment:**
```bash
# Production
npm run build

# Staging
npm run build -- --mode staging
```

## Deployment Platforms

### Option 1: Vercel (Recommended)

**Automatic Deployment:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

**vercel.json Configuration:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_BASE44_APP_ID": "@base44_app_id",
    "VITE_BASE44_SERVER_URL": "@base44_server_url",
    "VITE_BASE44_TOKEN": "@base44_token"
  }
}
```

**GitHub Integration:**

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Automatic deployments on push to main branch

### Option 2: Netlify

**netlify.toml Configuration:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Deploy:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option 3: AWS S3 + CloudFront

**1. Build Application:**
```bash
npm run build
```

**2. Create S3 Bucket:**
```bash
aws s3 mb s3://flashfusion-app
```

**3. Configure Bucket for Static Hosting:**
```bash
aws s3 website s3://flashfusion-app \
  --index-document index.html \
  --error-document index.html
```

**4. Upload Build:**
```bash
aws s3 sync dist/ s3://flashfusion-app \
  --acl public-read \
  --cache-control "max-age=31536000,public"
```

**5. Create CloudFront Distribution:**

```json
{
  "Origins": [{
    "Id": "S3-flashfusion-app",
    "DomainName": "flashfusion-app.s3.amazonaws.com",
    "S3OriginConfig": {
      "OriginAccessIdentity": ""
    }
  }],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-flashfusion-app",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true
  },
  "CustomErrorResponses": [{
    "ErrorCode": 404,
    "ResponseCode": 200,
    "ResponsePagePath": "/index.html"
  }]
}
```

### Option 4: Docker

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and Run:**

```bash
# Build image
docker build -t flashfusion:latest .

# Run container
docker run -p 80:80 \
  -e VITE_BASE44_APP_ID=your_app_id \
  -e VITE_BASE44_TOKEN=your_token \
  flashfusion:latest
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_BASE44_APP_ID=${VITE_BASE44_APP_ID}
      - VITE_BASE44_SERVER_URL=${VITE_BASE44_SERVER_URL}
      - VITE_BASE44_TOKEN=${VITE_BASE44_TOKEN}
    restart: unless-stopped
```

### Option 5: Traditional Web Server

**Apache (.htaccess):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

**Nginx:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/flashfusion/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
}
```

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Build application
        run: npm run build
        env:
          VITE_BASE44_APP_ID: ${{ secrets.BASE44_APP_ID }}
          VITE_BASE44_SERVER_URL: ${{ secrets.BASE44_SERVER_URL }}
          VITE_BASE44_TOKEN: ${{ secrets.BASE44_TOKEN }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
```

### GitLab CI

**.gitlab-ci.yml:**

```yaml
image: node:18

stages:
  - test
  - build
  - deploy

cache:
  paths:
    - node_modules/

test:
  stage: test
  script:
    - npm ci
    - npm run lint
    - npm run typecheck

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  script:
    - npm install -g vercel
    - vercel --token $VERCEL_TOKEN --prod
  only:
    - main
```

## Performance Optimization

### 1. Code Splitting

Already configured in Vite, but you can customize:

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('react')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
```

### 2. Asset Optimization

**Image Optimization:**
- Use WebP format
- Compress images before upload
- Implement lazy loading

**Font Optimization:**
- Self-host fonts
- Use font-display: swap
- Subset fonts for used characters

### 3. Caching Strategy

**Service Worker (Optional):**

```javascript
// public/sw.js
const CACHE_NAME = 'flashfusion-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add critical assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### 4. CDN Configuration

Use CDN for static assets:
- CloudFlare
- AWS CloudFront
- Fastly
- Akamai

## Monitoring and Analytics

### Error Tracking

**Sentry Integration:**

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "your-sentry-dsn",
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
```

### Performance Monitoring

```javascript
// Log web vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Analytics

**Google Analytics:**

```javascript
// src/lib/analytics.js
export const initGA = () => {
  if (import.meta.env.PROD) {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  }
};
```

## Security Considerations

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:; 
               connect-src 'self' https://api.base44.com;">
```

### HTTPS Enforcement

Ensure all production deployments use HTTPS.

### Environment Variables

- Never commit `.env` files
- Use platform-specific secret management
- Rotate tokens regularly

## Rollback Strategy

### Quick Rollback

**Vercel:**
```bash
vercel rollback
```

**AWS:**
```bash
aws s3 sync s3://backup-bucket/ s3://flashfusion-app/
aws cloudfront create-invalidation --distribution-id DISTID --paths "/*"
```

**Docker:**
```bash
docker tag flashfusion:v1.0.0 flashfusion:latest
docker push flashfusion:latest
```

## Post-Deployment Verification

- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] Authentication working
- [ ] API calls successful
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance metrics acceptable
- [ ] Error tracking active
- [ ] Analytics recording

## Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf node_modules dist
npm cache clean --force
npm install
npm run build
```

### Deployment Issues

1. Check environment variables
2. Verify build output
3. Check server logs
4. Test API connectivity
5. Verify DNS settings

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: DevOps Team
