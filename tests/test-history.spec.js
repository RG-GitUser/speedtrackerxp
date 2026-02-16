import { test, expect } from '@playwright/test';

test.describe('SpeedTesters XP - Test History', () => {
  // Login helper
  async function login(page) {
    await page.goto('http://localhost:3000/');
    await page.waitForURL(/login/);
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@speedtestersxp.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"], button:has-text("Login")').click();
    await page.waitForURL(/^(?!.*login).*$/);
  }

  test('should navigate to Test History page', async ({ page }) => {
    await login(page);
    
    // Click on Test History link
    await page.locator('text=/Test History/i').first().click();
    
    // Should see Test History heading
    await expect(page.getByRole('heading', { name: /Test History/i }).first()).toBeVisible();
    
    console.log('✅ Navigated to Test History page');
  });

  test('should display test run history or empty state', async ({ page }) => {
    await login(page);
    await page.locator('text=/Test History/i').first().click();
    
    // Wait for history to load
    await page.waitForTimeout(1000);
    
    // Should see either test runs or empty state
    const hasRuns = await page.locator('.card, [class*="run"]').count() > 0;
    const hasEmptyState = await page.locator('text=/No test runs/i, text=/no history/i').isVisible();
    
    expect(hasRuns || hasEmptyState).toBeTruthy();
    
    if (hasRuns) {
      console.log('✅ Test run history displayed');
    } else {
      console.log('✅ Empty state displayed (no history)');
    }
  });
});
