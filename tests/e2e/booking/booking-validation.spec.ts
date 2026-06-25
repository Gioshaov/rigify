import { test, expect } from '@playwright/test';
import { selectDateAndTime, generateUniquePhone, bypassSitePassword } from '../../utils/test-helpers';
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
    await page.goto(`/businesses/${testBusiness.slug}`);
    await page.getByTestId(`service-card-${testService.id}`).first().click();
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    // Select artisan, date and time
    await selectDateAndTime(page);

    // Fill form: valid email (required for guests) so the phone is the only invalid field
    await page.getByTestId('customer-name-input').fill('Test User');
    await page.getByTestId('customer-email-input').fill('test@example.com');
    await page.getByTestId('customer-phone-input').fill('123'); // Too short
    await page.getByTestId('booking-confirm').click();

    // Validation blocks submission — error shown, no inline confirmation
    await expect(page.getByText('Please fix the errors above and try again.')).toBeVisible();
    await expect(page.getByTestId('booking-modal')).toBeVisible();
    await expect(page.getByTestId('booking-confirmation-view')).toHaveCount(0);
  });

  test('should prevent booking past dates', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto(`/businesses/${testBusiness.slug}`);
    await page.getByTestId(`service-card-${testService.id}`).first().click();
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    // Open the date popover to reveal the calendar
    await page.getByTestId('booking-date-field').click();
    await page.waitForSelector('[data-testid="booking-calendar"]', { timeout: 5000 });

    // Check that past dates are disabled in the calendar
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Try to find yesterday's date button and check if it's disabled
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const yesterdayButton = page.locator(`[data-testid="calendar-day-${yesterdayStr}"]`);

    // The button should either not exist or be disabled
    const count = await yesterdayButton.count();
    if (count > 0) {
      await expect(yesterdayButton).toBeDisabled();
    }
  });
});
