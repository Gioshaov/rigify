import { test, expect } from '@playwright/test';
import { bypassSitePassword } from '../../utils/test-helpers';

/**
 * /for-businesses waitlist form.
 *
 * Every test mocks POST /api/contact with page.route() so nothing is written to
 * the Supabase `leads` table and no real submission fires — payload assertions
 * (phone-combine, city) read the intercepted request body, not the DOM. Covers
 * the recently-changed controls: CountryCodeSelect (GE +995 default) + separate
 * number input combining into `phone`, and the City FilterDropdown.
 */
test.describe('For Businesses Waitlist Form', () => {
  test('happy path — fills all fields and shows the success state', async ({ page }) => {
    await bypassSitePassword(page);
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    await page.goto('/for-businesses');

    await page.getByTestId('contact-name-input').fill('Alexander Sterling');
    await page.getByTestId('contact-business-input').fill('Sterling Studio');
    await page.getByTestId('contact-phone-input').fill('555123456');
    await page.getByTestId('contact-city-dropdown-trigger').click();
    await page.getByTestId('contact-city-option-tbilisi').click();
    await page.getByTestId('contact-message-textarea').fill('Interested in early access.');

    await page.getByTestId('contact-submit-btn').click();

    await expect(page.getByTestId('for-businesses-success-message')).toBeVisible();
  });

  test('error path — shows the error and does NOT show success on a failed submit', async ({ page }) => {
    await bypassSitePassword(page);
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to save' }),
      });
    });
    await page.goto('/for-businesses');

    await page.getByTestId('contact-name-input').fill('Alexander Sterling');
    await page.getByTestId('contact-business-input').fill('Sterling Studio');
    await page.getByTestId('contact-phone-input').fill('555123456');

    await page.getByTestId('contact-submit-btn').click();

    await expect(page.getByTestId('for-businesses-error-msg')).toContainText('Failed to save');
    await expect(page.getByTestId('for-businesses-success-message')).toHaveCount(0);
  });

  test('phone combine — submits the country code + number as "+995 <digits>"', async ({ page }) => {
    await bypassSitePassword(page);
    let captured: Record<string, unknown> | undefined;
    await page.route('**/api/contact', async (route) => {
      captured = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    await page.goto('/for-businesses');

    // GE +995 is the default country code — no dropdown interaction needed.
    await page.getByTestId('contact-name-input').fill('Alexander Sterling');
    await page.getByTestId('contact-business-input').fill('Sterling Studio');
    await page.getByTestId('contact-phone-input').fill('555123456');

    await page.getByTestId('contact-submit-btn').click();

    // Assert on the intercepted request body, not the DOM.
    await expect(page.getByTestId('for-businesses-success-message')).toBeVisible();
    expect(captured?.phone).toBe('+995 555123456');
  });

  test('city dropdown — selecting a city is included in the submission', async ({ page }) => {
    await bypassSitePassword(page);
    let captured: Record<string, unknown> | undefined;
    await page.route('**/api/contact', async (route) => {
      captured = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    await page.goto('/for-businesses');

    await page.getByTestId('contact-name-input').fill('Alexander Sterling');
    await page.getByTestId('contact-business-input').fill('Sterling Studio');
    await page.getByTestId('contact-phone-input').fill('555123456');

    await page.getByTestId('contact-city-dropdown-trigger').click();
    await page.getByTestId('contact-city-option-batumi').click();
    await expect(page.getByTestId('contact-city-dropdown-trigger')).toContainText('Batumi');

    await page.getByTestId('contact-submit-btn').click();

    await expect(page.getByTestId('for-businesses-success-message')).toBeVisible();
    expect(captured?.city).toBe('batumi');
  });

  test('send another — resets all fields after a successful submit', async ({ page }) => {
    await bypassSitePassword(page);
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    await page.goto('/for-businesses');

    await page.getByTestId('contact-name-input').fill('Alexander Sterling');
    await page.getByTestId('contact-business-input').fill('Sterling Studio');
    await page.getByTestId('contact-phone-input').fill('555123456');
    await page.getByTestId('contact-city-dropdown-trigger').click();
    await page.getByTestId('contact-city-option-kutaisi').click();
    await page.getByTestId('contact-message-textarea').fill('A message.');

    await page.getByTestId('contact-submit-btn').click();
    await expect(page.getByTestId('for-businesses-success-message')).toBeVisible();

    await page.getByTestId('for-businesses-send-another-btn').click();

    // Form returns with every field cleared and controls back to defaults.
    await expect(page.getByTestId('contact-name-input')).toHaveValue('');
    await expect(page.getByTestId('contact-business-input')).toHaveValue('');
    await expect(page.getByTestId('contact-phone-input')).toHaveValue('');
    await expect(page.getByTestId('contact-message-textarea')).toHaveValue('');
    await expect(page.getByTestId('contact-city-dropdown-trigger')).toContainText('Select City');
    // Country code resets to the GE +995 default. Asserted as two substrings, not
    // 'GE +995': the ISO and dial render as adjacent spans with no space between,
    // so the trigger's text is "GE+995" (a single 'GE +995' match would fail).
    const countryCode = page.getByTestId('contact-country-code-select');
    await expect(countryCode).toContainText('GE');
    await expect(countryCode).toContainText('+995');
  });
});
