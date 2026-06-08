## ⚠️ CRITICAL CONSIDERATIONS

Before implementing this plan, understand these non-negotiable requirements:

1. **Separate Test Database Required**
   - Tests MUST run against a dedicated Supabase project (`rigify-test`) or test schema
   - Running tests against production database will create garbage bookings
   - CI workflow requires `TEST_SUPABASE_*` secrets pointing to test project
   
2. **Site Password Protection**
   - Production site has password middleware (`/password` gate)
   - Tests must bypass this via cookie injection (implemented in `bypassSitePassword()` helper)
   - CI needs `SITE_PASSWORD` secret to generate valid cookies
   
3. **Test Data Seeding Must Be Idempotent**
   - Seed script creates test users/businesses marked with `is_test: true` flag
   - Safe to run multiple times without creating duplicates
   - Must run `npm run seed:test` before first test execution
   - Businesses table needs `is_test` column added (see migration)
   
4. **Environment Variable Names**
   - Project uses `SUPABASE_SERVICE_ROLE_KEY` (NOT `SUPABASE_SECRET_KEY`)
   - Must match actual `.env.local.example` format
   
5. **Test ID Audit Script Is Guidance Only**
   - Regex-based JSX parsing is unreliable
   - Use for development spot-checks, NOT as CI gate
   - Manual review still required for test ID coverage

6. **Calendar Date Selection Edge Cases**
   - `selectDateAndTime()` helper must wait for calendar render
   - Uses tomorrow's date to avoid midnight edge cases
   - Must wait for availability API response before showing time slots

## Context

Rigify is a Georgian beauty & wellness booking marketplace with comprehensive test ID coverage already in place (26 files have `data-testid` attributes), but **no automated testing infrastructure exists yet**. The project mandates test IDs on all interactive elements following strict naming conventions (`{context}-{purpose}-{type}`), making it ready for Playwright test automation.

**Why this matters:**
- Production-critical booking flow handles real customer appointments
- Input validation on bookings API prevents security issues (UUID validation, date rollover detection, etc.)
- 4 user types with different access levels (super admin, business owner, staff, customer)
- Real Supabase data with RLS policies that must work correctly
- Stitch designs with hover effects and transitions that must not regress
- Currently **zero automated tests** = regression risk with every change

This plan establishes Playwright E2E testing infrastructure and creates a comprehensive test suite covering critical user flows.

---

## Phase 0: Database Migration (PREREQUISITE)

### 0.1 Add `is_test` Column to Businesses Table

Create `supabase/migrations/YYYYMMDDHHMMSS_add_is_test_to_businesses.sql`:

```sql
-- Add is_test flag to mark test businesses (prevents them from appearing in production)
alter table public.businesses add column if not exists is_test boolean default false;

-- Index for efficient filtering
create index if not exists businesses_is_test_idx 
  on public.businesses(is_test) 
  where is_test = true;

-- Update RLS policies to exclude test businesses from public views
drop policy if exists "businesses_public_read" on public.businesses;
create policy "businesses_public_read"
  on public.businesses for select
  using (
    is_active = true 
    and (is_test = false or is_test is null) -- Exclude test businesses from public
  );

comment on column public.businesses.is_test is 
  'Marks test businesses for E2E testing - never shown in production queries';
```

### 0.2 Apply Migration

```bash
# Local development
supabase db push

# Verify column exists
supabase db execute "SELECT column_name FROM information_schema.columns WHERE table_name = 'businesses';"
```

### 0.3 Environment Setup

Create `.env.test.local` for local test runs:

```bash
# Test Supabase Project (create separate project at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key

# Site password (same as production for cookie generation)
SITE_PASSWORD=your-site-password

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=ka
```

**Option for local dev**: Point to production Supabase but ONLY run tests against `is_test=true` businesses. Risks creating test bookings in production DB.

**Recommended for CI**: Dedicated test Supabase project.

---

## Phase 1: Install and Configure Playwright

### 1.1 Install Playwright

```bash
npm install -D @playwright/test
npx playwright install --with-deps
```

### 1.2 Create `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add firefox and webkit for cross-browser testing later
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 1.3 Update `package.json` scripts

