import { test, expect } from '@playwright/test';
import { bypassSitePassword } from '../../utils/test-helpers';

/**
 * /contact form.
 *
 * Unlike the /for-businesses waitlist form (which POSTs a JSON API and is fully
 * page.route()-mockable), this form submits via a Next.js Server Action
 * (submitContactMessage) that inserts into `contact_messages` on success — a
 * server action can't be cleanly mocked and the DB call is server-side, so the
 * happy path isn't coverable without a live DB.
 *
 * These tests need NO DB and NO mock: the action runs all validation BEFORE the
 * insert, so an invalid email returns an error without ever touching the DB. The
 * happy-path success test (real submit + `contact_messages` cleanup) is a
 * deferred @db-suite item — build it with the other DB-dependent specs under
 * issue #99, not as a one-off here.
 */
test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/contact');
  });

  test('renders all fields', async ({ page }) => {
    await expect(page.getByTestId('contact-name-input')).toBeVisible();
    await expect(page.getByTestId('contact-email-input')).toBeVisible();
    await expect(page.getByTestId('contact-subject-select')).toBeVisible();
    await expect(page.getByTestId('contact-message-textarea')).toBeVisible();
    await expect(page.getByTestId('contact-submit-btn')).toBeVisible();

    // A fresh load is in neither the error nor the success state (both are
    // conditionally rendered), so guard against a component that inits in one.
    await expect(page.getByTestId('contact-error')).toHaveCount(0);
    await expect(page.getByTestId('contact-success')).toHaveCount(0);
  });

  test('invalid email shows an error and does NOT show success', async ({ page }) => {
    // "a@b" passes the browser's native type=email check but fails the server
    // action's stricter regex (which requires a dot in the domain). The action
    // returns the error before the DB insert — real action, no DB write, no mock.
    await page.getByTestId('contact-name-input').fill('Alexander Sterling');
    await page.getByTestId('contact-email-input').fill('a@b');
    await page.getByTestId('contact-subject-select').selectOption('customer-support');
    await page.getByTestId('contact-message-textarea').fill('Testing the contact form validation path.');

    await page.getByTestId('contact-submit-btn').click();

    await expect(page.getByTestId('contact-error')).toContainText('Invalid email address');
    await expect(page.getByTestId('contact-success')).toHaveCount(0);
  });
});
