import { test, expect } from '@playwright/test';

test.describe('Patient Appointment Scheduling', () => {
  // Setup - login as patient before each test
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Fill in patient credentials and login
    await page.getByLabel('Email').fill('patient@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for login to complete - check for welcome message
    await expect(page.getByText(/Welcome/)).toBeVisible();
  });
  
  test('should be able to navigate to appointment scheduling page', async ({ page }) => {
    // Click on Schedule Appointment in the navigation
    await page.getByRole('link', { name: 'Schedule Appointment' }).click();
    
    // Verify we're on the scheduling page
    await expect(page).toHaveTitle(/Schedule an Appointment/);
    await expect(page.getByRole('heading', { name: 'Schedule an Appointment' })).toBeVisible();
  });
  
  test('should be able to book an appointment', async ({ page }) => {
    // Go to scheduling page
    await page.goto('/schedule-appointment');
    
    // Select a date (future date)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    await page.getByLabel('Select Date').fill(dateString);
    
    // Wait for time slots to load
    await expect(page.getByText('Available Time Slots')).toBeVisible();
    
    // Select first available time slot
    const firstAvailableSlot = page.locator('button.time-slot-button:not([disabled])').first();
    await firstAvailableSlot.click();
    
    // Click Next to proceed
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Select appointment type
    await page.getByLabel('Virtual').check();
    
    // Add notes
    await page.getByLabel('Notes').fill('E2E test appointment booking');
    
    // Book the appointment
    await page.getByRole('button', { name: 'Book Appointment' }).click();
    
    // Verify success message is shown
    await expect(page.getByText('Appointment Booked Successfully')).toBeVisible();
    await expect(page.getByText(/Your appointment confirmation code/)).toBeVisible();
  });
  
  test('should show appointments on the dashboard', async ({ page }) => {
    // Go to appointments dashboard
    await page.goto('/appointments-dashboard');
    
    // Verify page loaded correctly
    await expect(page.getByRole('heading', { name: 'Appointments Dashboard' })).toBeVisible();
    
    // Check that appointments are displayed (assuming patient has at least one appointment)
    await expect(page.locator('.appointment-item').first()).toBeVisible();
    
    // Test filtering by status
    await page.getByLabel('Status:').selectOption('scheduled');
    
    // Check that the filter worked
    await expect(page.getByText('Scheduled').first()).toBeVisible();
  });
  
  test('should be able to cancel an appointment', async ({ page }) => {
    // Go to appointments dashboard
    await page.goto('/appointments-dashboard');
    
    // Find a scheduled appointment (might need to filter first)
    await page.getByLabel('Status:').selectOption('scheduled');
    
    // Wait for the appointments to update
    await page.waitForTimeout(500);
    
    // Get the first scheduled appointment's cancel button
    const cancelButton = page.locator('.appointment-item').filter({ hasText: 'Scheduled' }).first().getByRole('button', { name: 'Cancel' });
    
    // Click cancel button
    await cancelButton.click();
    
    // Verify the status changed to canceled
    await expect(page.getByText('Canceled')).toBeVisible();
  });
});