Add to `scripts` section:
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:report": "playwright show-report"
}
```

### 1.4 Create test directory structure

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── customer-register.spec.ts
│   │   └── admin-login.spec.ts
│   ├── booking/
│   │   ├── guest-booking-flow.spec.ts
│   │   ├── customer-booking-flow.spec.ts
│   │   └── booking-validation.spec.ts
│   ├── business/
│   │   ├── browse-studios.spec.ts
│   │   ├── business-profile.spec.ts
│   │   └── search-filters.spec.ts
│   ├── dashboard/
│   │   ├── business-dashboard.spec.ts
│   │   ├── customer-dashboard.spec.ts
│   │   └── staff-dashboard.spec.ts
│   ├── admin/
│   │   └── business-onboarding.spec.ts
│   └── fixtures/
│       ├── test-users.ts
│       └── test-data.ts
└── utils/
    ├── db-helpers.ts
    └── test-helpers.ts
```

### 1.5 Create `.gitignore` entries

Add to `.gitignore`:
```
/test-results/
/playwright-report/
/playwright/.cache/
```

---

## Phase 2: Create Test Utilities and Fixtures

### 2.1 Test Data Fixtures (`tests/e2e/fixtures/test-users.ts`)

```typescript
// Test user credentials
// IMPORTANT: These users must be created via seed script before tests run
export const TEST_USERS = {
  businessOwner: {
    email: 'playwright-owner@rigify.test',
    password: 'TestPassword123!',
    dashboardPath: '/dashboard'
  },
  customer: {
    email: 'playwright-customer@rigify.test',
    password: 'TestPassword123!',
    dashboardPath: '/customer/dashboard'
  },
  staff: {
    email: 'playwright-staff@rigify.test',
    password: 'TestPassword123!',
    dashboardPath: '/staff-dashboard'
  },
};

export const GUEST_CUSTOMER_DATA = {
  name: 'Playwright Test User',
  phone: '599999999', // Will be overridden with unique phone in tests
  email: 'playwright-guest@rigify.test'
};
```

### 2.2 Database Helpers (`tests/utils/db-helpers.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export async function cleanupTestBookings(customerPhone: string) {
  await adminClient
    .from('bookings')
    .delete()
    .eq('customer_phone', customerPhone);
}

export async function getTestBusiness() {
  const { data } = await adminClient
    .from('businesses')
    .select('id, slug, name')
    .eq('is_test', true) // Only get test businesses
    .eq('is_active', true)
    .limit(1)
    .single();
  return data;
}

export async function getTestService(businessId: string) {
  const { data } = await adminClient
    .from('services')
    .select('id, name, duration_minutes, price_min')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .limit(1)
    .single();
  return data;
}
```

### 2.3 Test Helpers (`tests/utils/test-helpers.ts`)

```typescript
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
  await page.waitForURL(/\/(dashboard|customer\/dashboard|staff-dashboard)/);
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
```

---

## Phase 3: Critical Test Suites

### 3.1 Guest Booking Flow (`tests/e2e/booking/guest-booking-flow.spec.ts`)

**What it tests:** The most critical flow - guest user booking an appointment without an account

```typescript
import { test, expect } from '@playwright/test';
import { selectDateAndTime, generateUniquePhone } from '../../utils/test-helpers';
import { cleanupTestBookings, getTestBusiness, getTestService } from '../../utils/db-helpers';
import { GUEST_CUSTOMER_DATA } from '../fixtures/test-users';

