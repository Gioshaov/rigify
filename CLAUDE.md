# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Git Workflow

- Always create a feature branch before making changes
- Branch naming: `feature/short-description`
- Never commit directly to main
- Only merge to main after `/codex:review` passes

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
│   ├── register/                 # Business owner registration
│   └── customer-register/        # Customer registration
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

1. **Public booking flow** (see SESSION_SUMMARY.md for details)
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

## Reference Documents

- **SESSION_SUMMARY.md** — Full session log, what's implemented, next steps
- **rigify-architecture.md** — Original spec (some parts not yet implemented)
- **supabase/migrations/** — Database schema source of truth
