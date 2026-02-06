# Security Configuration Guide

This document details the security features implemented in FlashFusion and how to configure them properly for production.

## 🔒 Overview

FlashFusion implements multiple layers of security to protect user data and prevent common web vulnerabilities:

1. **Authentication & Authorization** - Bcrypt password hashing, session management
2. **Network Security** - HTTPS, CORS, rate limiting
3. **Input Validation** - Zod schemas, SQL injection prevention
4. **Output Encoding** - XSS prevention via React
5. **Security Headers** - Helmet.js middleware
6. **Logging & Monitoring** - Sensitive data protection

## 🛡️ Security Features

### 1. Environment Variable Validation

The application validates critical environment variables on startup and will **exit immediately** if required variables are missing or insecure.

**Required Variables:**
- `SESSION_SECRET` - Must be at least 32 characters
- `DATABASE_URL` - PostgreSQL connection string

**Production Validation:**
- Session secret must be at least 32 characters
- Session secret cannot contain "dev" or "change" (prevents using default values)
- Application exits with error message if validation fails

**Location:** `server/index.ts` lines 14-36

```typescript
// Example error messages:
// "❌ Missing required environment variables: SESSION_SECRET, DATABASE_URL"
// "❌ SESSION_SECRET must be at least 32 characters in production"
// "❌ SESSION_SECRET appears to be a default/dev value"
```

### 2. HTTPS Redirect

In production mode with a reverse proxy (Replit, Nginx, etc.), all HTTP requests are automatically redirected to HTTPS.

**Configuration:**
```bash
# Enable HTTPS redirect (default in production)
NODE_ENV=production
TRUST_PROXY=true  # Required when behind reverse proxy
```

**How it works:**
- Checks `x-forwarded-proto` header
- Redirects HTTP → HTTPS with 301/302 status
- Preserves original URL and query parameters

**Location:** `server/index.ts` lines 42-50

### 3. Security Headers (Helmet.js)

Helmet.js adds essential security headers to all responses:

