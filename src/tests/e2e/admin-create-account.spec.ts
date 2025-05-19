import { test, expect } from '@playwright/test';

test.describe('Admin Create Account Page', () => {
  // Setup authentication before tests with super_admin role
  test.beforeEach(async ({ page }) => {
    // Mock authentication state by setting localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('genascopeUser', JSON.stringify({
        id: '4',
        name: 'Super Admin',
        role: 'super_admin',
        token: 'fake-jwt-token'
      }));
    });
    
    // Navigate to admin create account page
    await page.goto('/admin/create-account');
  });
  
  test('should restrict access to non-super-admin users', async ({ page }) => {
    // Set regular admin role instead of super_admin
    await page.evaluate(() => {
      localStorage.setItem('genascopeUser', JSON.stringify({
        id: '3',
        name: 'Regular Admin',
        role: 'admin',
        token: 'fake-jwt-token'
      }));
    });
    
    // Try to access create account page
    await page.goto('/admin/create-account');
    
    // Should be redirected or shown access denied
    const accessDenied = page.getByText(/access denied|unauthorized|not authorized/i);
    await expect(accessDenied).toBeVisible();
  });
  
  test('should display account creation form', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Create Account | Genascope/);
    
    // Check form heading
    const heading = page.getByRole('heading', { name: /create account/i });
    await expect(heading).toBeVisible();
    
    // Check form fields
    const accountNameInput = page.getByLabel(/account name/i);
    const adminEmailInput = page.getByLabel(/admin email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /create account/i });
    
    await expect(accountNameInput).toBeVisible();
    await expect(adminEmailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });
  
  test('should validate form fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /create account/i });
    await submitButton.click();
    
    // Check for validation messages
    const validationErrors = page.getByText(/required|cannot be empty|invalid/i);
    await expect(validationErrors).toBeVisible();
    
    // Fill in invalid data
    const adminEmailInput = page.getByLabel(/admin email/i);
    await adminEmailInput.fill('invalid-email');
    await submitButton.click();
    
    // Check for email validation error
    const emailError = page.getByText(/invalid email/i);
    await expect(emailError).toBeVisible();
  });
  
  test('should create account successfully', async ({ page }) => {
    // Mock API response for account creation
    await page.route('**/api/admin/create_account', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          account: { 
            id: 'ACC123', 
            name: 'New Hospital',
            adminEmail: 'admin@newhospital.com' 
          }
        })
      });
    });
    
    // Fill in form with valid data
    const accountNameInput = page.getByLabel(/account name/i);
    const adminEmailInput = page.getByLabel(/admin email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await accountNameInput.fill('New Hospital');
    await adminEmailInput.fill('admin@newhospital.com');
    await passwordInput.fill('SecurePass123!');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /create account/i });
    await submitButton.click();
    
    // Check for success message
    const successMessage = page.getByText(/account created successfully/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // Form should be reset after successful submission
    await expect(accountNameInput).toBeEmpty();
  });
  
  test('should handle API errors during account creation', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/admin/create_account', async route => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Email already in use'
        })
      });
    });
    
    // Fill in form with valid data
    const accountNameInput = page.getByLabel(/account name/i);
    const adminEmailInput = page.getByLabel(/admin email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await accountNameInput.fill('New Hospital');
    await adminEmailInput.fill('admin@newhospital.com');
    await passwordInput.fill('SecurePass123!');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /create account/i });
    await submitButton.click();
    
    // Check for error message
    const errorMessage = page.getByText(/email already in use/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});