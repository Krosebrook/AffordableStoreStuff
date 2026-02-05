# Troubleshooting Guide

Common issues and their solutions for FlashFusion.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Server Issues](#server-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [PWA Issues](#pwa-issues)
- [Development Issues](#development-issues)

## Installation Issues

### npm install fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use legacy peer deps (last resort):**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Check Node.js version:**
   ```bash
   node --version
   # Should be v18.x or higher
   ```

4. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

### Module not found after installation

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Check node_modules exists:**
   ```bash
   ls node_modules/
   ```

3. **Reinstall specific package:**
   ```bash
   npm install express
   ```

## Server Issues

### Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

1. **Find and kill process:**
   ```bash
   # macOS/Linux
   lsof -i :5000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Use different port:**
   ```bash
   PORT=5001 npm run dev
   ```

3. **Or update .env:**
   ```env
   PORT=5001
   ```

### Server crashes on startup

**Symptoms:**
```
Server crashed with error...
```

**Solutions:**

1. **Check environment variables:**
   ```bash
   # Verify .env file exists and has required vars
   cat .env
   ```

2. **Check database connection:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Check logs:**
   ```bash
   npm run dev 2>&1 | tee server.log
   ```

4. **Start in debug mode:**
   ```bash
   DEBUG=* npm run dev
   ```

### Server starts but can't access

**Symptoms:**
- Browser shows "Can't reach this page"
- Connection refused error

**Solutions:**

1. **Check server is actually running:**
   ```bash
   ps aux | grep node
   ```

2. **Verify port binding:**
   ```bash
   netstat -an | grep 5000
   ```

3. **Check firewall:**
   ```bash
   # macOS
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   
   # Linux
   sudo ufw status
   ```

4. **Try localhost instead of 0.0.0.0:**
   ```
   http://localhost:5000 instead of http://0.0.0.0:5000
   ```

## Database Issues

### Cannot connect to database

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # macOS
   brew services list
   brew services start postgresql@14
   
   # Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   
   # Windows
   # Check Services app for PostgreSQL service
   ```

2. **Verify DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://user:password@host:port/database
   ```

3. **Test connection manually:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

4. **Check PostgreSQL port:**
   ```bash
   sudo lsof -i :5432
   ```

### Database schema issues

**Symptoms:**
```
Error: relation "products" does not exist
```

**Solutions:**

1. **Push schema:**
   ```bash
   npm run db:push
   ```

2. **Check tables exist:**
   ```bash
   psql $DATABASE_URL
   \dt
   ```

3. **Drop and recreate (WARNING: loses data):**
   ```bash
   psql $DATABASE_URL
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   \q
   npm run db:push
   ```

### Permission denied on database

**Symptoms:**
```
Error: permission denied for table products
```

**Solutions:**

1. **Grant permissions:**
   ```sql
   psql $DATABASE_URL
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
   ```

2. **Check user permissions:**
   ```sql
   \du
   ```

## Authentication Issues

### Cannot log in

**Symptoms:**
- "Invalid credentials" error
- Login seems successful but redirects back to login

**Solutions:**

1. **Check session secret:**
   ```bash
   # Ensure SESSION_SECRET is set in .env
   echo $SESSION_SECRET
   ```

2. **Check cookies are enabled:**
   - Open browser DevTools
   - Go to Application > Cookies
   - Look for `flashfusion.sid` cookie

3. **Clear browser cookies:**
   - DevTools > Application > Cookies > Clear

4. **Check database session store:**
   ```sql
   SELECT * FROM sessions;
   ```

### Session expires immediately

**Symptoms:**
- Logged out after page refresh
- Session doesn't persist

**Solutions:**

1. **Check cookie settings:**
   ```typescript
   // In server/index.ts
   cookie: {
     secure: process.env.NODE_ENV === 'production',
     httpOnly: true,
     sameSite: 'lax',
     maxAge: 24 * 60 * 60 * 1000
   }
   ```

2. **Check HTTPS in production:**
   - `secure: true` requires HTTPS
   - Use `secure: false` for local development

3. **Check session store:**
   ```bash
   psql $DATABASE_URL
   SELECT * FROM sessions;
   ```

### Password reset not working

**Symptoms:**
- Email not received
- Reset link expired
- Reset link invalid

**Solutions:**

1. **Check email service:**
   ```bash
   echo $RESEND_API_KEY
   # Should have valid API key
   ```

2. **Check token expiry:**
   ```sql
   SELECT * FROM password_reset_tokens WHERE expires_at > NOW();
   ```

3. **Test email service:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

## Build Issues

### Build fails with TypeScript errors

**Symptoms:**
```
error TS2307: Cannot find module 'X' or its corresponding type declarations
```

**Solutions:**

1. **Install missing types:**
   ```bash
   npm install --save-dev @types/express @types/node
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "skipLibCheck": true
     }
   }
   ```

3. **Clear TypeScript cache:**
   ```bash
   rm -rf node_modules/.cache
   npm run check
   ```

### Build succeeds but app doesn't work

**Symptoms:**
- Build completes without errors
- Production app shows blank page or errors

**Solutions:**

1. **Check build output:**
   ```bash
   ls -la dist/
   # Should have index.cjs and public/ directory
   ```

2. **Check console errors:**
   - Open DevTools > Console
   - Look for JavaScript errors

3. **Check network errors:**
   - Open DevTools > Network
   - Look for failed requests (red)

4. **Verify environment:**
   ```bash
   NODE_ENV=production npm start
   ```

### Vite build fails

**Symptoms:**
```
Error: Build failed with X errors
```

**Solutions:**

1. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run build
   ```

