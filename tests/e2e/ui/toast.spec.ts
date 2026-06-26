import { test, expect } from '@playwright/test';
import { bypassSitePassword } from '../../utils/test-helpers';

// Exercises the global Toast / useToast() primitive via the /dev/ui-harness
// route (no auth or DB needed). Stacked toasts use data-testid
// `toast-notification-{id}`, matched here by regex.
test.describe('Toast', () => {
  test.beforeEach(async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/dev/ui-harness');
  });

  test('shows a toast with the given message', async ({ page }) => {
    await page.getByTestId('harness-toast-success').click();

    const toast = page.getByTestId(/^toast-notification-/);
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Saved successfully');
  });

  test('auto-dismisses after its duration', async ({ page }) => {
    await page.getByTestId('harness-toast-quick').click();

    const toast = page.getByTestId(/^toast-notification-/);
    await expect(toast).toBeVisible();
    // The quick toast lasts 800ms — it should be gone well within 3s.
    await expect(toast).toBeHidden({ timeout: 3000 });
  });

  test('can be dismissed manually via the close button', async ({ page }) => {
    await page.getByTestId('harness-toast-success').click();

    const toast = page.getByTestId(/^toast-notification-/);
    await expect(toast).toBeVisible();

    await page.getByTestId(/^close-toast-btn-/).click();
    await expect(toast).toBeHidden();
  });

  test('stacks multiple toasts', async ({ page }) => {
    await page.getByTestId('harness-toast-stack').click();

    await expect(page.getByTestId(/^toast-notification-/)).toHaveCount(3);

    const region = page.getByTestId('toast-region');
    await expect(region).toContainText('First toast');
    await expect(region).toContainText('Second toast');
    await expect(region).toContainText('Third toast');
  });

  test('success and error toasts coexist as separate items', async ({ page }) => {
    await page.getByTestId('harness-toast-success').click();
    await page.getByTestId('harness-toast-error').click();

    await expect(page.getByTestId(/^toast-notification-/)).toHaveCount(2);
    await expect(page.getByTestId('toast-region')).toContainText('Something went wrong');
  });
});