**Headers Applied:**
- `Strict-Transport-Security` (HSTS) - Forces HTTPS for 1 year
- `X-Frame-Options` - Prevents clickjacking
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-XSS-Protection` - Legacy XSS protection
- `Referrer-Policy` - Controls referrer information

**Configuration:**
```typescript
app.use(helmet({
  contentSecurityPolicy: false, // Handled in HTML meta tag
  crossOriginEmbedderPolicy: false, // Allow embedding in dev
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));
```

**Location:** `server/index.ts` lines 72-80

### 4. Content Security Policy (CSP)

CSP prevents XSS attacks by controlling which resources can be loaded.

**Current Policy (Production-Safe):**
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://api.openai.com https://api.resend.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**Why `unsafe-inline` for scripts?**
- Required for Vite's development server
- React uses inline scripts for event handlers
- Consider removing for maximum security (requires code refactoring)

**Location:** `client/index.html` lines 32-42

**Recommendations for stricter CSP:**
1. Remove `'unsafe-inline'` from `script-src`
2. Use nonces or hashes for inline scripts
3. Move all inline scripts to external files
4. Use strict-dynamic with nonces

### 5. CORS Configuration

Cross-Origin Resource Sharing (CORS) controls which domains can access the API.

**Configuration:**
```bash
# Single origin
ALLOWED_ORIGINS="https://yourdomain.com"

# Multiple origins (comma-separated)
ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"

# Development (automatic for localhost)
# No configuration needed - automatically allows localhost and Replit domains
```

**Features:**
- ✅ Allows credentials (cookies, sessions)
- ✅ Validates origin against whitelist
- ✅ Auto-allows localhost and Replit in development
- ✅ Allows specified HTTP methods
- ✅ Custom error handling

**Location:** `server/index.ts` lines 82-106

### 6. Rate Limiting

Rate limiting prevents brute force attacks and API abuse.

**General API Rate Limit:**
- Window: 15 minutes
- Max requests: 100 per IP
- Applies to: All `/api/*` endpoints
- Excludes: `/api/health` (health check)

**Authentication Rate Limit:**
- Window: 15 minutes  
- Max requests: 5 per IP
- Applies to: `/api/auth/login`, `/api/auth/register`
- Skip successful requests: Yes (only counts failures)

**Configuration:**
```typescript
// Adjust limits via middleware configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // ... other options
});
```

**Response on limit exceeded:**
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

**Location:** `server/index.ts` lines 108-130

### 7. Session Security

Sessions use PostgreSQL for storage with secure cookie configuration.

**Session Configuration:**
```typescript
session({
  store: new PgSession({
    pool: pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET!, // Required, validated at startup
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    httpOnly: true, // Not accessible via JavaScript
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax", // CSRF protection
  },
})
```

**Security Features:**
- ✅ HttpOnly cookies (prevents XSS theft)
- ✅ Secure flag in production (HTTPS-only)
- ✅ SameSite=lax (CSRF protection)
- ✅ PostgreSQL storage (survives server restarts)
- ✅ Session secret validated on startup

**Location:** `server/index.ts` lines 133-148

### 8. Password Security

Passwords are hashed using bcrypt with 12 salt rounds (industry standard).

**Features:**
- ✅ Bcrypt hashing (adaptive, slow by design)
- ✅ 12 salt rounds (configurable via `BCRYPT_SALT_ROUNDS`)
- ✅ Passwords never stored in plain text
- ✅ Passwords never logged
- ✅ Password reset tokens time-limited (1 hour)

**Configuration:**
```bash
# Adjust bcrypt rounds (higher = more secure but slower)
BCRYPT_SALT_ROUNDS=12  # Recommended: 10-12
```

**Password Requirements:**
- Minimum length: 8 characters (configurable)
- Recommended: uppercase, lowercase, numbers, special characters

**Location:** Password hashing in `server/routes.ts`

### 9. Compression

Compression reduces bandwidth and improves performance.

**Configuration:**
```typescript
compression({
  level: 6, // Balance between speed and ratio (0-9)
  threshold: 1024, // Only compress responses > 1KB
})
```

**Features:**
- ✅ Gzip compression for responses
- ✅ Configurable compression level
- ✅ Only compresses large responses
- ✅ Improves page load times

**Location:** `server/index.ts` lines 108-111

### 10. Logging Security

Logs are sanitized to prevent sensitive data exposure.

**Sensitive Data Filtered:**
- `password`
- `passwordHash`
- `token`
- `secret`
- `apiKey`

**Features:**
- ✅ Response bodies only logged in development
- ✅ Sensitive fields automatically redacted
- ✅ Structured logging with timestamps
- ✅ Source identification

**Configuration:**
```typescript
// Disable response logging in production
if (process.env.NODE_ENV !== 'production' && capturedJsonResponse) {
  // Sanitize and log
}
```

**Location:** `server/index.ts` lines 165-186

### 11. Database Security

PostgreSQL connection with best practices.

**Connection String Format:**
```bash
# With SSL (production)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Without SSL (development)
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

**Security Features:**
- ✅ Parameterized queries (Drizzle ORM)
- ✅ SQL injection prevention
- ✅ Connection pooling
- ✅ SSL/TLS support

**Best Practices:**
1. Use SSL in production (`?sslmode=require`)
2. Use dedicated database user with minimal permissions
3. Regular backups
4. Monitor connection pool usage

### 12. Health Check Endpoint

Health check for monitoring and load balancers.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

**Features:**
- ✅ Excluded from rate limiting
- ✅ No authentication required
- ✅ Returns uptime and environment info
- ✅ Ideal for UptimeRobot, Pingdom, etc.

**Location:** `server/index.ts` lines 194-202

### 13. Graceful Shutdown

Proper shutdown handling to prevent data loss.

**Features:**
- ✅ Listens for SIGTERM and SIGINT
- ✅ Stops accepting new connections
- ✅ Finishes in-flight requests
- ✅ Closes database connections
- ✅ Force shutdown after 10 seconds

**Signals Handled:**
- `SIGTERM` - Kubernetes/Docker termination
- `SIGINT` - Ctrl+C in terminal

**Location:** `server/index.ts` lines 219-237

## 🔐 Security Best Practices

### Development vs Production

**Development:**
- `NODE_ENV=development`
- HTTP allowed
- Detailed error messages
- Response bodies logged
- Less strict CORS

**Production:**
- `NODE_ENV=production`
- HTTPS enforced
- Generic error messages
- No response logging
- Strict CORS

### Secret Management

**❌ Never:**
- Commit secrets to Git
- Use default/example secrets
- Share secrets in plaintext
- Log secrets

**✅ Always:**
- Use environment variables
- Generate strong secrets (`openssl rand -base64 32`)
- Rotate secrets regularly
- Use secrets management (Replit Secrets, AWS Secrets Manager, etc.)

### Monitoring

**What to Monitor:**
- Failed login attempts
- Rate limit violations
- Error rates (5xx responses)
- Response times
- Database connection pool usage

**Recommended Tools:**
- Error tracking: Sentry, Rollbar
- Uptime monitoring: UptimeRobot, Pingdom
- APM: New Relic, DataDog
- Logs: LogDNA, Papertrail

### Regular Security Tasks

**Weekly:**
- Review error logs
- Check failed authentication attempts

**Monthly:**
- Run `npm audit` and update dependencies
- Review rate limit effectiveness
- Check session activity

**Quarterly:**
- Rotate session secret
- Review and update CSP
- Security penetration testing
- Review access logs

## 🚨 Security Incident Response

### If You Suspect a Breach

1. **Immediate Actions:**
   - Rotate all secrets (SESSION_SECRET, API keys)
   - Review recent logs for suspicious activity
   - Force logout all users (clear sessions)
   - Enable maintenance mode if necessary

2. **Investigation:**
   - Check database for unauthorized access
   - Review authentication logs
   - Check for data exfiltration
   - Identify attack vector

3. **Remediation:**
   - Patch identified vulnerabilities
   - Update dependencies
   - Strengthen affected security measures
   - Notify affected users if data compromised

4. **Prevention:**
   - Document incident and response
   - Update security measures
   - Conduct post-mortem
   - Train team on lessons learned

## 📞 Security Contacts

- **Security Issues**: See [SECURITY.md](./SECURITY.md)
- **Vulnerability Reports**: security@flashfusion.dev (coming soon)
- **Emergency**: [Add on-call contact]

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
