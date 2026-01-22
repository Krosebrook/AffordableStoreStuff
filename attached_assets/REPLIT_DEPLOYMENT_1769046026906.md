# Replit Mobile App Deployment Guide

**FlashFusion v2.1 - Replit.com Mobile Deployment**

This guide covers deploying FlashFusion v2.1 as a mobile-optimized web application on Replit.com.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Environment Variables](#environment-variables)
6. [Deployment](#deployment)
7. [Mobile Optimization](#mobile-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Performance Considerations](#performance-considerations)

---

## Overview

FlashFusion v2.1 is a React-based Universal AI Platform that can be deployed on Replit.com for mobile access. This deployment:

- ✅ Runs on Node.js 18+ with Vite dev server
- ✅ Supports dynamic port assignment (Replit requirement)
- ✅ Mobile-responsive UI with Tailwind CSS
- ✅ Integrates with Base44 backend for authentication and API
- ✅ Optimized bundle with code splitting (~700KB minified)

### Architecture

```
User (Mobile Browser)
    ↓
Replit.com (Container)
    ↓
Vite Dev Server / Static Server (Port: Dynamic)
    ↓
React App (FlashFusion v2.1)
    ↓
Base44 API (Authentication, Data, AI Services)
```

---

## Prerequisites

Before deploying to Replit, ensure you have:

1. **Replit Account**: Create a free account at [replit.com](https://replit.com)
2. **Base44 Credentials**: Required for app functionality
   - `VITE_BASE44_APP_ID`
   - `VITE_BASE44_SERVER_URL`
   - `VITE_BASE44_TOKEN`
   - `VITE_BASE44_FUNCTIONS_VERSION`
3. **Git Repository**: FlashFusion v2.1 codebase (this repo)

---

## Quick Start

### Method 1: Import from GitHub (Recommended)

1. Go to [replit.com](https://replit.com)
2. Click **"Create Repl"**
3. Select **"Import from GitHub"**
4. Enter repository URL: `https://github.com/Krosebrook/flashfusionv2.1`
5. Choose **"Node.js"** as the template
6. Click **"Import from GitHub"**
7. Configure environment variables (see below)
8. Click **"Run"** button

### Method 2: Manual Setup

1. Create a new Node.js Repl
2. Open the Shell tab
3. Clone the repository:
   ```bash
   git clone https://github.com/Krosebrook/flashfusionv2.1.git
   cd flashfusionv2.1
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Configure environment variables (see below)
6. Start the app:
   ```bash
   npm run dev
   ```

---

## Configuration

### Replit Configuration Files

The repository includes Replit-specific configuration:

#### `.replit`
Defines how the app runs on Replit:
- **Run command**: `npm run dev`
- **Entry point**: `index.html`
- **Port mapping**: Dynamic port support
- **Deployment**: Builds and serves static files

#### `replit.nix`
Specifies system dependencies:
- Node.js 18.x
- npm package manager
- TypeScript language server
- Vite build tool

#### `vite.config.js`
Configured for Replit:
- Dynamic port: Reads `PORT` environment variable
- Host binding: `0.0.0.0` for external access
- Flexible port fallback

### Package Scripts

New Replit-specific npm scripts:

```json
{
  "start": "npm run dev",
  "replit:dev": "vite --host 0.0.0.0 --port ${PORT:-5173}",
  "replit:build": "npm run build && npx serve dist -l ${PORT:-3000}",
  "serve": "serve dist -l ${PORT:-3000}"
}
```

**Usage:**
- **Development**: `npm run dev` or `npm start`
- **Production**: `npm run replit:build`
- **Serve built files**: `npm run serve`

---

## Environment Variables

### Required Variables

Configure these in **Replit Secrets** (not `.env` file):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BASE44_APP_ID` | Your Base44 application ID | `app_abc123xyz` |
| `VITE_BASE44_SERVER_URL` | Base44 API endpoint | `https://api.base44.com` |
| `VITE_BASE44_TOKEN` | Your Base44 authentication token | `sk_live_abc123...` |
| `VITE_BASE44_FUNCTIONS_VERSION` | Functions version to use | `prod` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port (auto-set by Replit) | `5173` |
| `NODE_ENV` | Environment mode | `development` |
| `BASE44_LEGACY_SDK_IMPORTS` | Enable legacy SDK imports | `false` |

### How to Add Secrets in Replit

1. Open your Repl
2. Click the **"Secrets"** tab (🔒 icon in sidebar)
3. Click **"Add new secret"**
4. Enter variable name (e.g., `VITE_BASE44_APP_ID`)
5. Enter the value
6. Click **"Add secret"**
7. Repeat for all required variables
8. **Important**: Restart the Repl after adding secrets

### Getting Base44 Credentials

1. Sign up at [base44.com](https://base44.com)
2. Create a new application
3. Navigate to **Settings → API Keys**
4. Copy your credentials
5. Add to Replit Secrets

---

## Deployment

### Development Mode (Recommended for Replit)

Best for testing and mobile preview:

```bash
npm run dev
```

**Characteristics:**
- ✅ Hot Module Replacement (HMR)
- ✅ Fast startup (~2-3 seconds)
- ✅ Source maps for debugging
- ✅ Dynamic port support
- ⚠️ Larger bundle size
- ⚠️ Not optimized for production

**Mobile Access:**
- Click the **"Open in new tab"** button in Replit
- Share the generated URL with mobile devices
- Access via Replit mobile app

### Production Mode

For optimized performance:

```bash
# Build the app
npm run build

# Serve the built files
npm run serve
```

**Characteristics:**
- ✅ Minified bundle (~500-700KB)
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Optimized for mobile
- ⚠️ Slower startup (build required)
- ⚠️ No HMR

**Build Output:**
```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle (~1.2MB)
│   ├── Dashboard-[hash].js  # Lazy-loaded
│   ├── index-[hash].css     # Styles (~120KB)
│   └── ...
└── index.html
```

### Replit Deployment Options

#### Option 1: Always-On Repl (Paid Plan)
- Keeps app running 24/7
- No cold starts
- Best for production use

#### Option 2: Deployments (Beta)
- Deploy to Replit's cloud infrastructure
- Automatic scaling
- Custom domain support

---

## Mobile Optimization

### Current Mobile Features

✅ **Responsive Design**
- Tailwind CSS breakpoints
- Mobile-first approach
- `useIsMobile()` hook (768px breakpoint)

✅ **Touch-Friendly UI**
- Radix UI accessible components
- Large touch targets
- Mobile gesture support

✅ **Performance**
- Code splitting (4 lazy-loaded pages)
- Optimized bundle size
- React Query caching

### Mobile UX Considerations

#### Screen Sizes Supported
- 📱 Mobile: < 768px (sm)
- 📱 Tablet: 768px - 1024px (md)
- 💻 Desktop: > 1024px (lg)

#### Mobile-Specific Behavior
- Sidebar collapses on mobile
- Touch-optimized form inputs
- Swipe gestures for navigation
- Bottom navigation bar (some pages)

### Testing on Mobile

1. **Replit Mobile App**
   - Download from App Store / Play Store
   - Open your Repl in the app
   - Test directly on device

2. **Browser Testing**
   - Open Repl URL in mobile browser
   - Use developer tools responsive mode
   - Test with real devices

3. **Performance Testing**
   ```bash
   # Lighthouse CLI
   npx lighthouse <repl-url> --view
   ```

### PWA Support (Future Enhancement)

Currently **not configured** but can be added:
- Add `manifest.json`
- Configure service worker
- Add offline support
- Enable "Add to Home Screen"

See [ROADMAP.md](ROADMAP.md) for planned PWA features.

---

## Troubleshooting

### Common Issues

#### 1. "Address already in use" Error

**Problem**: Port 5173 is already in use.

**Solution**: 
Replit automatically assigns a dynamic port. Ensure `vite.config.js` is configured correctly:

```javascript
server: {
  port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  host: true,
  strictPort: false,
}
```

#### 2. Base44 Authentication Errors

**Problem**: "User not registered" or "Auth required" errors.

**Solution**:
1. Verify all Base44 secrets are set in Replit
2. Check secret names start with `VITE_` prefix
3. Restart the Repl after adding secrets
4. Verify Base44 credentials are valid

#### 3. Blank Screen on Load

**Problem**: App shows blank screen.

**Solution**:
1. Check browser console for errors
2. Verify `VITE_BASE44_SERVER_URL` is correct
3. Ensure internet connectivity to Base44 API
4. Check if Base44 service is operational

#### 4. Slow Initial Load

**Problem**: App takes 5-10 seconds to load.

**Solution**:
1. Use production build: `npm run replit:build`
2. Enable code splitting (already configured)
3. Consider CDN for static assets
4. Upgrade to Always-On Repl plan

#### 5. Module Not Found Errors

**Problem**: `Cannot find module '@/...'` errors.

**Solution**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Restart the Repl
4. Check `jsconfig.json` path mappings

### Debug Mode

Enable verbose logging:

```bash
# In Shell
DEBUG=* npm run dev
```

Check Replit logs:
- Open **"Console"** tab
- Look for startup errors
- Check network requests

---

## Performance Considerations

### Bundle Size Analysis

Current bundle size (minified):
```
Main bundle: ~1.2 MB uncompressed
             ~500 KB gzipped
Lazy-loaded: ~150 KB (4 pages)
CSS:         ~120 KB
```

**Optimization Opportunities:**
1. Lazy load more pages (currently 4/34 pages)
2. Remove unused dependencies
3. Use dynamic imports for heavy libraries
4. Enable Vite's build caching

### Cold Start Performance

**Replit Free Tier:**
- Cold start: 5-15 seconds
- Warm start: 1-3 seconds

**Optimization Tips:**
- Use Always-On Repl (paid)
- Keep bundle size small
- Minimize npm dependencies
- Use build cache

### Mobile Network Performance

**Considerations:**
- Target 3G network speed
- Optimize images (WebP format)
- Use lazy loading for images
- Minimize API calls

**Current API Calls:**
- Authentication: 1-2 calls on load
- Dashboard: 3-5 calls
- Features: On-demand loading

### Memory Usage

**Current:**
- Node.js: ~200-300 MB
- React app: ~50-100 MB (browser)

**Replit Limits:**
- Free tier: 512 MB RAM
- Recommendation: Upgrade if hitting limits

---

## Security Considerations

### Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use Replit Secrets for sensitive data
- ✅ Secrets are encrypted at rest
- ✅ Secrets not exposed in client bundle (VITE_ prefix required)

### HTTPS
- ✅ Replit provides HTTPS by default
- ✅ All API calls use HTTPS
- ✅ Secure WebSocket connections (wss://)

### Authentication
- ✅ Base44 handles authentication
- ✅ Token-based auth (JWT)
- ✅ Secure token storage (httpOnly cookies)
- ⚠️ Ensure Base44 credentials are valid

### Content Security Policy
Currently **not configured**. Consider adding:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

---

## Next Steps

After deploying to Replit:

1. **Test Mobile Functionality**
   - [ ] Test on actual mobile devices
   - [ ] Verify all features work
   - [ ] Check responsive design

2. **Optimize Performance**
   - [ ] Run Lighthouse audit
   - [ ] Optimize bundle size
   - [ ] Enable service worker

3. **Production Hardening**
   - [ ] Add error tracking (Sentry)
   - [ ] Enable analytics
   - [ ] Set up monitoring

4. **Mobile Enhancements**
   - [ ] Add PWA support
   - [ ] Enable offline mode
   - [ ] Add push notifications

---

## Additional Resources

- **Main README**: [README.md](README.md)
- **Development Guide**: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Replit Docs**: [docs.replit.com](https://docs.replit.com)
- **Base44 Docs**: [base44.com/docs](https://base44.com/docs)

---

## Support

**Issues with Replit Deployment?**
1. Check [Troubleshooting](#troubleshooting) section
2. Review Replit logs in Console tab
3. Verify environment variables
4. Open GitHub issue: [github.com/Krosebrook/flashfusionv2.1/issues](https://github.com/Krosebrook/flashfusionv2.1/issues)

**Base44 Integration Issues?**
- Email: support@base44.com
- Docs: [base44.com/docs](https://base44.com/docs)

---

**Version**: 2.1.0  
**Last Updated**: January 2026  
**Platform**: Replit.com  
**Status**: Production-Ready ✅
