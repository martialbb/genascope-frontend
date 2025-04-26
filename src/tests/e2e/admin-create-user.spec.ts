import { test, expect } from '@playwright/test';

test.describe('Admin Create User Page', () => {
  // Setup authentication before tests with admin role
  test.beforeEach(async ({ page }) => {
    // Mock authentication state by setting localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cancerGenixUser', JSON.stringify({
        id: '3',
        name: 'Admin User',
        role: 'admin',
        token: 'fake-jwt-token'
      }));
    });
    
    // Navigate to admin create user page
    await page.goto('/admin/create-user');
  });
  
  test('should restrict access to non-admin users', async ({ page }) => {
    // Set patient role instead of admin
    await page.evaluate(() => {
      localStorage.setItem('cancerGenixUser', JSON.stringify({
        id: '1',
        name: 'Regular User',
        role: 'patient',
        token: 'fake-jwt-token'
      }));
    });
    
    // Try to access create user page
    await page.goto('/admin/create-user');
    
    // Should be redirected or shown access denied
    const accessDenied = page.getByText(/access denied|unauthorized|not authorized/i);
    await expect(accessDenied).toBeVisible();
  });
  
  test('should display user creation form', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Create User | CancerGenix/);
    
    // Check form heading
    const heading = page.getByRole('heading', { name: /create user/i });
    await expect(heading).toBeVisible();
    
    // Check form fields
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const roleSelect = page.getByLabel(/role/i);
    const submitButton = page.getByRole('button', { name: /create user/i });
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(roleSelect).toBeVisible();
    await expect(submitButton).toBeVisible();
  });
  
  test('should validate form fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /create user/i });
    await submitButton.click();
    
    // Check for validation messages
    const validationErrors = page.getByText(/required|cannot be empty|invalid/i);
    await expect(validationErrors).toBeVisible();
    
    // Fill in invalid data
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('invalid-email');
    await submitButton.click();
    
    // Check for email validation error
    const emailError = page.getByText(/invalid email/i);
    await expect(emailError).toBeVisible();
  });
  
  test('should allow selection of user roles', async ({ page }) => {
    // Check role dropdown
    const roleSelect = page.getByLabel(/role/i);
    await roleSelect.click();
    
    // Check available options
    const patientOption = page.getByRole('option', { name: /patient/i });
    const clinicianOption = page.getByRole('option', { name: /clinician/i });
    
    await expect(patientOption).toBeVisible();
    await expect(clinicianOption).toBeVisible();
    
    // Regular admin should not see super_admin role option
    const superAdminOption = page.getByRole('option', { name: /super_admin/i });
    await expect(superAdminOption).not.toBeVisible();
    
    // Select clinician role
    await clinicianOption.click();
    await expect(roleSelect).toHaveValue(/clinician/i);
  });
  
  test('should create user successfully', async ({ page }) => {
    // Mock API response for user creation
    await page.route('**/api/account/create_user', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          user: { 
            id: 'U123', 
            name: 'Dr. Jane Smith',
            email: 'jane.smith@example.com',
            role: 'clinician'
          }
        })
      });
    });
    
    // Fill in form with valid data
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const roleSelect = page.getByLabel(/role/i);
    
    await nameInput.fill('Dr. Jane Smith');
    await emailInput.fill('jane.smith@example.com');
    await passwordInput.fill('SecurePass123!');
    
    // Select role
    await roleSelect.selectOption('clinician');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /create user/i });
    await submitButton.click();
    
    // Check for success message
    const successMessage = page.getByText(/user created successfully/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // Form should be reset after successful submission
    await expect(nameInput).toBeEmpty();
  });
  
  test('should handle API errors during user creation', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/account/create_user', async route => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Email already registered'
        })
      });
    });
    
    // Fill in form with valid data
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const roleSelect = page.getByLabel(/role/i);
    
    await nameInput.fill('Dr. Jane Smith');
    await emailInput.fill('existing@example.com');
    await passwordInput.fill('SecurePass123!');
    await roleSelect.selectOption('clinician');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /create user/i });
    await submitButton.click();
    
    // Check for error message
    const errorMessage = page.getByText(/email already registered/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
  
  test('should show different fields based on selected role', async ({ page }) => {
    // Some fields might be conditional based on selected role
    // For example, clinicians might need additional fields like specialization
    
    const roleSelect = page.getByLabel(/role/i);
    
    // Select patient role
    await roleSelect.selectOption('patient');
    
    // Check for patient-specific fields
    const patientIdField = page.getByLabel(/patient id/i);
    await expect(patientIdField).toBeVisible();
    
    // Select clinician role
    await roleSelect.selectOption('clinician');
    
    // Check for clinician-specific fields
    const specializationField = page.getByLabel(/specialization/i);
    await expect(specializationField).toBeVisible();
  });
});