import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });
  
  test('should display login form', async ({ page }) => {
    // Check that the page title contains appropriate text
    await expect(page).toHaveTitle(/Login | CancerGenix/);
    
    // Verify login form elements
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const loginButton = page.getByRole('button', { name: /login/i });
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });
  
  test('should show validation errors with empty form submission', async ({ page }) => {
    // Try to submit the form without entering data
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check for validation error messages
    const errorMessages = page.getByText(/required|cannot be empty/i);
    await expect(errorMessages).toBeVisible();
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Click the login button
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check for error message about invalid credentials
    const errorMessage = page.getByText(/invalid email or password/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 }); // Allow time for form submission
  });
  
  test('should navigate to homepage on successful login', async ({ page }) => {
    // Mock the authentication API response
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          user: { 
            id: '1', 
            name: 'Test User',
            role: 'clinician',
            token: 'fake-jwt-token'
          }
        })
      });
    });
    
    // Enter valid credentials
    await page.getByLabel(/email/i).fill('clinician@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Click the login button
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check that we're redirected to the expected page after login
    await expect(page).toHaveURL('/', { timeout: 5000 });
    
    // Verify user is logged in by checking for welcome message and logout button
    const welcomeText = page.getByText(/welcome, test user/i);
    const logoutButton = page.getByRole('button', { name: /logout/i });
    
    await expect(welcomeText).toBeVisible();
    await expect(logoutButton).toBeVisible();
  });
});