test.describe('Guest Booking Flow', () => {
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
    // 1. Browse businesses page
    await page.goto('/businesses');
    await expect(page.getByTestId('browse-studios-hero-title')).toBeVisible();
    
    // 2. Click on a business card
    await page.getByTestId(`business-card-${testBusiness.id}`).click();
    await expect(page).toHaveURL(new RegExp(`/businesses/${testBusiness.slug}`));
    
    // 3. Click "Book Service" button for a service
    await page.getByTestId(`book-service-btn-${testService.id}`).first().click();
    await expect(page).toHaveURL(new RegExp(`/businesses/${testBusiness.slug}/book`));
    
    // 4. Select date and time
    await selectDateAndTime(page);
    
    // 5. Fill customer details
    await page.getByTestId('customer-name-input').fill(GUEST_CUSTOMER_DATA.name);
    await page.getByTestId('customer-phone-input').fill(uniquePhone);
    await page.getByTestId('customer-email-input').fill(GUEST_CUSTOMER_DATA.email);
    
    // 6. Confirm booking
    await page.getByTestId('confirm-booking-btn').click();
    
    // 7. Verify confirmation page
    await expect(page).toHaveURL(/\/booking-confirmed/);
    await expect(page.getByTestId('booking-confirmed-title')).toBeVisible();
    await expect(page.getByTestId('booking-confirmed-business-name')).toContainText(testBusiness.name);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(`/businesses/${testBusiness.slug}/book?service=${testService.id}`);
    
    // Try to submit without filling fields
    const confirmBtn = page.getByTestId('confirm-booking-btn');
    await expect(confirmBtn).toBeDisabled();
    
    // Fill only name
    await page.getByTestId('customer-name-input').fill('Test Name');
    await expect(confirmBtn).toBeDisabled();
    
    // Fill phone
    await page.getByTestId('customer-phone-input').fill(uniquePhone);
    await expect(confirmBtn).toBeDisabled(); // Still disabled (no date/time)
    
    // Select date and time
    await selectDateAndTime(page);
    await expect(confirmBtn).toBeEnabled();
  });
});
```

### 3.2 Login Flow (`tests/e2e/auth/login.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Login Flow', () => {
  test('should login business owner and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('email-input').fill(TEST_USERS.businessOwner.email);
    await page.getByTestId('password-input').fill(TEST_USERS.businessOwner.password);
    await page.getByTestId('sign-in-btn').click();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('sidebar-dashboard-link')).toBeVisible();
  });

  test('should login customer and redirect to customer dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('email-input').fill(TEST_USERS.customer.email);
    await page.getByTestId('password-input').fill(TEST_USERS.customer.password);
    await page.getByTestId('sign-in-btn').click();
    
    await expect(page).toHaveURL('/customer/dashboard');
    await expect(page.getByTestId('customer-sidebar-my-bookings-link')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('email-input').fill('wrong@email.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('sign-in-btn').click();
    
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page).toHaveURL('/login'); // Should stay on login page
  });

  test('should block super admin from regular login', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('email-input').fill(TEST_USERS.superAdmin.email);
    await page.getByTestId('password-input').fill(TEST_USERS.superAdmin.password);
    await page.getByTestId('sign-in-btn').click();
    
    // Should fail and show error
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
```

### 3.3 Browse Studios & Search (`tests/e2e/business/browse-studios.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Browse Studios Page', () => {
  test('should display business grid with cards', async ({ page }) => {
    await page.goto('/businesses');
    
    // Check hero section
    await expect(page.getByTestId('browse-studios-hero-title')).toBeVisible();
    await expect(page.getByTestId('browse-studios-search-input')).toBeVisible();
    
    // Check business cards are rendered
    const businessCards = page.locator('[data-testid^="business-card-"]');
    await expect(businessCards.first()).toBeVisible();
  });

  test('should filter businesses by search query', async ({ page }) => {
    await page.goto('/businesses');
    
    const searchInput = page.getByTestId('browse-studios-search-input');
    await searchInput.fill('barber');
    await page.getByTestId('browse-studios-search-btn').click();
    
    // Wait for URL to update with search param
    await expect(page).toHaveURL(/search=barber/);
    
    // Business cards should be filtered
    const businessCards = page.locator('[data-testid^="business-card-"]');
    await expect(businessCards.first()).toBeVisible();
  });

  test('should filter businesses by city', async ({ page }) => {
    await page.goto('/businesses');
    
    const citySelect = page.getByTestId('browse-studios-city-select');
    await citySelect.selectOption('tbilisi');
    
    // Wait for URL to update
    await expect(page).toHaveURL(/city=tbilisi/);
  });

  test('should preserve Stitch design hover effects', async ({ page }) => {
    await page.goto('/businesses');
    
    const firstCard = page.locator('[data-testid^="business-card-"]').first();
    const cardImage = firstCard.locator('img').first();
    
    // Hover and check that transition classes exist
    await firstCard.hover();
    
    // The image should have scale/grayscale transition classes
    const imageClasses = await cardImage.getAttribute('class');
    expect(imageClasses).toContain('transition');
  });
});
```

### 3.4 Booking Validation (`tests/e2e/booking/booking-validation.spec.ts`)

**Tests the API-level validation rules from `/api/bookings/route.ts`**

```typescript
import { test, expect } from '@playwright/test';
import { generateUniquePhone } from '../../utils/test-helpers';
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
    await page.goto(`/businesses/${testBusiness.slug}/book?service=${testService.id}`);
    
    // Select date/time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByTestId(`calendar-day-${tomorrow.getDate()}`).click();
    await page.locator('[data-testid^="time-slot-"]:not([disabled])').first().click();
    
    // Fill form with invalid phone
    await page.getByTestId('customer-name-input').fill('Test User');
    await page.getByTestId('customer-phone-input').fill('123'); // Too short
    await page.getByTestId('confirm-booking-btn').click();
    
    // Should show validation error from API
    await expect(page.locator('text=Invalid phone format')).toBeVisible();
  });

  test('should reject invalid name format', async ({ page }) => {
    await page.goto(`/businesses/${testBusiness.slug}/book?service=${testService.id}`);
    
    // Select date/time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByTestId(`calendar-day-${tomorrow.getDate()}`).click();
    await page.locator('[data-testid^="time-slot-"]:not([disabled])').first().click();
    
    // Fill form with invalid name (special characters)
    await page.getByTestId('customer-name-input').fill('Test@#$User');
    await page.getByTestId('customer-phone-input').fill(uniquePhone);
    await page.getByTestId('confirm-booking-btn').click();
    
    // Should show validation error
    await expect(page.locator('text=Invalid name format')).toBeVisible();
  });

  test('should prevent booking past dates', async ({ page }) => {
    // This test would require manipulating the calendar to select a past date
    // which is prevented by the UI (past dates are disabled)
    // But we can test by directly calling the API
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    const response = await page.request.post('/api/bookings', {
      data: {
        businessId: testBusiness.id,
        serviceId: testService.id,
        date: dateStr,
        startTime: '10:00',
        customerName: 'Test User',
        customerPhone: uniquePhone,
        staffId: null
      }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('past');
  });
});
```

### 3.5 Business Dashboard (`tests/e2e/dashboard/business-dashboard.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../../utils/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Business Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USERS.businessOwner.email, TEST_USERS.businessOwner.password);
  });

  test('should display dashboard overview', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-overview-title')).toBeVisible();
    await expect(page.getByTestId('sidebar-dashboard-link')).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    await page.getByTestId('sidebar-services-link').click();
    await expect(page).toHaveURL('/dashboard/services');
    await expect(page.getByTestId('services-page-title')).toBeVisible();
  });

  test('should navigate to staff page', async ({ page }) => {
    await page.getByTestId('sidebar-staff-link').click();
    await expect(page).toHaveURL('/dashboard/staff');
    await expect(page.getByTestId('staff-page-title')).toBeVisible();
  });

  test('should navigate to appointments page', async ({ page }) => {
    await page.getByTestId('sidebar-appointments-link').click();
    await expect(page).toHaveURL('/dashboard/appointments');
    await expect(page.getByTestId('appointments-page-title')).toBeVisible();
  });
});
```

---

## Phase 4: CI/CD Integration

### 4.1 Create GitHub Actions Workflow (`.github/workflows/playwright.yml`)

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    env:
      # Test Supabase project (separate from production)
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
      
      # Site password bypass
      SITE_PASSWORD: ${{ secrets.SITE_PASSWORD }}
      
      # App config
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      NEXT_PUBLIC_DEFAULT_LOCALE: ka
    
    steps:
    - uses: actions/checkout@v4
    
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    
    - name: Seed test database
      run: npm run seed:test
    
    - name: Run Playwright tests
      run: npm run test:e2e
    
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

**Required GitHub Secrets** (Settings → Secrets → Actions):
- `TEST_SUPABASE_URL` - Test Supabase project URL
- `TEST_SUPABASE_ANON_KEY` - Test Supabase anon key
- `TEST_SUPABASE_SERVICE_ROLE_KEY` - Test Supabase service role key
- `SITE_PASSWORD` - Password from production (for cookie generation)

### 4.2 Add Test Database Setup & Migration

**CRITICAL**: Tests require a separate Supabase project or a dedicated test database to avoid polluting production data.

#### Option A: Separate Supabase Project (Recommended for CI)

1. Create new Supabase project: `rigify-test`
2. Apply all migrations from `supabase/migrations/`
3. Add GitHub secrets:
   - `TEST_SUPABASE_URL`
   - `TEST_SUPABASE_ANON_KEY`
   - `TEST_SUPABASE_SERVICE_ROLE_KEY`

#### Option B: Test Schema in Same Database (Local Dev Only)

Add `is_test` boolean column to `businesses` table:

```sql
-- Migration: Add test flag to businesses table
alter table public.businesses add column if not exists is_test boolean default false;

