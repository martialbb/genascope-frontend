# Test info

- Name: Homepage >> should display proper responsive layout
- Location: /Users/martial-m1/cancer-genix/src/tests/e2e/home.spec.ts:44:3

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: locator('header') resolved to 6 elements:
    1) <header class="bg-white shadow-md">…</header> aka getByRole('banner')
    2) <header>…</header> aka getByText('5.7.5 Copy debug info')
    3) <header>…</header> aka getByText('Featured integrationsView all')
    4) <header>…</header> aka locator('header').filter({ hasText: 'Audit 0' })
    5) <header>…</header> aka locator('header').filter({ hasText: 'No accessibility or' })
    6) <header>…</header> aka locator('header').filter({ hasText: 'Settings' })

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('header')

    at /Users/martial-m1/cancer-genix/src/tests/e2e/home.spec.ts:50:42
```

# Page snapshot

```yaml
- banner:
  - navigation:
    - link "CancerGenix":
      - /url: /
    - link "Home":
      - /url: /
    - link "Login":
      - /url: /login
- main:
  - link "Astro Homepage":
    - /url: https://astro.build
    - img "Astro Homepage"
  - heading "To get started, open the src/pages directory in your project." [level=1]:
    - text: To get started, open the
    - code: src/pages
    - text: directory in your project.
  - link "Read our docs":
    - /url: https://docs.astro.build
  - link "Join our Discord":
    - /url: https://astro.build/chat
    - text: Join our Discord
    - img
- link "What's New in Astro 5.0? From content layers to server islands, click to learn more about the new features and improvements in Astro 5.0":
  - /url: https://astro.build/blog/astro-5/
  - img
  - heading "What's New in Astro 5.0?" [level=2]
  - paragraph: From content layers to server islands, click to learn more about the new features and improvements in Astro 5.0
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Homepage', () => {
   4 |   test('should load successfully', async ({ page }) => {
   5 |     // Navigate to the homepage
   6 |     await page.goto('/');
   7 |     
   8 |     // Check that the page title contains the app name
   9 |     await expect(page).toHaveTitle(/CancerGenix/);
  10 |     
  11 |     // Check that the header is visible
  12 |     const header = page.locator('header');
  13 |     await expect(header).toBeVisible();
  14 |     
  15 |     // Check for the main logo/brand name
  16 |     const logo = page.getByRole('link', { name: /CancerGenix/i });
  17 |     await expect(logo).toBeVisible();
  18 |     
  19 |     // Check for the welcome section
  20 |     const welcomeSection = page.getByRole('heading', { name: /Welcome to CancerGenix/i }).first();
  21 |     await expect(welcomeSection).toBeVisible();
  22 |     
  23 |     // Check for login link when not authenticated
  24 |     const loginLink = page.getByRole('link', { name: /Login/i });
  25 |     await expect(loginLink).toBeVisible();
  26 |   });
  27 |   
  28 |   test('should have working navigation links', async ({ page }) => {
  29 |     // Navigate to the homepage
  30 |     await page.goto('/');
  31 |     
  32 |     // Check home link works
  33 |     const homeLink = page.getByRole('link', { name: /Home/i });
  34 |     await expect(homeLink).toBeVisible();
  35 |     
  36 |     // Check login link navigates correctly
  37 |     const loginLink = page.getByRole('link', { name: /Login/i });
  38 |     await loginLink.click();
  39 |     
  40 |     // After clicking login, should be on login page
  41 |     await expect(page).toHaveURL(/.*\/login/);
  42 |   });
  43 |   
  44 |   test('should display proper responsive layout', async ({ page }) => {
  45 |     // Navigate to the homepage
  46 |     await page.goto('/');
  47 |     
  48 |     // Test on mobile viewport
  49 |     await page.setViewportSize({ width: 414, height: 896 }); // iPhone X size
> 50 |     await expect(page.locator('header')).toBeVisible();
     |                                          ^ Error: expect.toBeVisible: Error: strict mode violation: locator('header') resolved to 6 elements:
  51 |     
  52 |     // Test on tablet viewport
  53 |     await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
  54 |     await expect(page.locator('header')).toBeVisible();
  55 |     
  56 |     // Test on desktop viewport
  57 |     await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
  58 |     await expect(page.locator('header')).toBeVisible();
  59 |   });
  60 | });
```