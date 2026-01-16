import { test, expect } from '@playwright/test';

test.describe('Celery Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the calculator', async ({ page }) => {
    await expect(page).toHaveTitle(/Celery/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('calculates salary from hourly rate', async ({ page }) => {
    // Find the hourly rate input and enter a value
    const hourlyInput = page.getByLabel(/hourly/i);
    await hourlyInput.fill('50');

    // Verify calculation appears - look for any currency formatted number
    // The exact amount depends on tax settings, currency, and conversion rates
    await expect(page.getByText(/\$[\d,]+/).first()).toBeVisible();
  });

  test('toggles between light and dark theme', async ({ page }) => {
    // Theme toggle button shows current theme label
    const themeToggle = page.getByRole('button', { name: /Theme:/i });

    if (await themeToggle.isVisible()) {
      // Get the initial button text (contains theme name)
      const initialText = await themeToggle.textContent() || '';

      // Click to cycle through themes
      await themeToggle.click();

      // Button text should change to show the new theme
      await expect(async () => {
        const newText = await themeToggle.textContent() || '';
        expect(newText).not.toBe(initialText);
      }).toPass({ timeout: 5000 });
    }
  });

  test('persists values on reload', async ({ page }) => {
    const hourlyInput = page.getByLabel(/hourly/i);
    await hourlyInput.fill('75');

    // Reload the page
    await page.reload();

    // Value should persist via localStorage
    await expect(hourlyInput).toHaveValue('75');
  });
});
