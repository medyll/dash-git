import { test, expect } from '@playwright/test';

test.describe('PAT Authentication', () => {
  test('should show token input button', async ({ page }) => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Should see the welcome message
    await expect(page.locator('h1:has-text("Welcome to Dash-Git")')).toBeVisible();
    
    // Should see the "Enter Personal Access Token" button
    const tokenButton = page.locator('button:has-text("Enter Personal Access Token")');
    await expect(tokenButton).toBeVisible();
    
    console.log('Token input button visible');
    
    // Click to show token input
    await tokenButton.click();
    await page.waitForTimeout(500);
    
    // Should see token input field
    const tokenInput = page.locator('#pat-input');
    await expect(tokenInput).toBeVisible();
    
    console.log('Token input field visible');
    
    // Should see help text with link
    const helpLink = page.locator('a[href*="github.com/settings/tokens"]');
    await expect(helpLink).toBeVisible();
    
    console.log('Help link visible');
    
    // Screenshot
    await page.screenshot({ path: 'test-results/pat-auth-ui.png', fullPage: true });
  });
});
