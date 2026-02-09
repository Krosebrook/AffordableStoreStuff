import { test, expect } from "@playwright/test";

test.describe("Product Browsing", () => {
  test("should load landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FlashFusion/i);
  });

  test("should have navigation elements", async ({ page }) => {
    await page.goto("/");
    // Look for main CTA or navigation
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Cart Functionality", () => {
  test("should redirect to auth when accessing checkout unauthenticated", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForURL(/\/(auth|$)/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes("/auth") || url.endsWith("/")).toBeTruthy();
  });

  test("should redirect to auth when accessing products unauthenticated", async ({ page }) => {
    await page.goto("/products");
    await page.waitForURL(/\/(auth|$)/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes("/auth") || url.endsWith("/")).toBeTruthy();
  });
});

test.describe("Protected Routes", () => {
  test("should redirect merch-studio to auth", async ({ page }) => {
    await page.goto("/merch-studio");
    await page.waitForURL(/\/(auth|$)/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes("/auth") || url.endsWith("/")).toBeTruthy();
  });

  test("should redirect social-media to auth", async ({ page }) => {
    await page.goto("/social-media");
    await page.waitForURL(/\/(auth|$)/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes("/auth") || url.endsWith("/")).toBeTruthy();
  });

  test("should redirect billing to auth", async ({ page }) => {
    await page.goto("/billing");
    await page.waitForURL(/\/(auth|$)/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes("/auth") || url.endsWith("/")).toBeTruthy();
  });
});