create index if not exists businesses_is_test_idx on public.businesses(is_test) where is_test = true;

comment on column public.businesses.is_test is 'Marks test businesses for E2E testing - never shown in production queries';
```

#### Seed Script (`tests/setup/seed-test-data.ts`)

```typescript
import { adminClient } from '../utils/db-helpers';
import { TEST_USERS } from '../e2e/fixtures/test-users';

/**
 * Seeds test data for Playwright tests
 * Idempotent - safe to run multiple times
 */
export async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  // 1. Create test business owner (idempotent check)
  let ownerId: string;
  const { data: existingOwner } = await adminClient.auth.admin.listUsers();
  const ownerUser = existingOwner.users.find(u => u.email === TEST_USERS.businessOwner.email);
  
  if (ownerUser) {
    console.log('  ✓ Business owner already exists');
    ownerId = ownerUser.id;
  } else {
    const { data: ownerAuth, error } = await adminClient.auth.admin.createUser({
      email: TEST_USERS.businessOwner.email,
      password: TEST_USERS.businessOwner.password,
      email_confirm: true,
    });
    
    if (error) throw new Error(`Failed to create owner: ${error.message}`);
    ownerId = ownerAuth.user!.id;
    console.log('  ✓ Created business owner');
  }

  // 2. Create test business (idempotent)
  const { data: existingBusiness } = await adminClient
    .from('businesses')
    .select('id')
    .eq('slug', 'playwright-test-salon')
    .maybeSingle();
  
  if (!existingBusiness) {
    await adminClient.from('businesses').insert({
      owner_id: ownerId,
      name: 'Playwright Test Salon',
      slug: 'playwright-test-salon',
      city: 'tbilisi',
      district: 'vake',
      address: '123 Test Street',
      phone: '599000000',
      is_active: true,
      is_test: true, // CRITICAL: Mark as test business
    });
    console.log('  ✓ Created test business');
  } else {
    console.log('  ✓ Test business already exists');
  }

  // 3. Create test service
  const { data: business } = await adminClient
    .from('businesses')
    .select('id')
    .eq('slug', 'playwright-test-salon')
    .single();
  
  const { data: existingService } = await adminClient
    .from('services')
    .select('id')
    .eq('business_id', business.id)
    .eq('name', 'Test Haircut Service')
    .maybeSingle();
  
  if (!existingService) {
    await adminClient.from('services').insert({
      business_id: business.id,
      name: 'Test Haircut Service',
      description: 'A test service for E2E testing',
      category: 'hair',
      duration_minutes: 45,
      price_min: 50,
      price_max: 50,
      is_active: true,
    });
    console.log('  ✓ Created test service');
  } else {
    console.log('  ✓ Test service already exists');
  }

  // 4. Create test customer (idempotent)
  const customerUser = existingOwner?.users.find(u => u.email === TEST_USERS.customer.email);
  let customerId: string;
  
  if (customerUser) {
    console.log('  ✓ Customer already exists');
    customerId = customerUser.id;
  } else {
    const { data: customerAuth, error } = await adminClient.auth.admin.createUser({
      email: TEST_USERS.customer.email,
      password: TEST_USERS.customer.password,
      email_confirm: true,
    });
    
    if (error) throw new Error(`Failed to create customer: ${error.message}`);
    customerId = customerAuth.user!.id;
    console.log('  ✓ Created customer user');
  }
  
  // Create customer profile
  const { data: existingCustomerProfile } = await adminClient
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .maybeSingle();
  
  if (!existingCustomerProfile) {
    await adminClient.from('customers').insert({
      id: customerId,
      name: 'Playwright Test Customer',
      phone: '599111111',
      email: TEST_USERS.customer.email,
    });
    console.log('  ✓ Created customer profile');
  } else {
    console.log('  ✓ Customer profile already exists');
  }

  console.log('✅ Test data seeding complete\n');
}

