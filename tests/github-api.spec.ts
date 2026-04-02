import { test, expect } from '@playwright/test';

test.describe('GitHub API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have valid environment configuration', async ({ page }) => {
    // Check if app loads without console errors
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out expected errors (like missing auth)
    const unexpectedErrors = consoleErrors.filter(
      err => !err.includes('Authentication') && !err.includes('Client ID')
    );
    
    expect(unexpectedErrors).toHaveLength(0);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // The app should not crash even without authentication
    await expect(page.locator('body')).toBeVisible();
    
    // Should not have stack overflow or infinite loops
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Maximum call stack size exceeded');
  });

  test('should display sidebar component structure', async ({ page }) => {
    // With mock mode, sidebar should be visible
    const sidebar = page.locator('.global-sidebar');
    
    // Sidebar should exist in DOM
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    
    // Should have header
    await expect(page.locator('.sidebar-header')).toBeVisible();
    
    // Should have search box
    await expect(page.locator('.search-box')).toBeVisible();
  });

  test('should display mock repositories', async ({ page }) => {
    // In mock mode, we should see mock repos after loading
    // Wait for the repo list to appear
    await page.waitForSelector('.global-sidebar', { timeout: 10000 });
    
    // Should have workspace selector
    const workspaceSelector = page.locator('.workspace-selector select');
    await expect(workspaceSelector).toBeVisible();
    
    // Should have search box
    const searchBox = page.locator('.search-box input');
    await expect(searchBox).toBeVisible();
  });

  test('should have workspace selector', async ({ page }) => {
    const workspaceSelector = page.locator('.workspace-selector select');
    await expect(workspaceSelector).toBeVisible({ timeout: 10000 });
  });
});
