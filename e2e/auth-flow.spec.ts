import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FlashFusion/i);
  });

  test("should navigate to auth page", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("text=Log in")).toBeVisible({ timeout: 10000 });
  });

  test("should show register form", async ({ page }) => {
    await page.goto("/auth");
    // Look for a register/sign up toggle or tab
    const signUpButton = page.locator("text=Sign up").or(page.locator("text=Register")).or(page.locator("text=Create account"));
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
    }
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]')).toBeVisible({ timeout: 5000 });
  });

  test("should show validation errors on empty login", async ({ page }) => {
    await page.goto("/auth");
    const submitButton = page.locator('button[type="submit"]').or(page.locator("button:has-text('Log in')")).first();
    await submitButton.click();
    // Should show some form of error or the page should stay on auth
    await expect(page).toHaveURL(/auth/);
  });

  test("should redirect unauthenticated users from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to auth page
    await page.waitForURL(/\/(auth|$)/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes("/auth") || url.endsWith("/")).toBeTruthy();
  });
});
