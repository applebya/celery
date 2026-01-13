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

    // Verify calculation appears (annual should show ~$104,000 for 40hr/week)
    await expect(page.getByText(/\$104,000|\$100,000/)).toBeVisible();
  });

  test('toggles between light and dark theme', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });

    if (await themeToggle.isVisible()) {
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');

      await themeToggle.click();

      // Class should change after toggle
      await expect(html).not.toHaveAttribute('class', initialClass);
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
