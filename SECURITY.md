# Security Policy

## Overview

Security is a top priority for FlashFusion. This document outlines our security policies, how to report vulnerabilities, and best practices for secure development.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          | End of Support |
| ------- | ------------------ | -------------- |
| 2.2.x   | :white_check_mark: | Current        |
| 2.1.x   | :white_check_mark: | June 2026      |
| 2.0.x   | :x:                | January 2026   |
| < 2.0   | :x:                | Ended          |

**Note:** We recommend always using the latest version to ensure you have the latest security patches.

## Reporting a Vulnerability

### Where to Report

If you discover a security vulnerability, please report it responsibly:

**DO NOT** create a public GitHub issue for security vulnerabilities.

**Preferred method:**
1. Email: security@flashfusion.dev (coming soon)
2. GitHub Security Advisory: [Create a private security advisory](https://github.com/Krosebrook/AffordableStoreStuff/security/advisories/new)
3. Direct message to maintainers

### What to Include

Please provide as much information as possible:

- **Type of vulnerability** (e.g., XSS, SQL Injection, CSRF)
- **Full path** of source file(s) related to the vulnerability
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof of concept** or exploit code (if possible)
- **Impact** of the vulnerability
- **Possible remediation** (if you have suggestions)

### Response Timeline

We aim to respond to security reports according to the following timeline:

- **Initial Response:** Within 48 hours
- **Assessment:** Within 7 days
- **Fix Development:** Varies by severity (1-30 days)
- **Public Disclosure:** After fix is deployed and users have time to update

### What to Expect

1. **Acknowledgment:** We'll acknowledge receipt of your report
2. **Investigation:** We'll investigate and validate the vulnerability
3. **Updates:** We'll keep you informed of our progress
4. **Resolution:** We'll develop and deploy a fix
5. **Credit:** We'll credit you in our security advisory (unless you prefer to remain anonymous)
6. **Disclosure:** We'll coordinate public disclosure with you

## Security Measures

### Authentication & Authorization

#### Password Security
- **Bcrypt hashing** with 12 rounds (configurable)
- **Minimum password requirements:** 8 characters, mixed case, numbers, special characters
- **Rate limiting** on login attempts (5 attempts per 15 minutes)
- **Account lockout** after repeated failed attempts
- **Secure password reset** with time-limited tokens

```typescript
// Example: Secure password hashing
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

#### Session Management
- **HTTP-only cookies** to prevent XSS attacks
- **Secure flag** enabled in production (HTTPS only)
- **SameSite=Lax** to prevent CSRF
- **Session expiration** after 24 hours of inactivity
- **PostgreSQL session store** for scalability

```typescript
// Session configuration
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}
```

#### OAuth Integration
- **PKCE flow** for enhanced security
- **State parameter** to prevent CSRF
- **Token validation** before accepting
- **Secure token storage**

### Input Validation

#### Server-side Validation
- **Zod schemas** for all input validation
- **Type checking** at runtime
- **Sanitization** of user input
- **Length limits** on all fields
- **Allowlist approach** for allowed values

```typescript
// Example: Input validation with Zod
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive().max(999999),
  description: z.string().max(5000),
  stock: z.number().int().nonnegative()
});
```

#### Client-side Validation
- **React Hook Form** with Zod resolver
- **Never trust client-side validation alone**
- **Real-time feedback** for better UX

### API Security

#### Rate Limiting
```typescript
// Recommended rate limits (to be implemented)
{
  '/api/auth/login': '5 requests per 15 minutes',
  '/api/auth/register': '3 requests per hour',
  '/api/': '100 requests per 15 minutes'
}
```

#### CORS Configuration
```typescript
// Strict CORS policy
{
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

#### API Authentication
- **Session-based authentication** for web
- **JWT tokens** for mobile/API access (future)
- **API keys** for third-party integrations (future)

### Database Security

#### SQL Injection Prevention
- **Drizzle ORM** with parameterized queries
- **No raw SQL** without parameterization
- **Input validation** before database operations

```typescript
// ✅ Good - Parameterized query
await db.select().from(products).where(eq(products.id, productId));

// ❌ Bad - SQL injection vulnerable
await db.execute(`SELECT * FROM products WHERE id = ${productId}`);
```

#### Data Protection
- **Encrypted connections** to database (SSL/TLS)
- **Principle of least privilege** for database users
- **Regular backups** with encryption
- **Sensitive data encryption** at rest

### XSS Prevention

#### Content Security Policy
```typescript
// Recommended CSP headers (to be implemented)
{
  "Content-Security-Policy": 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.openai.com;"
}
```

#### Output Encoding
- **React automatically escapes** content in JSX
- **DOMPurify** for sanitizing HTML (when needed)
- **Avoid dangerouslySetInnerHTML** unless absolutely necessary

```typescript
// ✅ Good - React handles escaping
<div>{userInput}</div>

// ⚠️ Use with caution - Only with sanitized input
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
```

### CSRF Protection

- **SameSite cookies** for session tokens
- **CSRF tokens** for state-changing operations (recommended)
- **Double-submit cookie pattern** for API requests

### Dependencies

#### Vulnerability Scanning
```bash
# Run regularly
npm audit

# Fix automatically when possible
npm audit fix

# Check for outdated packages
npm outdated
```

#### Update Policy
- **Critical vulnerabilities:** Patch within 24 hours
- **High severity:** Patch within 7 days
- **Medium severity:** Patch within 30 days
- **Low severity:** Patch in next release

#### Dependency Verification
- **Package-lock.json** committed to repository
- **Verify package integrity** with npm
- **Review dependencies** before adding
- **Minimize dependencies** to reduce attack surface

### Environment Variables

#### Sensitive Data
Never commit sensitive data to the repository:

```bash
# ❌ Never commit these
DATABASE_URL="postgresql://user:password@host/db"
SESSION_SECRET="my-secret-key"
OPENAI_API_KEY="sk-..."
```

#### .env File Security
```bash
# ✅ Use .env files (add to .gitignore)
# .env.example - Template without secrets
DATABASE_URL="postgresql://user:password@host/db"
SESSION_SECRET="generate-with-openssl-rand-base64-32"
OPENAI_API_KEY="your-openai-api-key"
```

#### Secret Management
- **Use environment variables** for all secrets
- **Generate strong secrets:** `openssl rand -base64 32`
- **Rotate secrets regularly**
- **Different secrets** per environment

### HTTPS/TLS

#### Production Requirements
- **HTTPS mandatory** in production
- **TLS 1.2+** only
- **HSTS header** enabled
- **Valid SSL certificate** (Let's Encrypt recommended)

```typescript
// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Logging & Monitoring

#### Security Logging
- **Authentication events** (success/failure)
- **Authorization failures**
- **Input validation failures**
- **Rate limit violations**
- **Suspicious activities**

#### What NOT to Log
- **Passwords** (even hashed)
- **Session tokens**
- **API keys**
- **Credit card numbers**
- **Other PII** (unless necessary and encrypted)

```typescript
// ✅ Good - Log without sensitive data
logger.info('User login attempt', { username: req.body.username, ip: req.ip });

// ❌ Bad - Logging sensitive data
logger.info('User login', { username, password }); // Never log passwords!
```

### PWA Security

#### Service Worker
- **Serve over HTTPS** (required for service workers)
- **Cache validation** before serving
- **Version control** for cached assets
- **Sensitive data** not cached

#### IndexedDB
- **Encrypt sensitive data** before storing
- **Clear on logout**
- **Size limits** enforced
- **Data validation** on read

## Security Best Practices for Developers

### Code Review Checklist

- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] SQL injection prevention verified
- [ ] XSS prevention implemented
- [ ] CSRF protection in place
- [ ] Error messages don't leak sensitive info
- [ ] Secrets not hardcoded
- [ ] Dependencies up to date
- [ ] Security headers configured
- [ ] Logging doesn't include sensitive data

### Secure Development Guidelines

1. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Separate concerns (read vs. write)
   - Use role-based access control

2. **Defense in Depth**
   - Multiple layers of security
   - Don't rely on single security measure
   - Validate at every layer

3. **Fail Securely**
   - Default to deny
   - Handle errors gracefully
   - Don't expose error details to users

4. **Security by Default**
   - Secure default configurations
   - Opt-in for insecure features
   - Clear security implications

5. **Don't Trust User Input**
   - Validate everything
   - Sanitize before use
   - Encode before output

## Incident Response

### In Case of Security Incident

1. **Assess the situation**
   - Determine severity and scope
   - Identify affected systems/users

2. **Contain the threat**
   - Isolate affected systems
   - Revoke compromised credentials
   - Deploy emergency patches

3. **Investigate**
   - Collect evidence
   - Determine root cause
   - Document timeline

4. **Remediate**
   - Fix vulnerability
   - Deploy patches
   - Verify fix effectiveness

5. **Communicate**
   - Notify affected users
   - Provide guidance
   - Public disclosure (coordinated)

6. **Learn and Improve**
   - Post-mortem analysis
   - Update security measures
   - Improve processes

## Security Contacts

- **Security Email:** security@flashfusion.dev (coming soon)
- **GitHub Security:** https://github.com/Krosebrook/AffordableStoreStuff/security
- **General Contact:** Via GitHub Issues (for non-security questions)

## Acknowledgments

We appreciate the security research community and will acknowledge security researchers who responsibly disclose vulnerabilities:

- Security advisories will credit researchers (unless they prefer anonymity)
- Public recognition in release notes
- Entry in our security hall of fame (coming soon)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://react.dev/learn/security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**Last Updated:** January 2026

**Version:** 1.0.0

Thank you for helping keep FlashFusion and our users safe! 🔒
