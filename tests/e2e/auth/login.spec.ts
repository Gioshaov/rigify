import { test, expect } from '@playwright/test';
import { bypassSitePassword } from '../../utils/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Login Flow', () => {
  test('should login business owner and redirect to dashboard', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/login');

    await page.getByTestId('login-email-input').fill(TEST_USERS.businessOwner.email);
    await page.getByTestId('login-password-input').fill(TEST_USERS.businessOwner.password);
    await page.getByTestId('login-submit-btn').click();

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByTestId('sidebar-logo')).toBeVisible();
  });

  test('should login customer and redirect to customer dashboard', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/login');

    await page.getByTestId('login-email-input').fill(TEST_USERS.customer.email);
    await page.getByTestId('login-password-input').fill(TEST_USERS.customer.password);
    await page.getByTestId('login-submit-btn').click();

    await expect(page).toHaveURL('/customer/dashboard', { timeout: 10000 });
    await expect(page.getByTestId('customer-sidebar-logo')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/login');

    await page.getByTestId('login-email-input').fill('wrong@email.com');
    await page.getByTestId('login-password-input').fill('wrongpassword');
    await page.getByTestId('login-submit-btn').click();

    // Should show error message or stay on login page
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
