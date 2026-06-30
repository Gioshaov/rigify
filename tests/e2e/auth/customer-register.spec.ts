import { test, expect } from '@playwright/test';
import { bypassSitePassword } from '../../utils/test-helpers';

// These tests cover the client-side behaviour of the registration form only —
// the password-mismatch guard runs before the server action, so none of them
// create an auth user or write to the DB (no cleanup needed). Happy-path signup
// + asserting the concatenated customers.name is a separate, heavier follow-up
// that needs test-user teardown.
test.describe('Customer Registration', () => {
  test('renders first/last name and confirm password fields', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/customer-register');

    await expect(page.getByTestId('first-name-input')).toBeVisible();
    await expect(page.getByTestId('last-name-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('toggle-confirm-password-btn')).toBeVisible();
  });

  test('blocks submission and shows inline error when passwords do not match', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/customer-register');

    await page.getByTestId('first-name-input').fill('Alexander');
    await page.getByTestId('last-name-input').fill('Sterling');
    await page.getByTestId('email-input').fill('mismatch-test@example.com');
    await page.getByTestId('phone-input').fill('555123456');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirm-password-input').fill('password999');
    await page.getByTestId('terms-checkbox').check();

    await page.getByTestId('create-account-btn').click();

    // Inline error in the existing error style; stays on the page (no signup happens).
    await expect(page.getByTestId('error-message')).toContainText('Passwords do not match');
    await expect(page).toHaveURL(/\/customer-register/);
  });

  test('confirm password reveal toggle switches the input type', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/customer-register');

    const confirm = page.getByTestId('confirm-password-input');
    await expect(confirm).toHaveAttribute('type', 'password');
    await page.getByTestId('toggle-confirm-password-btn').click();
    await expect(confirm).toHaveAttribute('type', 'text');
  });
});