/**
 * Cleanup old test bookings (keeps database clean)
 */
export async function cleanupOldTestBookings() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const { data: testBusiness } = await adminClient
    .from('businesses')
    .select('id')
    .eq('is_test', true)
    .single();
  
  if (testBusiness) {
    const { count } = await adminClient
      .from('bookings')
      .delete()
      .eq('business_id', testBusiness.id)
      .lt('created_at', threeDaysAgo.toISOString());
    
    console.log(`🧹 Cleaned up ${count || 0} old test bookings`);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData()
    .then(() => cleanupOldTestBookings())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
```

Add script to `package.json`:
```json
{
  "seed:test": "ts-node tests/setup/seed-test-data.ts"
}
```

**Usage**:
```bash
# Before running tests locally
npm run seed:test

# In CI, add to workflow before test step
```

---

## Phase 5: Test Coverage Verification

### 5.1 Missing Test IDs Audit Script

**NOTE**: Regex-based JSX parsing is unreliable (misses multiline elements, triggers on comments). This script provides rough guidance but **should NOT be used as a gate in CI**. Manual review is still required.

Create `scripts/audit-test-ids.ts`:

```typescript
import fs from 'fs';
import path from 'path';

/**
 * Simple audit script to find potential missing test IDs
 * 
 * LIMITATIONS:
 * - Regex cannot parse JSX reliably
 * - Misses multiline element declarations
 * - False positives on commented code
 * - Cannot detect semantic "should this have a test ID?" logic
 * 
 * USE FOR: Quick spot-checks during development
 * DO NOT USE FOR: CI gates or strict validation
 */

const interactiveElements = [
  'button',
  'input',
  'select',
  'textarea',
  'Link', // Next.js Link component
];

interface Finding {
  file: string;
  line: number;
  element: string;
  snippet: string;
}

function findMissingTestIds(dir: string, findings: Finding[] = []): Finding[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.')) {
      findMissingTestIds(fullPath, findings);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Skip commented lines (basic check)
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return;
        }
        
        for (const element of interactiveElements) {
          // Simple pattern: <element with no data-testid
          const pattern = new RegExp(`<${element}[^>]*>`, 'i');
          if (pattern.test(line) && !line.includes('data-testid')) {
            findings.push({
              file: fullPath.replace(process.cwd(), ''),
              line: index + 1,
              element,
              snippet: line.trim().substring(0, 80),
            });
          }
        }
      });
    }
  }
  
  return findings;
}

