import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  // Setup authentication before tests
  test.beforeEach(async ({ page }) => {
    // Mock authentication state by setting localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('genascopeUser', JSON.stringify({
        id: '2',
        name: 'Test Clinician',
        role: 'clinician',
        token: 'fake-jwt-token'
      }));
    });
    
    // Navigate to dashboard page
    await page.goto('/dashboard');
  });
  
  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // Clear authentication
    await page.evaluate(() => localStorage.removeItem('genascopeUser'));
    
    // Try to access dashboard
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });
  
  test('should display dashboard with patient data table', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Dashboard | Genascope/);
    
    // Check for dashboard heading
    const heading = page.getByRole('heading', { name: /Dashboard/i });
    await expect(heading).toBeVisible();
    
    // Check for patient table
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    
    // Check table headers
    const headerCells = page.locator('th');
    await expect(headerCells).toHaveCount(4); // Assuming 4 columns: Name, ID, Status, Actions
    
    // Check for patient data or "No data" message
    const tableContent = page.locator('table tbody');
    await expect(tableContent).toBeVisible();
  });
  
  test('should allow searching and filtering patients', async ({ page }) => {
    // Mock API response for dashboard data
    await page.route('**/api/patients', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'P001', name: 'John Doe', status: 'Active' },
          { id: 'P002', name: 'Jane Smith', status: 'Pending' },
          { id: 'P003', name: 'Bob Johnson', status: 'Inactive' }
        ])
      });
    });
    
    // Reload page to get mocked data
    await page.reload();
    
    // Check for search input
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('John');
    await searchInput.press('Enter');
    
    // Should only show rows containing "John"
    const visibleRows = page.locator('tbody tr');
    await expect(visibleRows).toHaveCount(1);
    await expect(page.getByText('John Doe')).toBeVisible();
    
    // Clear search
    await searchInput.clear();
    await searchInput.press('Enter');
    
    // Should show all rows again
    await expect(visibleRows).toHaveCount(3);
  });
  
  test('should allow viewing patient details', async ({ page }) => {
    // Mock API response for dashboard data
    await page.route('**/api/patients', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'P001', name: 'John Doe', status: 'Active' }
        ])
      });
    });
    
    // Reload page to get mocked data
    await page.reload();
    
    // Click on view details button/link
    const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
    
    // If it's a link instead of button, use this:
    // const viewDetailsButton = page.getByRole('link', { name: /view details/i }).first();
    
    await viewDetailsButton.click();
    
    // Should navigate to patient details page
    await expect(page).toHaveURL(/.*\/patient\/P001/);
  });
});