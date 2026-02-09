# Quick Start Guide

Get FlashFusion up and running in 5 minutes!

## Prerequisites Check

Before you begin, ensure you have:

```bash
# Node.js 18 or higher
node --version
# Should output: v18.x.x or higher

# npm (comes with Node.js)
npm --version
# Should output: 9.x.x or higher

# PostgreSQL (optional for local dev)
psql --version
# Should output: PostgreSQL 12+ or use Replit's built-in database
```

Don't have these installed? See [Installation Prerequisites](#installation-prerequisites) below.

## 🚀 5-Minute Setup

### Option 1: Deploy on Replit (Easiest)

1. **Import to Replit**
   - Go to [replit.com](https://replit.com)
   - Click "Create" → "Import from GitHub"
   - Paste: `https://github.com/Krosebrook/AffordableStoreStuff`
   - Click "Import from GitHub"

2. **Configure Secrets**
   - Click 🔒 "Secrets" tab
   - Add `SESSION_SECRET`: Run `openssl rand -base64 32` and paste the output
   - (Optional) Add `OPENAI_API_KEY` for AI features

3. **Run**
   - Click the green "Run" button
   - Wait for build to complete
   - Your app will open automatically!

4. **Access Your App**
   - Use the URL shown in the Webview
   - Create an account to get started

**That's it!** Your database is auto-configured on Replit. 🎉

### Option 2: Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/Krosebrook/AffordableStoreStuff.git
   cd AffordableStoreStuff
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your values
   nano .env  # or use your favorite editor
   ```

   **Minimum required in `.env`:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/flashfusion"
   SESSION_SECRET="run-openssl-rand-base64-32-to-generate"
   ```

4. **Set Up Database**
   ```bash
   # Create database
   createdb flashfusion
   
   # Push schema
   npm run db:push
   
   # (Optional) Seed with demo data
   curl -X POST http://localhost:5000/api/seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   ```
   Navigate to: http://localhost:5000
   ```

**Done!** You're now running FlashFusion locally. 🚀

## First Steps

### 1. Create Your Account

1. Click "Get Started" or navigate to `/auth`
2. Fill in your details:
   - Email address
   - Strong password (min 8 characters)
   - Full name
3. Click "Register"
4. You'll be automatically logged in!

### 2. Explore the Dashboard

After registration, you'll see the dashboard with:
- 📊 **Analytics** - Revenue, orders, and product stats
- 🛍️ **Quick Actions** - Create products, view orders
- 📈 **Charts** - Sales and performance metrics

### 3. Create Your First Product

**Manual Creation:**
1. Navigate to `/products`
2. Click "Add Product"
3. Fill in:
   - Name: "Premium T-Shirt"
   - Description: "High-quality cotton t-shirt"
   - Price: 29.99
   - Stock: 100
   - Images: [Upload or paste URL]
4. Click "Create Product"

**AI-Powered Creation** (Requires OpenAI key):
1. Navigate to `/ai-product-creator`
2. Enter product details:
   - Niche: "sustainable fashion"
   - Target audience: "eco-conscious millennials"
3. Click "Generate"
4. Review AI-generated product concept
5. Click "Create Product"

### 4. Set Up Brand Voice (Optional)

1. Navigate to `/brand-calibration`
2. Click "Create Brand Voice"
3. Fill in:
   - Name: "Professional Tech"
   - Tone: Professional, technical, concise
   - Guidelines: "Use industry terminology, be direct"
4. Save

Now all AI-generated content will match your brand!

### 5. Test the Shopping Experience

1. Go to `/products`
2. Click on a product
3. Click "Add to Cart"
4. Open cart drawer (top-right icon)
5. Click "Checkout"
6. Fill in shipping details
7. Place test order

## Common Tasks

### Add OpenAI for AI Features

1. Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add to `.env` or Replit Secrets:
   ```env
   OPENAI_API_KEY="sk-proj-..."
   ```
3. Restart server
4. AI features now active! ✨

### Install as PWA (Progressive Web App)

**Desktop (Chrome/Edge):**
1. Look for install icon in address bar
2. Click "Install FlashFusion"
3. App opens in standalone window

**Mobile (iOS Safari):**
1. Tap Share button
2. Tap "Add to Home Screen"
3. Tap "Add"
4. Launch from home screen

**Mobile (Android Chrome):**
1. Tap three-dot menu
2. Tap "Add to Home Screen"
3. Tap "Add"
4. Launch from home screen

### Enable Email Features

1. Get API key from [resend.com](https://resend.com)
2. Add to `.env`:
   ```env
   RESEND_API_KEY="re_..."
   EMAIL_FROM="noreply@yourdomain.com"
   ```
3. Restart server
4. Password reset emails now work! 📧

### Connect OAuth (Social Login)

1. Set up OAuth app on Replit
2. Add credentials to `.env`:
   ```env
   REPLIT_CLIENT_ID="your-client-id"
   REPLIT_CLIENT_SECRET="your-client-secret"
   REPLIT_CALLBACK_URL="http://localhost:5000/api/auth/replit/callback"
   ```
3. Restart server
4. Social login buttons appear on auth page

## Development Workflow

### Making Changes

```bash
# Make your changes to code
# Server auto-reloads on file changes

# Type check
npm run check

# Build for production
npm run build

# Start production server
npm start
```

### Running Tests

```bash
# Install Playwright (first time only)
npx playwright install

# Run all tests
npx playwright test

# Run specific test
npx playwright test e2e/products.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui
```

### Working with Database

```bash
# Push schema changes
npm run db:push

# Connect to database
psql $DATABASE_URL

# View tables
\dt

# View data
SELECT * FROM products;
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Database Connection Error

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL is running
pg_isready

# Start PostgreSQL (if local)
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Module Not Found

```bash
# Make sure dependencies are installed
npm install

# Check for missing dependencies
npm ls
```

### TypeScript Errors

```bash
# Run type checking
npm run check

# If types are wrong, try:
rm -rf node_modules
npm install
```

## Next Steps

Now that you're up and running:

1. **Read the Docs** - [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed info
2. **Explore API** - [API.md](./API.md) for API reference
3. **Customize UI** - See [design_guidelines.md](./design_guidelines.md)
4. **Deploy** - [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
5. **Contribute** - [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Installation Prerequisites

### Installing Node.js

**macOS:**
```bash
# Using Homebrew
brew install node@18

# Or download from nodejs.org
```

**Windows:**
```powershell
# Download installer from nodejs.org
# Or using Chocolatey
choco install nodejs-lts
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Installing PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
```powershell
# Download installer from postgresql.org
# Or using Chocolatey
choco install postgresql14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Alternative:** Use Replit (includes PostgreSQL) or cloud database:
- [Supabase](https://supabase.com) (Recommended)
- [Railway](https://railway.app)
- [Heroku Postgres](https://heroku.com/postgres)

## Getting Help

- 📖 **Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/AffordableStoreStuff/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Krosebrook/AffordableStoreStuff/issues)
- 📧 **Email**: support@flashfusion.dev (coming soon)

## Resources

- [Full Documentation](./DOCUMENTATION.md)
- [API Reference](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
- [Security Policy](./SECURITY.md)
- [Contributing](./CONTRIBUTING.md)

---

**Welcome to FlashFusion!** 🎉

We're excited to have you. If you have questions or run into issues, don't hesitate to reach out.

Happy building! 🚀
