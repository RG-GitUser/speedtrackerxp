import { test, expect } from '@playwright/test';

test.describe('SpeedTesters XP - Test Execution Flow', () => {
  // Login helper
  async function login(page) {
    await page.goto('http://localhost:3000/');
    await page.waitForURL(/login/);
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@speedtestersxp.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"], button:has-text("Login")').click();
    await page.waitForURL(/^(?!.*login).*$/);
  }

  test('should display execute tests page with selection controls', async ({ page }) => {
    await login(page);
    
    // Navigate to Execute Tests
    await page.locator('text=/Execute Tests/i').first().click();
    
    // Should see main elements
    await expect(page.getByRole('heading', { name: /Execute Tests/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Select Tests' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Test Results' })).toBeVisible();
    
    console.log('✅ Execute Tests page loaded correctly');
  });

  test('should show Playwright mode toggle', async ({ page }) => {
    await login(page);
    await page.locator('text=/Execute Tests/i').first().click();
    
    // Look for Playwright checkbox
    const playwrightToggle = page.locator('text=/Use Playwright/i, input[type="checkbox"]');
    
    await expect(playwrightToggle.first()).toBeVisible();
    
    console.log('✅ Playwright mode toggle is visible');
  });

  test('should display folder dropdown for test selection', async ({ page }) => {
    await login(page);
    await page.locator('text=/Execute Tests/i').first().click();
    
    // Should see folder selection dropdown
    const folderDropdown = page.locator('select, text=/Choose Folder/i');
    
    await expect(folderDropdown.first()).toBeVisible();
    
    console.log('✅ Folder dropdown is visible');
  });

  test('should show test results placeholder initially', async ({ page }) => {
    await login(page);
    await page.locator('text=/Execute Tests/i').first().click();
    
    // Should see placeholder message
    await expect(page.locator('text=/Select tests and click.*Run.*to see results/i')).toBeVisible();
    
    console.log('✅ Test results placeholder is shown');
  });
});
