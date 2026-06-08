import { test, expect } from '@playwright/test';
import { generateUniquePhone, bypassSitePassword } from '../../utils/test-helpers';
import { getTestBusiness, getTestService } from '../../utils/db-helpers';

test.describe('Booking Validation', () => {
  let testBusiness: any;
  let testService: any;
  let uniquePhone: string;

  test.beforeAll(async () => {
    testBusiness = await getTestBusiness();
    testService = await getTestService(testBusiness.id);
  });

  test.beforeEach(() => {
    uniquePhone = generateUniquePhone();
  });

  test('should reject invalid phone format', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto(`/businesses/${testBusiness.slug}/book?service=${testService.id}`);

    // Select date/time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.waitForSelector(`[data-testid="calendar-day-${tomorrow.getDate()}"]`, { timeout: 5000 });
    await page.click(`[data-testid="calendar-day-${tomorrow.getDate()}"]`);
    await page.waitForSelector('[data-testid^="time-slot-"]:not([disabled])', { timeout: 10000 });
    await page.locator('[data-testid^="time-slot-"]:not([disabled])').first().click();

    // Fill form with invalid phone
    await page.getByTestId('customer-name-input').fill('Test User');
    await page.getByTestId('customer-phone-input').fill('123'); // Too short
    await page.getByTestId('confirm-booking-btn').click();

    // Should stay on booking page (validation prevents navigation)
    await page.waitForTimeout(1000); // Give time for validation to trigger
    await expect(page).toHaveURL(/\/book/, { timeout: 5000 });
  });

  test('should prevent booking past dates', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto(`/businesses/${testBusiness.slug}/book?service=${testService.id}`);

    // Check that past dates are disabled in the calendar
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Try to find yesterday's date button and check if it's disabled
    const yesterdayButton = page.locator(`[data-testid="calendar-day-${yesterday.getDate()}"]`);

    // The button should either not exist or be disabled
    const count = await yesterdayButton.count();
    if (count > 0) {
      await expect(yesterdayButton).toBeDisabled();
    }
  });
});