2. **Check vite.config.ts:**
   ```typescript
   export default defineConfig({
     build: {
       outDir: 'dist/public',
       emptyOutDir: true
     }
   });
   ```

3. **Increase Node memory:**
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   ```

## Runtime Errors

### React errors in console

**Symptoms:**
```
Warning: Each child in a list should have a unique "key" prop
```

**Solutions:**

1. **Add keys to list items:**
   ```typescript
   {products.map(product => (
     <ProductCard key={product.id} product={product} />
   ))}
   ```

2. **Check React DevTools:**
   - Install React DevTools extension
   - Inspect component tree
   - Look for errors/warnings

### API requests fail with CORS errors

**Symptoms:**
```
Access to fetch at 'X' from origin 'Y' has been blocked by CORS policy
```

**Solutions:**

1. **Check ALLOWED_ORIGINS:**
   ```env
   ALLOWED_ORIGINS="http://localhost:5000,http://localhost:3000"
   ```

2. **Add CORS middleware:**
   ```typescript
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS?.split(','),
     credentials: true
   }));
   ```

3. **For development, allow all:**
   ```typescript
   app.use(cors({
     origin: true,
     credentials: true
   }));
   ```

### 500 Internal Server Error

**Symptoms:**
- API returns 500 status
- Generic error message

**Solutions:**

1. **Check server logs:**
   ```bash
   # Terminal where server is running
   # Look for stack trace
   ```

2. **Add error handling:**
   ```typescript
   try {
     // ... code
   } catch (error) {
     console.error('Error:', error);
     res.status(500).json({ error: error.message });
   }
   ```

3. **Check database connection:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

## Performance Issues

### Slow page loads

**Symptoms:**
- Pages take >3 seconds to load
- Laggy interactions

**Solutions:**

1. **Check bundle size:**
   ```bash
   npm run build
   # Look at dist/public/assets/*.js file sizes
   ```

2. **Enable lazy loading:**
   ```typescript
   const Dashboard = lazy(() => import('./pages/dashboard'));
   ```

3. **Check network tab:**
   - Open DevTools > Network
   - Sort by size
   - Look for large files

4. **Use React DevTools Profiler:**
   - Identify slow components
   - Optimize re-renders

### High memory usage

**Symptoms:**
- Node process using >500MB RAM
- Out of memory errors

**Solutions:**

1. **Increase Node memory:**
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm start
   ```

2. **Check for memory leaks:**
   ```bash
   # Use Node.js --inspect flag
   node --inspect dist/index.cjs
   # Open chrome://inspect
   ```

3. **Review database connections:**
   ```typescript
   // Ensure connections are closed
   // Use connection pooling
   ```

### Slow database queries

**Symptoms:**
- API endpoints take >1 second
- Database queries timeout

**Solutions:**

1. **Add indexes:**
   ```sql
   CREATE INDEX idx_products_category ON products(category_id);
   CREATE INDEX idx_products_name ON products(name);
   ```