// Run audit
const findings = findMissingTestIds('./app');
findMissingTestIds('./components', findings);

if (findings.length === 0) {
  console.log('✅ No obvious missing test IDs found (note: this is a basic check)');
} else {
  console.log(`⚠️  Found ${findings.length} potential missing test IDs:\n`);
  
  // Group by file
  const byFile = findings.reduce((acc, f) => {
    if (!acc[f.file]) acc[f.file] = [];
    acc[f.file].push(f);
    return acc;
  }, {} as Record<string, Finding[]>);
  
  Object.entries(byFile).forEach(([file, items]) => {
    console.log(`📄 ${file}`);
    items.forEach(item => {
      console.log(`   Line ${item.line}: <${item.element}> - ${item.snippet}...`);
    });
    console.log('');
  });
  
  console.log('⚠️  NOTE: This audit has false positives. Review each finding manually.');
}
```

Add script to `package.json`:
```json
{
  "audit:testids": "ts-node scripts/audit-test-ids.ts"
}
```

**Usage**:
```bash
# Run during development (not in CI)
npm run audit:testids
```

---

## Phase 6: Documentation Updates

### 6.1 Update `CLAUDE.md`

Add new section under "Testing & Test Automation":

```markdown
### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug tests/e2e/booking/guest-booking-flow.spec.ts

