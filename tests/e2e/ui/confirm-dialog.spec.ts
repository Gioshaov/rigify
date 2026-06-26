import { test, expect } from '@playwright/test';
import { bypassSitePassword } from '../../utils/test-helpers';

// Exercises the global ConfirmDialog / useConfirm() primitive via the
// /dev/ui-harness route (no auth or DB needed).
test.describe('ConfirmDialog', () => {
  test.beforeEach(async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/dev/ui-harness');
  });

  test('confirm button resolves the promise to true', async ({ page }) => {
    await page.getByTestId('harness-open-confirm').click();
    await expect(page.getByTestId('harness-confirm')).toBeVisible();

    await page.getByTestId('harness-confirm-confirm-btn').click();

    await expect(page.getByTestId('harness-confirm')).toBeHidden();
    await expect(page.getByTestId('harness-result-value')).toHaveText('confirmed');
  });

  test('cancel button resolves the promise to false', async ({ page }) => {
    await page.getByTestId('harness-open-confirm').click();
    await page.getByTestId('harness-confirm-cancel-btn').click();

    await expect(page.getByTestId('harness-confirm')).toBeHidden();
    await expect(page.getByTestId('harness-result-value')).toHaveText('cancelled');
  });

  test('Escape resolves the promise to false', async ({ page }) => {
    await page.getByTestId('harness-open-confirm').click();
    await expect(page.getByTestId('harness-confirm')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByTestId('harness-confirm')).toBeHidden();
    await expect(page.getByTestId('harness-result-value')).toHaveText('cancelled');
  });

  test('backdrop click resolves the promise to false', async ({ page }) => {
    await page.getByTestId('harness-open-confirm').click();
    await expect(page.getByTestId('harness-confirm')).toBeVisible();

    // Click the overlay well away from the centered dialog box.
    await page.mouse.click(8, 8);

    await expect(page.getByTestId('harness-confirm')).toBeHidden();
    await expect(page.getByTestId('harness-result-value')).toHaveText('cancelled');
  });

  test('confirm button is focused on open', async ({ page }) => {
    await page.getByTestId('harness-open-confirm').click();
    await expect(page.getByTestId('harness-confirm-confirm-btn')).toBeFocused();
  });

  test('a second confirm() cancels the first without hanging it', async ({ page }) => {
    await page.getByTestId('harness-double-confirm').click();

    // The first promise must resolve (to false) when the second dialog opens.
    await expect(page.getByTestId('harness-result-value')).toHaveText('first-resolved:false');
    // The visible dialog is now the second one.
    await expect(page.getByTestId('harness-confirm-title')).toHaveText('Second confirm');

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('harness-confirm')).toBeHidden();
  });
});
