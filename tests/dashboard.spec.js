import { test, expect } from '@playwright/test';

test.describe('SpeedTesters XP - Dashboard', () => {
  // Login helper
  async function login(page) {
    await page.goto('http://localhost:3000/');
    await page.waitForURL(/login/);
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@speedtestersxp.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"], button:has-text("Login")').click();
    await page.waitForURL(/^(?!.*login).*$/);
  }

  test('should display dashboard after login', async ({ page }) => {
    await login(page);
    
    // Should be on dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    console.log('✅ Dashboard loaded after login');
  });

  test('should show navigation menu', async ({ page }) => {
    await login(page);
    
    // Should see all navigation links
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
    await expect(page.locator('text=Test Folders').first()).toBeVisible();
    await expect(page.locator('text=Execute Tests').first()).toBeVisible();
    await expect(page.locator('text=Test History').first()).toBeVisible();
    
    console.log('✅ Navigation menu is complete');
  });

  test('should display user info and logout button', async ({ page }) => {
    await login(page);
    
    // Should see logout button (using proper selector)
    await expect(page.locator('button:has-text("Logout")').first()).toBeVisible();
    
    console.log('✅ User controls are visible');
  });

  test('should show dashboard statistics or content', async ({ page }) => {
    await login(page);
    
    // Wait for dashboard to fully load
    await page.waitForTimeout(1000);
    
    // Should see some dashboard content
    const hasStats = await page.locator('.card, [class*="stat"], [class*="metric"]').count() > 0;
    const hasContent = await page.locator('text=/Recent|Total|Folders|Tests/i').count() > 0;
    
    expect(hasStats || hasContent).toBeTruthy();
    
    console.log('✅ Dashboard content is displayed');
  });

  test('should navigate between pages using menu', async ({ page }) => {
    await login(page);
    
    // Test navigation to each page
    const pages = [
      { link: 'Test Folders', heading: /Test Folders/i },
      { link: 'Execute Tests', heading: /Execute Tests/i },
      { link: 'Test History', heading: /Test History/i },
      { link: 'Dashboard', heading: 'Dashboard' }
    ];
    
    for (const { link, heading } of pages) {
      await page.locator(`text=${link}`).first().click();
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      console.log(`✅ Navigated to ${link}`);
    }
  });
});