# View last test report
npm run test:report
```

### Test Organization

- `tests/e2e/auth/` - Authentication flows (login, register)
- `tests/e2e/booking/` - Booking flows (guest, customer, validation)
- `tests/e2e/business/` - Business browsing, search, filters
- `tests/e2e/dashboard/` - Dashboard tests (business, customer, staff)
- `tests/e2e/admin/` - Admin panel tests
- `tests/utils/` - Test helpers and database utilities
- `tests/e2e/fixtures/` - Test data and user credentials

### Writing New Tests

1. Always use existing test IDs (never hardcode selectors like `.btn` or `#submit`)
2. Use test helpers from `tests/utils/test-helpers.ts`
3. Clean up test data in `afterEach` hooks
4. Use unique phone numbers via `generateUniquePhone()`
5. Follow AAA pattern: Arrange, Act, Assert
```

### 6.2 Create `TESTING.md`

Create comprehensive testing guide:

```markdown
# Testing Guide

## Overview

Rigify uses Playwright for end-to-end testing. All interactive components have `data-testid` attributes following the `{context}-{purpose}-{type}` naming convention.

## Quick Start

```bash
# Install dependencies
npm install

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
   - Search filters (name, city, category)
   - Stitch design hover effects
   
4. **Input Validation** - Security critical
   - Phone format validation
   - Name format validation
   - Past date prevention
   - UUID validation

### Test Data Management

**Test Users** (defined in `tests/e2e/fixtures/test-users.ts`):
- Business Owner: `test-owner@rigify.ge`
- Customer: `test-customer@rigify.ge`
- Staff: `test-staff@rigify.ge`
- Super Admin: `admin@rigify.ge`

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
   import { loginAs, selectDateAndTime } from '../../utils/test-helpers';
   
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

## Debugging Failed Tests

```bash
# Run test in debug mode
npm run test:e2e:debug tests/e2e/booking/guest-booking-flow.spec.ts

# Run with headed browser
npm run test:e2e:headed

# View last test report
npm run test:report
```

## Adding New Tests

1. Identify user flow to test
2. Check that all components have test IDs (run `npm run audit:testids`)
3. Create test file in appropriate directory
4. Import test helpers and fixtures
5. Write tests following AAA pattern
6. Add cleanup hooks
7. Run locally to verify
8. Create PR (tests will run in CI)
```

---

## Implementation Order

### Prerequisites (Before Writing Any Tests)

1. **Database Migration** (5 min)
   - Add `is_test` column to `businesses` table
   - Create migration file in `supabase/migrations/`
   - Apply migration: `supabase db push`

2. **Test Supabase Project Setup** (10 min)
   - Create new Supabase project: `rigify-test`
   - Apply all migrations from `supabase/migrations/`
   - Note credentials for `.env.test.local`

### Core Implementation

3. **Phase 1** (15 min) - Install Playwright, create config, update package.json
4. **Phase 2** (30 min) - Create test utilities, fixtures, helpers
   - Database helpers with correct env var names
   - Site password bypass logic
   - Idempotent test data seeding
5. **Phase 2.5** (10 min) - Seed test data
   - Run `npm run seed:test` locally
   - Verify test business and users exist
6. **Phase 3.1** (30 min) - Guest booking flow test (CRITICAL)
7. **Phase 3.2** (20 min) - Login flow tests
8. **Phase 3.3** (20 min) - Browse studios tests
9. **Phase 3.4** (30 min) - Booking validation tests
10. **Phase 3.5** (15 min) - Business dashboard tests
11. **Phase 4** (20 min) - CI/CD workflow setup
    - Add GitHub secrets for test Supabase project
    - Add SITE_PASSWORD secret
    - Configure workflow to seed before tests
