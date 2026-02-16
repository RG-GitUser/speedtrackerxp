import { test, expect } from '@playwright/test';

test.describe('SpeedTesters XP - Test Folders Management', () => {
  // Login helper
  async function login(page) {
    await page.goto('http://localhost:3000/');
    await page.waitForURL(/login/);
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@speedtestersxp.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"], button:has-text("Login")').click();
    await page.waitForURL(/^(?!.*login).*$/);
  }

  test('should navigate to Test Folders page', async ({ page }) => {
    await login(page);
    
    // Click on Test Folders link
    await page.locator('text=/Test Folders/i').first().click();
    
    // Should see Test Folders page
    await expect(page.getByRole('heading', { name: /Test Folders/i }).first()).toBeVisible();
    
    console.log('✅ Navigated to Test Folders page');
  });

  test('should display existing folders', async ({ page }) => {
    await login(page);
    await page.locator('text=/Test Folders/i').first().click();
    
    // Wait for folders to load
    await page.waitForTimeout(1000);
    
    // Should see folder list or empty state
    const hasFolder = await page.locator('.card').count() > 0;
    
    if (hasFolder) {
      console.log('✅ Folders are displayed');
    } else {
      console.log('✅ Empty state displayed (no folders)');
    }
    
    expect(hasFolder || await page.locator('text=/No folders/i').isVisible()).toBeTruthy();
  });

  test('should see New Folder button (admin only)', async ({ page }) => {
    await login(page);
    await page.locator('text=/Test Folders/i').first().click();
    
    // Admin should see New Folder button
    const newFolderButton = page.locator('button:has-text("New Folder"), button:has-text("Add Folder")');
    
    await expect(newFolderButton).toBeVisible();
    
    console.log('✅ New Folder button is visible for admin');
  });
});
