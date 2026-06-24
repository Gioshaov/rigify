# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Working Principles

These govern how we collaborate. They apply to every task.

1. **Ask, don't assume.** If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements. When running unattended, pick the most reasonable interpretation, proceed, and record the assumption rather than blocking.

2. **Match solution complexity to problem complexity.** Implement the simplest solution for simple problems, better solutions for harder problems. Do not over-engineer or add flexibility that isn't needed yet.

3. **Stay in scope, but surface smells.** Don't touch unrelated code — but do flag bad code or design smells discovered along the way so we can address them as a separate issue.

4. **Flag uncertainty explicitly.** If unsure about something, ask (see #1). Where it makes sense, run a small, localised, low-risk experiment and bring the hypothesis and results back to discuss. Confidence without certainty causes more damage than admitting a gap.

5. **Suggest better ways.** Don't hesitate to propose a better approach — especially one with long-lasting impact over a tactical change.

---

## ⚠️ CRITICAL: Implementing Stitch Designs

**When implementing ANY page with a Stitch design, you MUST:**

1. **Reference the original design file** at `design-assets/stitch_rigify/<design-name>/`
   - Read the `code.html` file to see exact classes and structure
   - View the `screen.png` to understand visual behavior
   
2. **Preserve ALL hover effects and transitions:**
   - Image hover effects (scale, grayscale transitions)
   - Border hover effects (color changes)
   - Text hover effects (color transitions)
   - Card/container hover effects
   - Check transition durations (duration-300, duration-700, etc.)
   
3. **Verify before committing:**
   - Compare your implementation to the design file
   - Check all interactive states (hover, focus, active)
   - Test in browser to verify animations work
   
4. **Add design reference comment in code:**
   ```tsx
   // Stitch Design: design-assets/stitch_rigify/<design-name>/
   ```

**If you simplify or modify a Stitch component**, you risk losing critical visual design elements. Always start from the original design and adapt, don't rebuild from scratch.

---

## UI Design System

**Always read `UI_GUIDE.md` before any UI work in this project.**

This single consolidated guide contains:
- Design philosophy and color system (WCAG AA compliant)
- Component patterns and page layouts
- Accessibility guidelines and requirements
- Known issues and improvement roadmap
- Component checklist for new work

---

## ⚠️ CRITICAL: Test IDs Are Mandatory

**EVERY TIME YOU CREATE OR MODIFY A COMPONENT, YOU MUST ADD `data-testid` ATTRIBUTES.**

This is NOT optional. This is NOT a separate task. This is part of the definition of "done" for any component work.

**If you create/modify a component without test IDs, the work is incomplete.**

### Rules

- **Every interactive and meaningful element must have a `data-testid`.**
- **Every `data-testid` must be unique within the page/view.**
- **Naming convention:** Use the pattern `{context}-{purpose}-{type}` in kebab-case.
   - `context` = feature + component, e.g. `edit-service`, `loan-report`, `investor-filter`
   - `purpose` = what the element is for, e.g. `name`, `price-min`, `submit`, `close`
   - `type` = element kind, e.g. `input`, `btn`, `dropdown`, `checkbox`, `modal`, `table`
   - Full examples: `edit-service-name-input`, `loan-report-date-picker`, `investor-filter-submit-btn`
   - Never use generic names like `button`, `input`, `item` without context and purpose prefixes
- **Dynamic lists:** Include the record identifier in the ID — e.g. `loan-row-{loanId}`, `investor-card-{investorId}`
- **Do not reuse IDs across different components**, even if they look similar.

See "Testing & Test Automation" section below for full requirements.

---

## ⚠️ CRITICAL: JSX Text Content Rules

**ALWAYS escape apostrophes and quotes in JSX text content to prevent ESLint errors and Vercel build failures.**

### Rules

- **Apostrophes in contractions** → Use `&apos;`
  - ❌ WRONG: `We're here to help`
  - ✅ CORRECT: `We&apos;re here to help`
  - Examples: don't → don&apos;t, it's → it&apos;s, Georgia's → Georgia&apos;s

- **Double quotes in text** → Use `&quot;`
  - ❌ WRONG: `Rigify ("we", "our", "us")`
  - ✅ CORRECT: `Rigify (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;)`
  - Examples: "Platform" → &quot;Platform&quot;, "as is" → &quot;as is&quot;

### Why This Matters

- ESLint rule `react/no-unescaped-entities` will fail the build on Vercel if not escaped
- Prevents deployment failures and CI/CD issues
- Required for all user-facing text content in JSX

### When to Apply

- **Always** when writing user-facing text in JSX elements
- Marketing pages, error messages, help text, descriptions
- Any `<p>`, `<h1>-<h6>`, `<span>`, `<li>` text content with apostrophes or quotes

---

## Project Overview

**Rigify** is a Georgian beauty & wellness booking marketplace (like Booksy/Fresha for Georgia) with:
- **Marketplace** — customers discover and book businesses
- **Salome AI** — voice receptionist add-on (existing POC, needs platform integration)
- **Social bots** — Instagram/Facebook DM chatbots (planned)

**Tech**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), deployed to Vercel.