12. **Phase 5** (10 min) - Test ID audit script (guidance only)
13. **Phase 6** (15 min) - Documentation updates

**Total estimated time: ~3.5 hours**

---

## Verification Checklist

### Local Development

1. ✅ Database migration applied (`is_test` column exists)
2. ✅ Test Supabase project created (or `is_test` flag strategy confirmed)
3. ✅ `.env.test.local` configured with correct keys
4. ✅ Test data seeded (`npm run seed:test` succeeds)
5. ✅ Test business exists and marked with `is_test: true`
6. ✅ Site password bypass works (cookie injection)
7. ✅ `npm run test:e2e` runs all tests successfully
8. ✅ Guest booking flow test passes end-to-end
9. ✅ Login tests pass for all user types
10. ✅ Validation tests catch API-level errors
11. ✅ Test report generated and viewable (`npm run test:report`)
12. ✅ No test data polluting production queries

### CI/CD Integration

13. ✅ GitHub secrets added:
    - `TEST_SUPABASE_URL`
    - `TEST_SUPABASE_ANON_KEY`
    - `TEST_SUPABASE_SERVICE_ROLE_KEY`
    - `SITE_PASSWORD`
14. ✅ Test workflow runs successfully on push
15. ✅ Seed step runs before tests in CI
16. ✅ Test artifacts uploaded (Playwright report)
17. ✅ Tests run against test Supabase project (not production)

### Code Quality

18. ✅ All test files follow consistent patterns (AAA, test IDs, cleanup)
19. ✅ No hardcoded credentials in test files
20. ✅ Test helpers properly handle async/waits
21. ✅ Documentation updated in CLAUDE.md and TESTING.md

---

## Success Criteria

- **Zero** failing tests on `main` branch
- **100%** coverage of critical booking flow
- **All** user authentication flows tested
- **API validation** rules verified via E2E tests
- **CI/CD** integrated and passing
- **Documentation** complete and accurate
- **Test ID coverage** audit passes (no missing IDs on interactive elements)

---

## Troubleshooting Common Issues

### "Cannot connect to Supabase"
- ✅ Check `.env.test.local` has correct URL and keys
- ✅ Verify test Supabase project is active
- ✅ Confirm env vars loaded (restart dev server)

### "Test business not found"
- ✅ Run seed script: `npm run seed:test`
- ✅ Verify business exists: Query `businesses` where `is_test = true`
- ✅ Check `slug` matches: `playwright-test-salon`

### "Redirected to /password page"
- ✅ `SITE_PASSWORD` env var set correctly
- ✅ `bypassSitePassword()` called before navigation
- ✅ Cookie domain matches (`localhost` in tests)

### "No available time slots"
- ✅ Selected date is in the future (tomorrow, not today)
- ✅ Availability API returning slots (check network tab)
- ✅ Staff exists for test business (seed creates service but not staff)

### "Permission denied" on booking creation
- ✅ Using `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_SECRET_KEY`)
- ✅ RLS grants exist on `bookings` table
- ✅ Test user has correct profile (customer or business owner)

### "Test creates booking in production"
- ✅ Verify `.env.test.local` points to test Supabase project
- ✅ Check `getTestBusiness()` filters by `is_test: true`
- ✅ Never run tests with production credentials in CI

### "Calendar day not clickable"
- ✅ Wait for calendar render: `waitForSelector('[data-testid^="calendar-day-"]')`
- ✅ Using tomorrow's date (avoids past date disabled state)
- ✅ Check calendar loads without errors (check console)

---

## Future Enhancements (Post-MVP)

- Visual regression testing (Playwright screenshots)
- Cross-browser testing (Firefox, WebKit)
- Mobile viewport tests
- Performance tests (Lighthouse CI)
- Accessibility tests (axe-core integration)
- API-only tests (non-E2E)
- Load testing (Artillery or k6)