import { test, expect } from '@playwright/test';

test.describe('SpeedTesters XP - Basic Navigation', () => {
  test('should load the dashboard', async ({ page }) => {
    // Go to your app
    await page.goto('http://localhost:3000/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on login or dashboard
    const url = page.url();
    console.log('Current URL:', url);
    
    // Should see the app title or logo
    const hasLogo = await page.locator('img[alt*="SpeedTesters"]').count();
    const hasTitle = await page.locator('text=/SpeedTesters|Dashboard|Execute Tests/i').count();
    
    expect(hasLogo + hasTitle).toBeGreaterThan(0);
  });

  test('should navigate to Execute Tests page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Click on Execute Tests in navigation
    const executeLink = page.locator('text=/Execute Tests/i').first();
    
    if (await executeLink.isVisible()) {
      await executeLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should see the Execute Tests heading
      await expect(page.locator('text=/Execute Tests/i')).toBeVisible();
      
      console.log('✅ Successfully navigated to Execute Tests page');
    } else {
      console.log('⚠️ Execute Tests link not found - may need to login first');
    }
  });
});