2. **Analyze slow queries:**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 1;
   ```

3. **Use connection pooling:**
   ```typescript
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000
   });
   ```

## PWA Issues

### Service worker not registering

**Symptoms:**
- "Service worker not registered" error
- Offline functionality doesn't work

**Solutions:**

1. **Check HTTPS (required for PWA):**
   - Service workers require HTTPS in production
   - localhost works without HTTPS

2. **Verify service worker file:**
   ```bash
   ls client/public/sw.js
   # Should exist
   ```

3. **Check browser console:**
   ```
   DevTools > Application > Service Workers
   ```

4. **Clear service worker:**
   ```
   DevTools > Application > Service Workers > Unregister
   ```

### App not installable

**Symptoms:**
- Install prompt doesn't appear
- "Add to Home Screen" not working

**Solutions:**

1. **Check manifest.json:**
   ```bash
   curl http://localhost:5000/manifest.json
   # Should return valid JSON
   ```

2. **Verify manifest requirements:**
   ```json
   {
     "name": "FlashFusion",
     "short_name": "FlashFusion",
     "icons": [...], // Required: 192x192 and 512x512
     "start_url": "/",
     "display": "standalone"
   }
   ```

3. **Check PWA criteria:**
   ```
   DevTools > Lighthouse > PWA
   # Run audit
   ```

### Offline mode not working

**Symptoms:**
- App doesn't work offline
- "No internet" error

**Solutions:**

1. **Check service worker caching:**
   ```
   DevTools > Application > Cache Storage
   # Should show cached assets
   ```

2. **Verify cache strategy:**
   ```javascript
   // In sw.js
   self.addEventListener('fetch', (event) => {
     // Check cache strategy
   });
   ```

3. **Test offline:**
   ```
   DevTools > Network > Offline checkbox
   ```

## Development Issues

### Hot reload not working

**Symptoms:**
- Changes don't appear without manual refresh
- Vite HMR errors

**Solutions:**

1. **Check Vite config:**
   ```typescript
   server: {
     hmr: true,
     watch: {
       usePolling: true // For Docker/WSL
     }
   }
   ```

2. **Restart dev server:**
   ```bash
   # Kill and restart
   npm run dev
   ```

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### TypeScript errors in editor

**Symptoms:**
- Red squiggles in VS Code
- "Cannot find module" errors

**Solutions:**

1. **Restart TypeScript server:**
   - VS Code: Cmd/Ctrl + Shift + P
   - Type: "TypeScript: Restart TS Server"

2. **Check tsconfig.json includes:**
   ```json
   {
     "include": ["client/src", "server", "shared"]
   }
   ```

3. **Install missing types:**
   ```bash
   npm install --save-dev @types/react @types/node
   ```

### Git issues

**Symptoms:**
- "Permission denied" on push
- Merge conflicts

**Solutions:**

1. **Check remote:**
   ```bash
   git remote -v
   ```

2. **Resolve conflicts:**
   ```bash
   git status
   # Edit conflicted files
   git add .
   git commit -m "Resolve conflicts"
   ```

3. **Force pull (WARNING: loses local changes):**
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

## Still Having Issues?

### Get Help

1. **Search GitHub Issues:**
   - [Existing issues](https://github.com/Krosebrook/AffordableStoreStuff/issues)
   - Someone may have already solved it!

2. **Create a New Issue:**
   - [New issue](https://github.com/Krosebrook/AffordableStoreStuff/issues/new)
   - Include:
     - Clear description of problem
     - Steps to reproduce
     - Error messages
     - Environment details (OS, Node version, etc.)

3. **Check Discussions:**
   - [GitHub Discussions](https://github.com/Krosebrook/AffordableStoreStuff/discussions)
   - Ask questions and get help from community

### Debugging Tips

1. **Enable verbose logging:**
   ```bash
   DEBUG=* npm run dev
   ```

2. **Check all logs:**
   - Server console output
   - Browser DevTools console
   - Browser DevTools Network tab
   - Database logs

3. **Isolate the problem:**
   - Does it happen in a fresh install?
   - Does it happen in a different browser?
   - Does it happen with different data?

4. **Create minimal reproduction:**
   - Strip down to smallest code that reproduces issue
   - Makes debugging much easier

---

**Last Updated:** January 2026

**Still stuck?** [Open an issue](https://github.com/Krosebrook/AffordableStoreStuff/issues) and we'll help! 🙏
