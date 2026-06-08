import { test, expect } from '@playwright/test';
import { loginAs } from '../../utils/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Business Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USERS.businessOwner.email, TEST_USERS.businessOwner.password);
  });

  test('should display dashboard overview', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('sidebar-logo')).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    await page.getByTestId('nav-services').click();
    await expect(page).toHaveURL('/dashboard/services');
  });

  test('should navigate to staff page', async ({ page }) => {
    await page.getByTestId('nav-staff').click();
    await expect(page).toHaveURL('/dashboard/staff');
  });

  test('should navigate to appointments page', async ({ page }) => {
    await page.getByTestId('nav-appointments').click();
    await expect(page).toHaveURL('/dashboard/appointments');
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.getByTestId('nav-settings').click();
    await expect(page).toHaveURL('/dashboard/settings');
  });
});
