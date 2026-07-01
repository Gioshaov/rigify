import { test, expect } from '@playwright/test';
import { selectDateAndTime, generateUniquePhone, bypassSitePassword } from '../../utils/test-helpers';
import { cleanupTestBookings, getTestBusiness, getTestService } from '../../utils/db-helpers';
import { GUEST_CUSTOMER_DATA } from '../fixtures/test-users';

test.describe('Guest Booking Flow @db', () => {
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

  test.afterEach(async () => {
    await cleanupTestBookings(uniquePhone);
  });

  test('should complete full guest booking flow', async ({ page }) => {
    await bypassSitePassword(page);

    // 1. Browse businesses page
    await page.goto('/businesses');
    await expect(page.getByTestId('browse-studios-hero-title')).toBeVisible();

    // 2. Click on a business card
    await page.getByTestId(`business-card-${testBusiness.slug}`).click();
    await expect(page).toHaveURL(new RegExp(`/businesses/${testBusiness.slug}`));

    // 3. Open the booking modal for a service
    await page.getByTestId(`service-card-${testService.id}`).first().click();
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    // 4. Select artisan, date and time
    await selectDateAndTime(page);

    // 5. Fill customer details
    await page.getByTestId('customer-name-input').fill(GUEST_CUSTOMER_DATA.name);
    await page.getByTestId('customer-phone-input').fill(uniquePhone);
    await page.getByTestId('customer-email-input').fill(GUEST_CUSTOMER_DATA.email);

    // 6. Confirm booking
    await page.getByTestId('booking-confirm').click();

    // 7. Confirmation appears inline inside the same modal (no navigation)
    await expect(page.getByTestId('booking-confirmation-view')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('booking-confirmed-title')).toBeVisible();
    await expect(page.getByTestId('business-name')).toContainText(testBusiness.name);
  });

  test('should validate required fields', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto(`/businesses/${testBusiness.slug}`);
    await page.getByTestId(`service-card-${testService.id}`).first().click();
    await expect(page.getByTestId('booking-modal')).toBeVisible();

    // Try to submit without filling fields
    const confirmBtn = page.getByTestId('booking-confirm');
    await expect(confirmBtn).toBeDisabled();

    // Fill only name
    await page.getByTestId('customer-name-input').fill('Test Name');
    await expect(confirmBtn).toBeDisabled();

    // Fill phone
    await page.getByTestId('customer-phone-input').fill(uniquePhone);
    await expect(confirmBtn).toBeDisabled(); // Still disabled (no date/time)

    // Select date and time
    await selectDateAndTime(page);
    await expect(confirmBtn).toBeDisabled(); // Still disabled — guests must provide an email

    // Email is required for guests
    await page.getByTestId('customer-email-input').fill('guest@example.com');
    await expect(confirmBtn).toBeEnabled();
  });
});
