import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Check that the page title contains the app name
    await expect(page).toHaveTitle(/CancerGenix/);
    
    // Check that the header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for the main logo/brand name
    const logo = page.getByRole('link', { name: /CancerGenix/i });
    await expect(logo).toBeVisible();
    
    // Check for the welcome section
    const welcomeSection = page.getByRole('heading', { name: /Welcome to CancerGenix/i }).first();
    await expect(welcomeSection).toBeVisible();
    
    // Check for login link when not authenticated
    const loginLink = page.getByRole('link', { name: /Login/i });
    await expect(loginLink).toBeVisible();
  });
  
  test('should have working navigation links', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Check home link works
    const homeLink = page.getByRole('link', { name: /Home/i });
    await expect(homeLink).toBeVisible();
    
    // Check login link navigates correctly
    const loginLink = page.getByRole('link', { name: /Login/i });
    await loginLink.click();
    
    // After clicking login, should be on login page
    await expect(page).toHaveURL(/.*\/login/);
  });
  
  test('should display proper responsive layout', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Test on mobile viewport
    await page.setViewportSize({ width: 414, height: 896 }); // iPhone X size
    await expect(page.locator('header')).toBeVisible();
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await expect(page.locator('header')).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await expect(page.locator('header')).toBeVisible();
  });
});