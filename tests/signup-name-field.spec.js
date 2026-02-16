import { test, expect } from '@playwright/test';

test.describe('Sign Up Page - Name Field', () => {
  test('should allow user to enter alphabetical characters into name field', async ({ page }) => {
    // Navigate to your app
    await page.goto('/');
    
    // Example test for sign up page
    // Adjust selectors based on your actual app
    
    // Wait for page to load
    await expect(page).toHaveTitle(/SpeedTesters XP/);
    
    // Navigate to sign up if needed
    // await page.click('text=Sign Up');
    
    // Find name field and enter alphabetical characters
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i]');
    await nameField.fill('John Doe');
    
    // Verify the text was entered
    await expect(nameField).toHaveValue('John Doe');
    
    // Verify only alphabetical characters are accepted
    const currentValue = await nameField.inputValue();
    expect(currentValue).toMatch(/^[A-Za-z\s]+$/);
  });

  test('should reject numeric characters in name field', async ({ page }) => {
    await page.goto('/');
    
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i]');
    
    // Try to enter numbers
    await nameField.fill('John123');
    
    // Check if validation prevents numbers (adjust based on your app's behavior)
    // This is an example - modify based on your actual validation
    const value = await nameField.inputValue();
    
    // Either the field should be empty, or show an error
    // Adjust this assertion based on your app's validation behavior
    if (value.includes('123')) {
      // If numbers are allowed to be typed but validation shows error
      const errorMessage = page.locator('text=/only alphabetical/i, .error, .invalid');
      await expect(errorMessage).toBeVisible();
    }
  });
});
