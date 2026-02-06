# Testing Guide

Comprehensive testing strategy and guidelines for FlashFusion.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [E2E Testing](#e2e-testing)
- [API Testing](#api-testing)
- [Component Testing](#component-testing)
- [Test Data](#test-data)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Testing Philosophy

### Goals

- **Confidence** - Tests should give confidence that features work
- **Fast Feedback** - Tests should run quickly
- **Maintainable** - Tests should be easy to understand and update
- **Realistic** - Tests should simulate real user behavior

### Testing Pyramid

```
         /\
        /  \  E2E Tests (Few)
       /____\
      /      \  Integration Tests (Some)
     /________\
    /          \  Unit Tests (Many - Future)
   /____________\
```

Currently, FlashFusion focuses on E2E tests with Playwright. Unit and integration tests planned for future versions.

## Testing Stack

### E2E Testing
- **Playwright** - Modern E2E testing framework
- **@playwright/test** - Test runner and assertions

### Future Testing Tools (Planned)
- **Vitest** - Unit testing
- **Testing Library** - Component testing
- **MSW** - API mocking

## Test Structure

```
AffordableStoreStuff/
├── e2e/                    # E2E tests
│   ├── auth.spec.ts        # Authentication tests
│   ├── products.spec.ts    # Product management tests
│   ├── cart.spec.ts        # Shopping cart tests
│   ├── checkout.spec.ts    # Checkout process tests
│   └── pwa.spec.ts         # PWA functionality tests
├── playwright.config.ts    # Playwright configuration
└── package.json           # Test scripts
```

## E2E Testing

### Setup

```bash
# Install Playwright and browsers (first time only)
npx playwright install

# Install specific browser
npx playwright install chromium
```

### Running E2E Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/products.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run in UI mode (interactive)
npx playwright test --ui

# Run in debug mode
npx playwright test --debug

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests matching pattern
npx playwright test -g "should add product to cart"
```

### Writing E2E Tests

#### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  // Run before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });

  test('should handle error case', async ({ page }) => {
    // Error handling test
  });
});
```

#### Authentication Tests

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill registration form
    await page.fill('[name="username"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="fullName"]', 'New User');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('[name="username"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button:has-text("Login")');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('[name="username"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

#### Product Tests

```typescript
// e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Products', () => {
  test('should display product list', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Verify at least one product is displayed
    const products = await page.locator('[data-testid="product-card"]');
    await expect(products).toHaveCount({ min: 1 });
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Click category filter
    await page.click('[data-testid="category-filter"]:has-text("Apparel")');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="category-badge"]:has-text("Apparel")')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/products');
    
    // Enter search query
    await page.fill('[data-testid="search-input"]', 't-shirt');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount({ min: 1 });
    await expect(page.locator('[data-testid="product-name"]:has-text("T-Shirt")')).toBeVisible();
  });
});
```

#### Cart Tests

```typescript
// e2e/cart.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test('should add product to cart', async ({ page }) => {
    await page.goto('/products');
    
    // Click first product
    await page.click('[data-testid="product-card"]:first-child');
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart count updated
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });

  test('should update quantity in cart', async ({ page }) => {
    // Assuming product already in cart
    await page.goto('/cart');
    
    // Increase quantity
    await page.click('[data-testid="quantity-increase"]:first-child');
    
    // Verify quantity updated
    await expect(page.locator('[data-testid="quantity-value"]:first-child')).toHaveText('2');
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/cart');
    
    const initialCount = await page.locator('[data-testid="cart-item"]').count();
    
    // Remove first item
    await page.click('[data-testid="remove-item"]:first-child');
    
    // Verify item removed
    const newCount = await page.locator('[data-testid="cart-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });
});
```

#### PWA Tests

```typescript
// e2e/pwa.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('should have service worker', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for service worker registration
    const swRegistration = await page.evaluate(async () => {
      return !!(await navigator.serviceWorker.getRegistration());
    });
    
    expect(swRegistration).toBeTruthy();
  });

  test('should work offline', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Navigate to another page
    await page.goto('/products');
    
    // Should still display content (from cache)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show offline indicator', async ({ page, context }) => {
    await page.goto('/');
    
    // Go offline
    await context.setOffline(true);
    
    // Wait for offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
  });
});
```

### Test Helpers & Utilities

#### Authentication Helper

```typescript
// e2e/helpers/auth.ts
import { Page } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  await page.goto('/auth');
  await page.fill('[name="username"]', username);
  await page.fill('[name="password"]', password);
  await page.click('button:has-text("Login")');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('button:has-text("Logout")');
  await page.waitForURL('/');
}
```

#### Using Test Helper

```typescript
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Protected Routes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password');
  });

  test('should access dashboard', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Test Configuration

`playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## API Testing

### Manual API Testing

```bash
# Using cURL
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"test@example.com","password":"password"}'

# Using HTTPie (friendlier syntax)
http POST http://localhost:5000/api/auth/login \
  username=test@example.com \
  password=password
```

### API Test with Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('should authenticate via API', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'test@example.com',
        password: 'password'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });

  test('should get products via API', async ({ request }) => {
    const response = await request.get('/api/products');
    
    expect(response.ok()).toBeTruthy();
    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
  });
});
```

## Component Testing

### Planned Component Tests (Future)

```typescript
// Using Testing Library (future)
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../components/product-card';

test('ProductCard displays product information', () => {
  const product = {
    id: 1,
    name: 'Test Product',
    price: '29.99',
    images: ['test.jpg']
  };
  
  render(<ProductCard product={product} />);
  
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('$29.99')).toBeInTheDocument();
});
```

## Test Data

### Test Database Setup

```bash
# Create test database
createdb flashfusion_test

