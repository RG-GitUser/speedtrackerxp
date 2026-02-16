import { test, expect } from '@playwright/test';

test.describe('SpeedTesters XP - Login and Dashboard', () => {
  test('should load the login page successfully', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000/');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Should see login form elements
    await expect(page.locator('input[type="email"], input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Login")')).toBeVisible();
    
    console.log('✅ Login page loaded successfully');
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Wait for login page
    await page.waitForURL(/login/);
    
    // Fill in admin credentials
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@speedtestersxp.com');
    await page.locator('input[type="password"]').fill('admin123');
    
    // Click login button
    await page.locator('button[type="submit"], button:has-text("Login")').click();
    
    // Should navigate away from login
    await page.waitForURL(/^(?!.*login).*$/);
    
    // Should see dashboard heading
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    console.log('✅ Successfully logged in as admin');
  });

  test('should navigate to Execute Tests page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Login first
    await page.waitForURL(/login/);
    await page.locator('input[type="email"], input[type="text"]').first().fill('admin@speedtestersxp.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"], button:has-text("Login")').click();
    
    // Wait for login to complete
    await page.waitForURL(/^(?!.*login).*$/);
    
    // Click on Execute Tests link
    await page.locator('text=/Execute Tests/i').first().click();
    
    // Should see Execute Tests heading
    await expect(page.getByRole('heading', { name: /Execute Tests/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Select Tests' })).toBeVisible();
    
    console.log('✅ Navigated to Execute Tests page');
  });
});