test.describe('Clinician Availability Management', () => {
  // Setup - login as clinician before each test
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Fill in clinician credentials and login
    await page.getByLabel('Email').fill('clinician@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for login to complete
    await expect(page.getByText(/Welcome/)).toBeVisible();
  });
  
  test('should be able to navigate to availability management page', async ({ page }) => {
    // Click on My Availability in the navigation
    await page.getByRole('link', { name: 'My Availability' }).click();
    
    // Verify we're on the availability management page
    await expect(page).toHaveTitle(/Manage Availability/);
    await expect(page.getByRole('heading', { name: 'Manage Your Availability' })).toBeVisible();
  });
  
  test('should be able to set single day availability', async ({ page }) => {
    // Go to availability management page
    await page.goto('/manage-availability');
    
    // Select a date (future date)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateString = nextWeek.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    await page.getByLabel('Select Date').fill(dateString);
    
    // Select time slots 
    await page.getByText('Morning Slots').click();
    
    // Submit the form
    await page.getByRole('button', { name: 'Set Availability' }).click();
    
    // Verify success message is shown
    await expect(page.getByText(/Successfully set availability/)).toBeVisible();
  });
  
  test('should be able to set recurring availability', async ({ page }) => {
    // Go to availability management page
    await page.goto('/manage-availability');
    
    // Select a date (future date)
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7); // Next Monday
    const dateString = nextMonday.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    await page.getByLabel('Select Date').fill(dateString);
    
    // Enable recurring availability
    await page.getByLabel('Make this a recurring availability').check();
    
    // Select weekdays
    await page.getByText('Weekdays').click();
    
    // Select time slots
    await page.getByText('Afternoon Slots').click();
    
    // Set recurring until (4 weeks from now)
    const recurringUntil = new Date(nextMonday);
    recurringUntil.setDate(recurringUntil.getDate() + 28);
    const recurringUntilString = recurringUntil.toISOString().split('T')[0];
    
    await page.getByLabel('Recurring Until').fill(recurringUntilString);
    
    // Submit the form
    await page.getByRole('button', { name: 'Set Availability' }).click();
    
    // Verify success message is shown
    await expect(page.getByText(/Successfully set recurring availability/)).toBeVisible();
  });
  
  test('should show clinician appointments on dashboard', async ({ page }) => {
    // Go to appointments dashboard
    await page.goto('/appointments-dashboard');
    
    // Verify page loaded correctly
    await expect(page.getByRole('heading', { name: 'Appointments Dashboard' })).toBeVisible();
    
    // Check that the filter controls are visible
    await expect(page.getByLabel('Status:')).toBeVisible();
    await expect(page.getByLabel('Date:')).toBeVisible();
    
    // Filter by upcoming appointments
    await page.getByLabel('Date:').selectOption('upcoming');
    
    // Check that upcoming appointments are displayed
    await expect(page.locator('.appointment-item').first()).toBeVisible();
  });
  
  test('should be able to update appointment status', async ({ page }) => {
    // Go to appointments dashboard
    await page.goto('/appointments-dashboard');
    
    // Filter by scheduled appointments
    await page.getByLabel('Status:').selectOption('scheduled');
    
    // Wait for the appointments to update
    await page.waitForTimeout(500);
    
    // Get the first scheduled appointment's "Mark Completed" button
    const completeButton = page.locator('.appointment-item').filter({ hasText: 'Scheduled' }).first().getByRole('button', { name: 'Mark Completed' });
    
    // Click the button
    await completeButton.click();
    
    // Verify the status changed
    await expect(page.getByText('Completed')).toBeVisible();
  });
});

test.describe('Scheduling Integration with Chat', () => {
  test('should prompt scheduling after completing risk assessment', async ({ page }) => {
    // Login as patient
    await page.goto('/login');
    await page.getByLabel('Email').fill('patient@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Go to chat
    await page.goto('/chat');
    
    // Complete a simple mock chat (this will depend on your actual chat flow)
    // Wait for first question
    await expect(page.locator('.chat-message').first()).toBeVisible();
    
    // Answer all questions until chat ends
    while (await page.getByPlaceholder('Type your response...').isVisible()) {
      await page.getByPlaceholder('Type your response...').fill('Yes');
      await page.getByRole('button', { name: 'Send' }).click();
      await page.waitForTimeout(1000); // Wait for response
    }
    
    // Verify that chat is completed and scheduling prompt is shown
    await expect(page.getByText('Chat finished')).toBeVisible();
    
    // Check for scheduling prompt
    await expect(page.getByRole('button', { name: /Schedule.*Consultation/i })).toBeVisible();
    
    // Click the scheduling button
    await page.getByRole('button', { name: /Schedule.*Consultation/i }).click();
    
    // Verify redirect to scheduling page
    await expect(page).toHaveURL(/schedule-appointment/);
  });
});
