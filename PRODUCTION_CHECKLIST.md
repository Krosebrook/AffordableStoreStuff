# Production Deployment Checklist

This checklist ensures FlashFusion is ready for production deployment to Replit, Google Play, or other platforms.

## ✅ Pre-Deployment Security Checklist

### Critical Security Configuration

- [ ] **Environment Variables Set**
  - [ ] `SESSION_SECRET` set (minimum 32 characters, use `openssl rand -base64 32`)
  - [ ] `DATABASE_URL` configured with production database
  - [ ] `NODE_ENV=production` set
  - [ ] `TRUST_PROXY=true` if behind a reverse proxy (Replit, Nginx, etc.)
  - [ ] `ALLOWED_ORIGINS` configured with your production domain(s)

- [ ] **API Keys Secured**
  - [ ] OpenAI API key set in `OPENAI_API_KEY` (if using AI features)
  - [ ] Resend API key set in `RESEND_API_KEY` (if using email)
  - [ ] All API keys stored in secrets/environment (NOT in code)

- [ ] **Database Security**
  - [ ] Production database using SSL (`?sslmode=require` in connection string)
  - [ ] Database user has minimum required permissions
  - [ ] Database backups configured
  - [ ] Connection pooling configured appropriately

- [ ] **Session Security**
  - [ ] Session secret is unique and strong (not default/dev value)
  - [ ] Session cookies set to `secure: true` in production
  - [ ] Session max age appropriate for your use case (default: 7 days)

### Network Security

- [ ] **HTTPS Configuration**
  - [ ] HTTPS enabled on production domain
  - [ ] HTTP to HTTPS redirect working
  - [ ] SSL certificate valid and not expiring soon

- [ ] **CORS Configuration**
  - [ ] `ALLOWED_ORIGINS` set to specific domains (avoid `*` wildcard)
  - [ ] Credentials enabled only for trusted origins
  - [ ] Test cross-origin requests work as expected

- [ ] **Rate Limiting**
  - [ ] Rate limiting enabled for API endpoints (100 req/15min)
  - [ ] Stricter limits on auth endpoints (5 req/15min)
  - [ ] Health check endpoint excluded from rate limiting

### Content Security

- [ ] **Content Security Policy**
  - [ ] CSP headers configured appropriately
  - [ ] `script-src` allows only necessary sources
  - [ ] `frame-ancestors` set to `'none'` to prevent clickjacking
  - [ ] Test that app works with CSP enabled

- [ ] **Security Headers** (via Helmet.js)
  - [ ] HSTS enabled with 1-year max-age
  - [ ] X-Frame-Options set
  - [ ] X-Content-Type-Options set to nosniff
  - [ ] Referrer-Policy configured

## 🔒 Code Security Review

- [ ] **No Hardcoded Secrets**
  - [ ] No API keys in code
  - [ ] No passwords in code
  - [ ] No tokens in code
  - [ ] `.env` file in `.gitignore`

- [ ] **Input Validation**
  - [ ] All user inputs validated with Zod schemas
  - [ ] SQL injection prevention via ORM (Drizzle)
  - [ ] XSS prevention via React's built-in escaping

- [ ] **Authentication & Authorization**
  - [ ] Password hashing using bcrypt (12 rounds)
  - [ ] Password reset tokens time-limited (1 hour)
  - [ ] Protected routes require authentication
  - [ ] User permissions checked on sensitive operations

- [ ] **Logging & Monitoring**
  - [ ] Sensitive data not logged (passwords, tokens, etc.)
  - [ ] Error messages don't expose system details
  - [ ] Structured logging implemented (consider adding)
  - [ ] Error tracking service configured (Sentry recommended)

## 📱 Mobile/PWA Configuration

- [ ] **Progressive Web App**
  - [ ] `manifest.json` configured with correct URLs and icons
  - [ ] Service worker registered and functional
  - [ ] Offline page available
  - [ ] App installable on mobile devices

- [ ] **Mobile Optimization**
  - [ ] Responsive design tested on mobile devices
  - [ ] Touch targets appropriately sized (min 44x44px)
  - [ ] Viewport meta tag configured
  - [ ] Mobile performance optimized (lazy loading, etc.)

- [ ] **For Google Play Deployment (via TWA)**
  - [ ] Digital Asset Links file configured
  - [ ] App manifest includes all required fields
  - [ ] Icons in all required sizes (192x192, 512x512)
  - [ ] Screenshots and app store listing prepared

## 🚀 Performance & Optimization

- [ ] **Build Optimization**
  - [ ] Production build tested (`npm run build`)
  - [ ] Bundle size reasonable (check build output)
  - [ ] Code splitting implemented (Vite handles automatically)
  - [ ] Unused dependencies removed

- [ ] **Compression & Caching**
  - [ ] Compression middleware enabled (gzip/brotli)
  - [ ] Static assets have cache headers
  - [ ] Service worker caching strategy appropriate

- [ ] **Database Optimization**
  - [ ] Database indexes created for frequently queried fields
  - [ ] Connection pool size appropriate for load
  - [ ] Slow queries identified and optimized

