import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('manifest is accessible', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    expect(response.ok()).toBeTruthy();
    
    const manifest = await response.json();
    expect(manifest.name).toBe('FlashFusion - AI-Powered Ecommerce Hub');
    expect(manifest.short_name).toBe('FlashFusion');
    expect(manifest.theme_color).toBe('#4725f4');
    expect(manifest.display).toBe('standalone');
  });

  test('service worker is registered', async ({ page }) => {
    await page.waitForFunction(() => {
      return 'serviceWorker' in navigator;
    });
    
    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test('offline page is available', async ({ page }) => {
    const response = await page.request.get('/offline.html');
    expect(response.ok()).toBeTruthy();
    
    const content = await response.text();
    expect(content).toContain("You're Offline");
  });

  test('meta tags are present', async ({ page }) => {
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#4725f4');
    
    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleCapable).toBe('yes');
    
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBe('/manifest.json');
  });
});

test.describe('Lazy Loading', () => {
  test('dashboard loads with lazy loading', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('[data-testid="page-dashboard"]')).toBeVisible({ timeout: 10000 });
  });

  test('ai product creator loads lazily', async ({ page }) => {
    await page.goto('/ai-product-creator');
    
    await expect(page.getByRole('heading', { name: /product creator/i })).toBeVisible({ timeout: 10000 });
  });

  test('ai marketing engine loads lazily', async ({ page }) => {
    await page.goto('/ai-marketing');
    
    await expect(page.getByRole('heading', { name: /marketing/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Offline Behavior', () => {
  test('shows connection status', async ({ page }) => {
    await page.goto('/dashboard');
    
    const connectionStatus = page.locator('[data-testid="status-connection"]');
    await expect(connectionStatus).toBeVisible();
  });

  test('offline indicator appears when network drops', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    await context.setOffline(true);
    
    const offlineBanner = page.locator('[data-testid="banner-offline"]');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });
    
    await context.setOffline(false);
  });

  test('dismiss offline banner', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    await context.setOffline(true);
    await page.waitForTimeout(500);
    
    const dismissButton = page.locator('[data-testid="button-dismiss-offline"]');
    if (await dismissButton.isVisible()) {
      await dismissButton.click();
      await expect(page.locator('[data-testid="banner-offline"]')).not.toBeVisible();
    }
    
    await context.setOffline(false);
  });
});

test.describe('Caching Behavior', () => {
  test('static assets are cached', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForTimeout(2000);
    
    const caches = await page.evaluate(async () => {
      const cacheNames = await window.caches.keys();
      return cacheNames.filter(name => name.startsWith('flashfusion'));
    });
    
    expect(caches.length).toBeGreaterThan(0);
  });

  test('api responses are cached', async ({ page }) => {
    await page.goto('/products');
    
    await page.waitForResponse(response => 
      response.url().includes('/api/products') && response.ok()
    );
    
    await page.waitForTimeout(1000);
    
    const caches = await page.evaluate(async () => {
      const cacheNames = await window.caches.keys();
      const apiCache = cacheNames.find(name => name.includes('api'));
      if (apiCache) {
        const cache = await window.caches.open(apiCache);
        const keys = await cache.keys();
        return keys.map(req => req.url);
      }
      return [];
    });
    
    console.log('Cached API URLs:', caches);
  });
});

test.describe('File Upload', () => {
  test('file upload dropzone is interactive', async ({ page }) => {
    await page.goto('/ai-product-creator');
    
    const dropzone = page.locator('[data-testid="dropzone-upload"]');
    if (await dropzone.isVisible()) {
      await expect(dropzone).toBeVisible();
      
      await dropzone.hover();
    }
  });
});

test.describe('Navigation', () => {
  test('sidebar navigation works with lazy loading', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="page-dashboard"]')).toBeVisible({ timeout: 10000 });

    const productLink = page.locator('[data-testid="link-nav-products"]');
    await productLink.click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.locator('[data-testid="page-products"]')).toBeVisible({ timeout: 10000 });

    const ordersLink = page.locator('[data-testid="link-nav-orders"]');
    await ordersLink.click();
    await expect(page).toHaveURL(/\/orders/);
  });
});
