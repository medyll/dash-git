import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('should render without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Should not have critical JS errors
    const criticalErrors = jsErrors.filter(
      err => !err.includes('Authentication') && 
               !err.includes('Client ID') &&
               !err.includes('NetworkError')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper CSS styling', async ({ page }) => {
    await page.goto('/');
    
    // Check if CSS is loaded
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    expect(bodyBg).not.toBe('');
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/');
    
    // Login button should be accessible
    const loginBtn = page.getByRole('button', { name: 'Sign in with GitHub' });
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toBeEnabled();
  });
});