## 🔍 Testing & Quality Assurance

- [ ] **Functional Testing**
  - [ ] All critical user flows tested manually
  - [ ] E2E tests passing (`npx playwright test`)
  - [ ] Authentication flow works correctly
  - [ ] Payment/checkout flow tested (if applicable)

- [ ] **Security Testing**
  - [ ] Run CodeQL security scan
  - [ ] Run `npm audit` and fix vulnerabilities
  - [ ] Test authentication bypass attempts
  - [ ] Test rate limiting enforcement

- [ ] **Performance Testing**
  - [ ] Load testing performed for expected traffic
  - [ ] Database queries optimized
  - [ ] Memory leaks checked
  - [ ] Response times acceptable

## 📊 Monitoring & Observability

- [ ] **Application Monitoring**
  - [ ] Health check endpoint accessible (`/api/health`)
  - [ ] Uptime monitoring configured (UptimeRobot, Pingdom, etc.)
  - [ ] Error tracking service configured (Sentry, Rollbar, etc.)
  - [ ] Performance monitoring (New Relic, DataDog, etc.)

- [ ] **Database Monitoring**
  - [ ] Database health checks configured
  - [ ] Slow query logging enabled
  - [ ] Connection pool monitoring
  - [ ] Backup verification automated

- [ ] **Logging**
  - [ ] Log aggregation service configured
  - [ ] Log retention policy defined
  - [ ] Alert rules configured for critical errors
  - [ ] Structured logging format used

## 📝 Documentation

- [ ] **Deployment Documentation**
  - [ ] Environment variables documented in `.env.example`
  - [ ] Deployment steps documented in `DEPLOYMENT.md`
  - [ ] Rollback procedures documented
  - [ ] Incident response plan created

- [ ] **API Documentation**
  - [ ] API endpoints documented in `API.md`
  - [ ] Authentication requirements clear
  - [ ] Rate limits documented
  - [ ] Error responses documented

- [ ] **User Documentation**
  - [ ] README.md updated with current features
  - [ ] User guide available
  - [ ] FAQ created for common issues
  - [ ] Support contact information provided

## 🔄 Continuous Operations

- [ ] **Backup & Recovery**
  - [ ] Database backup schedule configured (daily recommended)
  - [ ] Backup restoration tested
  - [ ] Disaster recovery plan documented
  - [ ] Data retention policy defined

- [ ] **Updates & Maintenance**
  - [ ] Dependency update schedule planned
  - [ ] Security patch process defined
  - [ ] Maintenance window schedule defined
  - [ ] User communication plan for downtime

## 🌍 Compliance & Legal

- [ ] **Data Privacy**
  - [ ] GDPR compliance checked (if applicable)
  - [ ] Privacy policy published
  - [ ] Cookie consent implemented (if required)
  - [ ] Data retention policy documented

- [ ] **Terms of Service**
  - [ ] Terms of service published
  - [ ] User agreement acceptance flow
  - [ ] Refund/cancellation policy clear

- [ ] **Accessibility**
  - [ ] WCAG 2.1 AA compliance checked
  - [ ] Screen reader compatibility tested
  - [ ] Keyboard navigation supported

## Platform-Specific Checklists

### Replit Deployment

- [ ] `.replit` file configured correctly
- [ ] Secrets configured in Replit Secrets tab
- [ ] Database auto-provisioned or external DB configured
- [ ] Custom domain configured (if applicable)
- [ ] Replit deployment settings configured

### Google Play (via TWA)

- [ ] TWA manifest generated
- [ ] Signing key created and secured
- [ ] Google Play Console account created
- [ ] App listing complete with descriptions and screenshots
- [ ] Privacy policy URL provided
- [ ] Content rating completed
- [ ] Digital Asset Links verified

## Final Pre-Launch Steps

- [ ] **Final Testing in Production-Like Environment**
  - [ ] All features tested in staging
  - [ ] Performance under load tested
  - [ ] Security scan completed
  - [ ] Mobile devices tested

- [ ] **Launch Readiness**
  - [ ] On-call schedule defined
  - [ ] Monitoring dashboards created
  - [ ] Alert recipients configured
  - [ ] Rollback plan ready

- [ ] **Post-Launch**
  - [ ] Monitor application health for 24-48 hours
  - [ ] Check error rates and performance metrics
  - [ ] Verify backups running successfully
  - [ ] User feedback collection plan active

---

## Quick Security Verification Commands

```bash
# Check environment variables are set
env | grep -E "SESSION_SECRET|DATABASE_URL|NODE_ENV"

# Test the health check endpoint
curl https://your-domain.com/api/health

# Check for security vulnerabilities
npm audit

# Test production build
npm run build && npm start

# Run E2E tests
npx playwright test

# Check database connection
psql $DATABASE_URL -c "SELECT version();"
```

## Emergency Contacts

- **Technical Lead**: [Add contact]
- **Database Admin**: [Add contact]
- **Security Team**: [Add contact]
- **DevOps**: [Add contact]

## Resources

- [SECURITY.md](./SECURITY.md) - Security guidelines
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [API.md](./API.md) - API documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