**Domain**: `rigify.ge` (planned)

---

## Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run type-check       # TypeScript validation

# Database (Supabase CLI required)
supabase db push         # Apply migrations
supabase db reset        # Reset database (destructive)

# Git
git push origin main     # Push to GitHub
```

---

## Testing & Test Automation

**Test Framework**: Playwright (for E2E browser testing)

### ⚠️ CRITICAL REQUIREMENT: Always Add Test IDs

**WHEN CREATING OR MODIFYING ANY COMPONENT, YOU MUST ADD `data-testid` ATTRIBUTES TO ALL INTERACTIVE ELEMENTS IN THE SAME COMMIT.**

- **DO NOT** create a component without test IDs and plan to add them later
- **DO NOT** skip test IDs even if the task seems urgent
- **DO NOT** wait for a separate "add test IDs" task
- Test IDs are NOT optional - they are a required part of every component

**This applies to:**
- New components (forms, cards, modals, pages)
- Modified components (adding buttons, inputs, links)
- All interactive elements (buttons, inputs, links, selects, textareas)

### Test ID Strategy

All interactive elements MUST use `data-testid` attributes for Playwright selectors.

**Pattern:**
```tsx
// Buttons - {context}-{purpose}-{type}
<button data-testid="booking-flow-confirm-btn">Confirm Booking</button>
<button data-testid="booking-confirmed-add-calendar-btn">Add to Calendar</button>

// Form inputs
<input data-testid="browse-studios-search-input" type="text" />
<select data-testid="browse-studios-city-select">...</select>

// Links/Navigation
<Link data-testid="nav-home-link" href="/">Home</Link>
<Link data-testid="nav-businesses-link" href="/businesses">Browse Studios</Link>

// Key sections/containers (use context + descriptive name)
<div data-testid="booking-flow-summary">...</div>
<div data-testid="browse-studios-business-card">...</div>

