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
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('sign-in-btn').click();
  // Wait for navigation after login
  await page.waitForURL(/\/(dashboard|customer\/dashboard|staff-dashboard|admin)/, { timeout: 10000 });
}

export async function selectDateAndTime(page: Page) {
  // Wait for calendar to be visible
  await page.waitForSelector('[data-testid^="calendar-day-"]', { timeout: 5000 });

  // Get tomorrow's date to avoid past date issues and midnight edge cases
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = tomorrow.getDate();

  // Click tomorrow's calendar day
  const daySelector = `[data-testid="calendar-day-${day}"]`;
  await page.waitForSelector(daySelector, { state: 'visible' });
  await page.click(daySelector);

  // Wait for time slots to load after selecting date
  await page.waitForSelector('[data-testid^="time-slot-"]:not([disabled])', { timeout: 10000 });

  // Select first available time slot
  const firstAvailableSlot = page.locator('[data-testid^="time-slot-"]:not([disabled])').first();
  await firstAvailableSlot.click();
}

export function generateUniquePhone() {
  // Georgian mobile format: 5XX XXX XXX (9 digits)
  // Use test prefix 599 to clearly mark as test data
  return `599${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}
