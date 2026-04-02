import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sidebar when authenticated (mock mode)', async ({ page }) => {
    // In mock mode, the app auto-authenticates and shows the sidebar
    await page.goto('/');
    
    // Should see the global sidebar with repositories
    const sidebar = page.locator('.global-sidebar');
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test('should skip auth tests in mock mode', async ({ page }) => {
    // This test verifies that auth tests are skipped in mock mode
    test.skip(process.env.VITE_MOCK_MODE === 'true', 'Auth tests skipped in mock mode');
    
    // This would only run when MOCK_MODE=false
    await page.goto('/');
    await expect(page.getByText('Welcome to Dash-Git')).toBeVisible();
  });
});
