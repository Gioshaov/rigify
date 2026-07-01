import { Page } from '@playwright/test';

/**
 * Bypass site password protection by setting the rigify_access cookie
 */
export async function bypassSitePassword(page: Page) {
  const secret = process.env.SITE_PASSWORD;
  if (!secret) return;

  // Create HMAC-based cookie value (must match middleware.ts logic)
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('rigify_access'));
  const cookieValue = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  await page.context().addCookies([{
    name: 'rigify_access',
    value: cookieValue,
    domain: 'localhost',
    path: '/',
  }]);
}

export async function loginAs(page: Page, email: string, password: string) {
  await bypassSitePassword(page);
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-btn').click();
  // Wait for navigation after login
  await page.waitForURL(/\/(dashboard|customer\/dashboard|staff-dashboard|admin)/, { timeout: 10000 });
}

// Selects artisan (if any), date, and time inside the open booking modal.
export async function selectDateAndTime(page: Page) {
  // Pick an artisan if the business has staff (confirm stays disabled otherwise)
  const artisan = page.getByTestId('booking-artisan-select');
  if ((await artisan.count()) > 0) {
    await artisan.selectOption('any').catch(() => {});
  }

  // Open the date popover and pick tomorrow (avoids past-date / midnight edge cases)
  await page.getByTestId('booking-date-field').click();
  await page.waitForSelector('[data-testid="booking-calendar"]', { timeout: 5000 });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const daySelector = `[data-testid="calendar-day-${dateStr}"]`;
  await page.waitForSelector(daySelector, { state: 'visible' });
  await page.click(daySelector);

  // The time dropdown enables once availability loads; choose the first real slot
  await page.waitForSelector('[data-testid="booking-time-select"]:not([disabled])', { timeout: 10000 });
  await page.locator('[data-testid="booking-time-select"]').selectOption({ index: 1 });
}

export function generateUniquePhone() {
  // Georgian mobile format: 5XX XXX XXX (9 digits)
  // Use test prefix 599 to clearly mark as test data
  return `599${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}
