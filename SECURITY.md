# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in AffordableStoreStuff, please report it responsibly.

**Email:** privacy@affordablestorestuff.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and aim to resolve critical issues within 7 days.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |

## Security Practices

### Authentication
- Passwords are hashed using bcrypt with a cost factor of 10
- No plaintext passwords are stored or transmitted

### Data in Transit
- All API communication uses HTTPS (TLS 1.2+)
- CORS is configured to allow only known origins

### Data at Rest
- Database hosted on Supabase with encryption at rest
- Connection pooling via Supabase pooler (port 6543)

### Secrets Management
- All secrets are stored as environment variables (Vercel dashboard or EAS secrets)
- `.env` files are gitignored and never committed
- Service account keys (`play-store-key.json`) are gitignored

### Third-Party Services
- **OpenAI**: API key stored as env var, no user data persisted by OpenAI
- **Stripe**: PCI-compliant payment processing, webhook signatures verified
- **Supabase**: SOC 2 Type II compliant database hosting

### Dependencies
- Run `npm audit` regularly to check for known vulnerabilities
- Keep dependencies updated with `npm update`