// Dynamic lists - include record identifier
<div data-testid="business-card-${businessId}">...</div>
<div data-testid="service-row-${serviceId}">...</div>
```

**Naming Convention:**
- Format: `{context}-{purpose}-{type}` (3 parts, kebab-case)
- **context** = feature/page, e.g., `edit-service`, `browse-studios`, `booking-flow`
- **purpose** = what it does, e.g., `name`, `search`, `confirm`, `close`
- **type** = element kind, e.g., `input`, `btn`, `select`, `link`, `modal`
- Be descriptive: `edit-service-name-input` not `input1`
- For dynamic lists: include identifier, e.g., `service-card-${serviceId}`

**When to add:**
- All buttons (primary actions, navigation, forms)
- All form inputs (text, select, checkbox, radio)
- All links (navigation, CTAs)
- Key containers (cards, summaries, sections that tests will verify)

**When NOT to add:**
- Pure decorative elements (dividers, spacers)
- Static text that won't be interacted with
- Icons inside labeled buttons (test the button, not the icon)

**Why `data-testid` over `id`:**
- Won't conflict with CSS/JavaScript
- Clear intent: attribute exists only for testing
- Industry standard (Playwright, Testing Library, Cypress)

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

# Seed test data (required before first run)
npm run seed:test

# Audit test ID coverage (development only)
npm run audit:testids
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
6. See `TESTING.md` for comprehensive guide

---

## Git Workflow

- Always create a feature branch before making changes
- Branch naming: `feature/short-description`
- Never commit directly to main
- **Code Review Before Push**: After committing, run BOTH reviews in parallel before pushing

### Code Review Protocol

After every commit (except trivial changes), **Claude must invoke @code-reviewer**.

**What qualifies as "trivial" (can skip reviews):**
- Documentation updates (README, code comments only - **excludes CLAUDE.md**)
- Typo fixes in strings/text
- Formatting changes (spacing, indentation)
- Version bumps in package.json

**What requires reviews (never skip):**
- Any code logic changes
- New features or functionality
- Security-related changes
- Database migrations
- API routes or server actions
- Authentication or authorization code
- **CLAUDE.md workflow changes** (always require review)

**Workflow:**
1. Make changes and commit locally
2. Claude invokes `@code-reviewer` (thorough review)
   - **User should verify review happened before pushing**
3. Fix any CRITICAL or MAJOR issues found
4. Re-commit fixes if needed
5. Push to GitHub only after `@code-reviewer` passes (PASS or CONDITIONAL PASS)
   - **CONDITIONAL PASS** requires resolving all flagged conditions before pushing

**Optional Second Opinion:**
- User can run `/codex:review --background` for architectural/design review
- If run, must also PASS or CONDITIONAL PASS before pushing

**Review Tools:**
- `@code-reviewer` (Claude-invoked): Catches bugs, security vulnerabilities, performance issues, missing tests
- `/codex:review` (user-triggered): Catches design issues, spec compliance, architectural problems

**Why This Hybrid Approach:**
- `@code-reviewer` runs via Agent tool (Claude can invoke it automatically)
- `/codex:review` runs via Skill tool (has disable-model-invocation flag to prevent infinite loops)
- You control expensive Codex reviews while always getting thorough code safety validation
- FAIL verdict = DO NOT push, fix issues first

---

## Current Implementation Status

### ✅ What's Built

**Authentication System** (2 user types):
1. **Business Owners**: Register at `/register` → manage from `/dashboard`
   - Links: `auth.users` → `businesses` table (via `owner_id`)
2. **Customers** (with accounts): Register at `/customer-register` → view bookings at `/customer/dashboard`
   - Links: `auth.users` → `customers` table (via `id`)
3. **Guest Customers**: No account needed, book as guest (supported in bookings table)

**Login Routing** (`/login`):
- Single unified login page
- After auth, checks user type:
  - Has `businesses` row → redirect to `/dashboard` (business owner)
  - Has `customers` row → redirect to `/customer/dashboard` (customer)
  - Neither → error

**Middleware Protection** (`lib/supabase/middleware.ts`):
- `/dashboard/*` → business owners only (customers auto-redirected)
- `/customer/dashboard/*` → customers only (business owners auto-redirected)

**Database**:
- All 11 migrations applied (see `supabase/migrations/`)
- RLS enabled on all tables
- Idempotent migrations (can re-run safely)

### ❌ What's NOT Built (High Priority)

**Public Booking Flow** — No way for public to book appointments via web:
- [ ] `/businesses` — marketplace/directory page
- [ ] `/businesses/[slug]` — business profile page
- [ ] `/businesses/[slug]/book` — booking form with calendar
- [ ] Availability checking API
- [ ] Booking confirmation flow

**Current booking sources**: voice (Salome), Instagram, Facebook — all external integrations. Web booking doesn't exist yet.

---

## Architecture

### User Flow Distinction

```
┌─────────────────────────────────────────────────────────────┐
│ BUSINESS OWNERS (merchants who run salons/clinics)         │
│ Register → /register                                        │
│ Login → /login → /dashboard                                 │
│ Manage: services, staff, appointments, settings, Salome    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CUSTOMERS (end-users who book appointments)                │
│ Option 1: Register at /customer-register → /customer/dashboard │
│          (can view booking history, edit profile)           │
│ Option 2: Book as guest (no account, just name/phone/email)│
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (Key Changes from Original Spec)

**Added Tables**:
- `customers` — customer profiles (id, name, phone, email, preferences)

**Updated Tables**:
- `bookings` — added nullable `customer_id` column:
  - If `customer_id` is set → authenticated customer booking
  - If `customer_id` is null → guest booking (original behavior)

**RLS Policies**:
- Business owners can only read/write their own business data
- Customers can read their own profile and bookings
- Service role bypasses all RLS (used in server actions via `createAdminClient()`)

### Critical Permission Issue (Fixed)

**Problem**: Even with RLS policies, PostgreSQL checks GRANT permissions first. Without grants, queries fail with "permission denied for table X" before RLS is even evaluated.

**Solution**: All tables now have explicit grants:
```sql
grant select, insert, update, delete on public.businesses to authenticated;
grant select on public.businesses to anon;
grant all privileges on public.businesses to service_role;
```

Applied to: `businesses`, `customers`, `services`, `staff`, `bookings`, `reviews`, `subscriptions`.

---

## Key Files & Patterns

### Supabase Client Usage

**Browser** (`lib/supabase/client.ts`):
```typescript
import { createClient } from '@/lib/supabase/client';
const supabase = createClient(); // Uses anon key, respects RLS
```

**Server Components** (`lib/supabase/server.ts`):
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = createClient(); // Reads cookies, respects RLS

import { createAdminClient } from '@/lib/supabase/server';
const admin = createAdminClient(); // Service role, bypasses RLS
```

**When to use admin client**:
- Creating business/customer profiles during registration
- System operations that need to bypass RLS
- Never expose admin client to browser

### Server Actions Pattern

```typescript
// app/(auth)/register/actions.ts
"use server";

export async function registerAction(formData: FormData) {
  const supabase = createClient(); // User-scoped
  
  // 1. Create auth user
  const { data: signUpData, error } = await supabase.auth.signUp({...});
  
  // 2. Check session exists (email confirmation disabled for dev)
  if (!signUpData.session) {
    return { error: "Email confirmation required" };
  }
  
  // 3. Create profile using admin client
  const admin = createAdminClient();
  await admin.from("businesses").insert({...});
  
  // 4. Redirect (session already set by signUp)
  redirect("/dashboard");
}
```

**Never**:
- Call `signInWithPassword` after `signUp` (redundant, causes timing issues)
- Return sensitive data in error messages
- Forget to validate `signUpData.session` (null if email confirmation on)

### Middleware Pattern

```typescript
// lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  
  const supabase = createServerClient(...); // Session refresh
  const { data: { user } } = await supabase.auth.getUser();
  
  // Protect routes
  if (isDashboard && !user) redirect("/login");
  
  // Route based on user type
  if (user && isDashboard) {
    const { data: business } = await supabase.from("businesses")...;
    const { data: customer } = await supabase.from("customers")...;
    
    if (isCustomerDashboard && business && !customer) {
      redirect("/dashboard"); // Business owner on customer dashboard
    }
    if (isBusinessDashboard && customer && !business) {
      redirect("/customer/dashboard"); // Customer on business dashboard
    }
  }
  
  return response;
}
```

---

## Database Conventions

### Migrations Must Be Idempotent

All migrations use:
- `create table if not exists`
- `create index if not exists`
- `drop trigger if exists ... on table;` before `create trigger`
- `drop policy if exists "name" on table;` before `create policy`
- `create or replace function` (already idempotent)

**Why**: Migrations can be re-run against existing databases without errors.

### Trigger Pattern

```sql
-- Function (shared across tables)
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger (drop first for idempotency)
drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();
```

### RLS Policy Pattern

```sql
alter table public.businesses enable row level security;

drop policy if exists "businesses_owner_insert" on public.businesses;
create policy "businesses_owner_insert"
  on public.businesses for insert
  with check (owner_id = auth.uid());
```

---

## Timezone Handling

All datetimes:
- **Stored**: UTC in Supabase
- **Displayed**: Asia/Tbilisi (UTC+4)

Use `date-fns-tz`:
```typescript
import { formatTbilisi } from '@/lib/utils/datetime';
formatTbilisi(dateString, "MMM d, yyyy 'at' HH:mm");
```

---

## Internationalization (i18n)

Three languages: Georgian (`ka`), English (`en`), Russian (`ru`).

**Database columns**:
- `name`, `name_ka`, `name_ru`
- `description`, `description_ka`, `description_ru`

**UI translations**: `next-intl` library (not yet wired up)

**Default locale**: Georgian (`ka`)

---

## Salome Integration (Voice Booking)

**Current state**: POC exists using n8n webhooks + Google Calendar. Platform will replace this.

**When implemented**:
- API endpoints: `/api/salome/check-availability`, `/api/salome/book-appointment`
- Bookings created with `booking_source = 'voice'` and `call_id` from Vapi
- Each business gets a dedicated DIDWW phone number (`businesses.salome_phone`)
- Vapi agent per business (`businesses.vapi_agent_id`)

**Environment**:
- `VAPI_API_KEY` in `.env.local` (exists but not used yet)

---

## Common Gotchas

### 1. Permission Denied Errors

**Error**: `permission denied for table X`

**Cause**: Missing GRANT permissions (not an RLS issue).

**Fix**: Add grants in migration:
```sql
grant select, insert, update, delete on public.X to authenticated;
grant select on public.X to anon;
```

### 2. "No business linked to this account"

**Cause**: `auth.uid()` returns NULL in RLS context, even though user is logged in.

**Debug**:
```typescript
// In dashboard page
console.log("User:", user?.id);
const { data: business, error } = await supabase.from("businesses")...;
console.log("Business:", business, "Error:", error);

// Bypass RLS to verify data exists
const admin = createAdminClient();
const { data: adminCheck } = await admin.from("businesses")...;
console.log("Admin check:", adminCheck);
```

**Common fixes**:
- Ensure email confirmation is disabled in Supabase (Auth → Providers → Email)
- Restart dev server after `.env.local` changes
- Check grants exist on table

### 3. Orphaned Users

**Symptom**: Registration succeeds but user has no business/customer profile.

**Cause**: Auth user created, but profile insert failed (permission error).

**Cleanup**:
```sql
-- Find orphaned users
SELECT u.id, u.email FROM auth.users u
LEFT JOIN businesses b ON b.owner_id = u.id
LEFT JOIN customers c ON c.id = u.id
WHERE b.id IS NULL AND c.id IS NULL;

-- Delete them
DELETE FROM auth.users WHERE id = '<orphaned-user-id>';
```

---

## Folder Structure

```
app/
├── (auth)/
│   ├── login/                    # Unified login (detects user type)
│   ├── customer-register/        # Customer registration
│   ├── forgot-password/          # Password reset
│   └── logout/                   # CSRF-protected logout
├── dashboard/                    # Business owner dashboard
│   ├── page.tsx                  # Today's appointments
│   ├── appointments/
│   ├── staff/
│   ├── services/
│   ├── settings/
│   └── salome/
├── customer/
│   └── dashboard/                # Customer dashboard
│       ├── page.tsx              # Bookings list
│       └── profile/              # Edit profile
└── api/                          # API routes (not yet built)

components/
├── dashboard/                    # Business owner components
│   └── Sidebar.tsx
└── customer/                     # Customer components
    └── CustomerSidebar.tsx

lib/
├── supabase/
│   ├── client.ts                # Browser client
│   ├── server.ts                # Server client + admin client
│   └── middleware.ts            # Auth middleware
├── utils/
│   ├── availability.ts          # Overlap detection (critical for booking)
│   ├── datetime.ts              # Tbilisi timezone helpers
│   └── formatting.ts
└── constants/
    ├── categories.ts            # Service categories (ka/en/ru)
    └── cities.ts                # Georgian cities (ka/en/ru)

supabase/
└── migrations/                  # 11 migrations (all idempotent)
```

---

## Availability Logic (Critical)

The n8n POC has a bug: it only checks exact time match, missing overlapping bookings.

**Correct overlap detection**:
```typescript
// lib/utils/availability.ts
export function hasOverlap(
  existingStart: Date,
  existingEnd: Date,
  requestedStart: Date,
  requestedEnd: Date
): boolean {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}
```

**When building booking flow**:
1. Query all bookings for `staff_id` on `date` with `status = 'confirmed'`
2. For each booking, check `hasOverlap()` against requested slot
3. If any overlap → slot unavailable

---

## Next Development Priorities

1. **Public booking flow** (see LATEST_SESSION.md for details)
   - Business directory (`/businesses`)
   - Business profile page (`/businesses/[slug]`)
   - Booking form with calendar picker
   - Availability API

2. **Customer booking management**
   - Cancel/reschedule from `/customer/dashboard`

3. **Business owner calendar view**
   - Replace appointment list with calendar grid

4. **Salome API endpoints**
   - `/api/salome/check-availability`
   - `/api/salome/book-appointment`

---

## Session Management

**Two-File System**:
1. **LATEST_SESSION.md** - Living document (READ at session start)
   - Current implementation status
   - Latest session work
   - What's next
   - Stays concise, always current

2. **SESSION_HISTORY.md** - Full archive (reference only, not read each session)
   - All sessions chronologically
   - Complete audit trail
   - Only read when needed to trace back

**At Session Start**:
- Read `LATEST_SESSION.md` to understand current state
- Do NOT read `SESSION_HISTORY.md` (saves context)

**When user says "session end"**:
1. **Update LATEST_SESSION.md**:
   - Update "Current Implementation Status" if features added
   - Replace "Latest Session Work" section with this session's work
   - Update "What's Next" section
   - Update dates at top and bottom

2. **Append to SESSION_HISTORY.md**:
   - Add new session entry to "Session History" section
   - Include: date, objectives, accomplishments, files changed, commits, next steps
   - Keep chronological order

**Never**:
- Create separate session files (SESSION_SUMMARY_DAY3.md, etc.)
- Skip updating both files
- Read SESSION_HISTORY.md at session start (only when needed for reference)

**Session Entry Format** (for SESSION_HISTORY.md):
```markdown
### Session N - Date: Title

**Objective**: What we set out to do

**Accomplished**:
- Feature 1 built
- Bug fixed
- etc.

**Files Changed**: X created, Y modified

**Commits**: <hash> - description

**Next Steps**: What's ready for next session
```

---

## Reference Documents

- **LATEST_SESSION.md** — Current status + latest work (read at session start)
- **SESSION_HISTORY.md** — Full chronological archive (reference only)
- **UI_GUIDE.md** — Complete UI/UX design system and component patterns
- **PROJECT_STRUCTURE.md** — Directory organization and file structure guide
- **supabase/migrations/** — Database schema source of truth

## Session Continuity

When the user asks "what's next", "what are we doing", "where were we", or any equivalent:

1. Read ALL markdown files in the `sessions/` directory to find the most recent session log.
2. Cross-reference against the codebase — if a feature is already implemented (component exists, route works, data is real), treat it as done even if it appears on a TODO list.
3. Present only items that are genuinely not yet built or not yet working.
4. Never repeat a task that was completed in a prior session unless the user explicitly asks to revisit it.