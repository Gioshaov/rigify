# Testing Guide

## Overview

Rigify uses Playwright for end-to-end testing. All interactive components have `data-testid` attributes following the `{context}-{purpose}-{type}` naming convention.

## Quick Start

```bash
# Install dependencies
npm install

# Seed test data (required before first run)
npm run seed:test

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/booking/guest-booking-flow.spec.ts

# Open test UI (recommended for development)
npm run test:e2e:ui
```

## Test Structure

### Critical Flows Covered

1. **Guest Booking Flow** - Most critical path
   - Browse businesses → Select business → Book service → Confirm
   - Validates entire public booking funnel

2. **Authentication** - User login/register
   - Business owner login → dashboard redirect
   - Customer login → customer dashboard redirect
   - Invalid credentials → error handling

3. **Search & Browse** - Discovery features
   - Business grid rendering
   - Search filters (name, district, category)
   - Stitch design hover effects

4. **Input Validation** - Security critical
   - Phone format validation
   - Name format validation
   - Past date prevention

5. **Business Dashboard** - Dashboard navigation
   - Navigate to services, staff, appointments, settings
   - Verify correct routing for business owners

### Test Data Management

**Test Users** (defined in `tests/e2e/fixtures/test-users.ts`):
- Business Owner: `playwright-owner@rigify.test`
- Customer: `playwright-customer@rigify.test`

**Test Business**:
- Name: Playwright Test Salon
- Slug: `playwright-test-salon`
- Marked with `is_test: true` flag (excluded from production)

**Database Cleanup**:
- Always clean up test bookings in `afterEach` hooks
- Use `cleanupTestBookings(phone)` helper
- Generate unique phones via `generateUniquePhone()`

## Writing Tests

### Best Practices

1. **Use Test IDs, Never CSS Selectors**
   ```typescript
   // ✅ Good
   await page.getByTestId('confirm-booking-btn').click();

   // ❌ Bad
   await page.locator('.btn-primary').click();
   ```

2. **Use Test Helpers**
   ```typescript
   import { loginAs, selectDateAndTime, bypassSitePassword } from '../../utils/test-helpers';

   await bypassSitePassword(page);
   await loginAs(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
   await selectDateAndTime(page);
   ```

3. **Clean Up After Tests**
   ```typescript
   test.afterEach(async () => {
     await cleanupTestBookings(uniquePhone);
   });
   ```

4. **Use Descriptive Test Names**
   ```typescript
   // ✅ Good
   test('should reject invalid phone format and show error message', async ({ page }) => {

   });

   // ❌ Bad
   test('phone validation', async ({ page }) => {

   });
   ```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

GitHub Actions workflow: `.github/workflows/playwright.yml`

### Required GitHub Secrets

Configure these in your repository settings (Settings → Secrets → Actions):

- `TEST_SUPABASE_URL` - Test Supabase project URL
- `TEST_SUPABASE_ANON_KEY` - Test Supabase anon key
- `TEST_SUPABASE_SERVICE_ROLE_KEY` - Test Supabase service role key
- `SITE_PASSWORD` - Password from production (for cookie generation)

## Debugging Failed Tests

```bash
# Run test in debug mode
npm run test:e2e:debug tests/e2e/booking/guest-booking-flow.spec.ts

# Run with headed browser (see what's happening)
npm run test:e2e:headed

# View last test report
npm run test:report
```

## Adding New Tests

1. Identify user flow to test
2. Check that all components have test IDs (run `npm run audit:testids`)
3. Create test file in appropriate directory
4. Import test helpers and fixtures
5. Write tests following AAA pattern (Arrange, Act, Assert)
6. Add cleanup hooks
7. Run locally to verify
8. Create PR (tests will run in CI)

## Test ID Audit

Run the audit script to find potential missing test IDs:

```bash
npm run audit:testids
```

**Note**: This script uses regex and has false positives. Use it as guidance during development, not as a strict gate.

## Troubleshooting

### "Cannot connect to Supabase"
- Check `.env.local` has correct URL and keys
- Verify Supabase project is active
- Restart dev server after env changes

### "Test business not found"
- Run seed script: `npm run seed:test`
- Verify business exists with `is_test = true`

### "Redirected to /password page"
- `SITE_PASSWORD` env var must be set
- `bypassSitePassword()` must be called before navigation

### "No available time slots"
- Selected date must be in the future (tomorrow, not today)
- Check if test business has staff members

### "Permission denied" on booking creation
- Using `SUPABASE_SERVICE_ROLE_KEY` (correct env var name)
- RLS grants exist on tables