# Set test DATABASE_URL
export DATABASE_URL="postgresql://user:pass@localhost/flashfusion_test"

# Push schema
npm run db:push

# Seed test data
npm run seed:test
```

### Test Fixtures

```typescript
// e2e/fixtures/products.ts
export const testProducts = [
  {
    name: 'Test Product 1',
    description: 'Test description',
    price: '29.99',
    stock: 100
  },
  {
    name: 'Test Product 2',
    description: 'Another test',
    price: '39.99',
    stock: 50
  }
];
```

### Using Fixtures

```typescript
import { test } from '@playwright/test';
import { testProducts } from './fixtures/products';

test('should create product', async ({ page, request }) => {
  // Create via API
  await request.post('/api/products', {
    data: testProducts[0]
  });
  
  // Verify in UI
  await page.goto('/products');
  // ...assertions
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run tests
        run: npx playwright test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost/postgres
          SESSION_SECRET: test-secret
          
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Reporting

```bash
# Generate HTML report
npx playwright show-report

# Generate JSON report
npx playwright test --reporter=json

# Multiple reporters
npx playwright test --reporter=html --reporter=json
```

## Best Practices

### General Testing Best Practices

1. **Test User Behavior** - Test what users do, not implementation
2. **Independent Tests** - Each test should be independent
3. **Clear Test Names** - Use descriptive test names
4. **Arrange-Act-Assert** - Follow AAA pattern
5. **Avoid Test Flakiness** - Use proper waits, not arbitrary timeouts

### Playwright Best Practices

```typescript
// ✅ Good - Wait for element to be ready
await page.click('button:has-text("Submit")');

// ❌ Bad - Arbitrary timeout
await page.waitForTimeout(1000);
await page.click('button');

// ✅ Good - Specific selector
await page.click('[data-testid="submit-button"]');

// ❌ Bad - Fragile selector
await page.click('body > div > div > button:nth-child(3)');

// ✅ Good - Wait for network to be idle
await page.goto('/products', { waitUntil: 'networkidle' });

// ❌ Bad - Don't wait for anything
await page.goto('/products');
```

### Test Data Management

```typescript
// ✅ Good - Create test data per test
test('should create order', async ({ page, request }) => {
  // Create product
  const product = await request.post('/api/products', {...});
  
  // Add to cart
  await request.post('/api/cart', { productId: product.id });
  
  // Create order
  await page.goto('/checkout');
  // ...
});

// ❌ Bad - Rely on existing data
test('should create order', async ({ page }) => {
  // Assumes product with ID 1 exists
  await page.goto('/products/1');
  // ...
});
```

### Error Handling

```typescript
test('should handle network error', async ({ page, context }) => {
  // Setup error condition
  await context.route('**/api/products', route => 
    route.abort('failed')
  );
  
  await page.goto('/products');
  
  // Verify error handling
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

## Code Coverage

### Setup Coverage (Future)

```bash
npm install --save-dev @vitest/coverage-v8

# Run with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Goals

- **Target**: 80% coverage
- **Critical paths**: 100% coverage
- **New features**: 90%+ coverage

## Performance Testing

### Lighthouse CI (Future)

```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

### Performance Budgets

```json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 300 },
        { "resourceType": "total", "budget": 1000 }
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

**Tests timing out:**
```typescript
// Increase timeout for slow tests
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

**Flaky tests:**
```typescript
// Use proper waits
await page.waitForSelector('[data-testid="element"]');
await page.click('[data-testid="element"]');

// Not:
await page.waitForTimeout(1000);
await page.click('[data-testid="element"]');
```

**Authentication issues:**
```typescript
// Ensure cookies are saved
const context = await browser.newContext({
  storageState: 'auth.json'
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [Test Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** January 2026
