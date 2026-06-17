# Rigify Code Patterns

This document contains reusable code patterns for common operations in the Rigify codebase.

---

## Supabase Client Usage

### Browser Client (`lib/supabase/client.ts`)

For client-side code (Client Components):

```typescript
import { createClient } from '@/lib/supabase/client';

export default function MyComponent() {
  const supabase = createClient(); // Uses anon key, respects RLS
  
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id);
}
```

**When to use**:
- Client Components (`"use client"`)
- Browser-side queries
- Real-time subscriptions
- Always respects RLS (sees only what the authenticated user can see)

---

### Server Client (`lib/supabase/server.ts`)

For server-side code (Server Components, Server Actions):

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClient(); // Reads cookies, respects RLS
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from('businesses')...;
}
```

**When to use**:
- Server Components (app directory pages, layouts)
- Server Actions
- API routes
- Reads session from cookies
- Respects RLS

---

### Admin Client (`lib/supabase/server.ts`)

For system operations that need to bypass RLS:

```typescript
import { createAdminClient } from '@/lib/supabase/server';

export async function registerAction(formData: FormData) {
  const admin = createAdminClient(); // Service role, bypasses RLS
  
  // Create profile (bypasses RLS to ensure it succeeds)
  await admin.from('businesses').insert({
    id: userId,
    name: formData.get('name'),
    // ...
  });
}
```

**When to use**:
- Creating user profiles during registration
- System operations that need full access
- Background jobs, migrations
- **NEVER expose to browser** — server-only

---

## Server Actions Pattern

Standard pattern for all server actions:

```typescript
// app/(auth)/register/actions.ts
&quot;use server&quot;;

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  const supabase = createClient(); // User-scoped
  
  // 1. Create auth user
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  // 2. Check session exists (email confirmation disabled for dev)
  if (!signUpData.session) {
    return { error: &quot;Email confirmation required&quot; };
  }
  
  // 3. Create profile using admin client
  const admin = createAdminClient();
  const { error: profileError } = await admin.from('businesses').insert({
    id: signUpData.user.id,
    owner_id: signUpData.user.id,
    name: formData.get('name') as string,
    // ...
  });
  
  if (profileError) {
    return { error: &quot;Failed to create profile&quot; };
  }
  
  // 4. Redirect (session already set by signUp)
  redirect('/dashboard');
}
```

### Never

- Call `signInWithPassword` after `signUp` (redundant, causes timing issues)
- Return sensitive data in error messages
- Forget to validate `signUpData.session` (null if email confirmation on)
- Use regular client for profile creation (may fail RLS check)

---

## Middleware Pattern

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  
  const supabase = createServerClient(...); // Session refresh
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Protect routes
  const isDashboard = pathname.startsWith('/dashboard');
  const isCustomerDashboard = pathname.startsWith('/customer/dashboard');
  
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Route based on user type
  if (user && isDashboard) {
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();
      
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (isCustomerDashboard && business && !customer) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (isBusinessDashboard && customer && !business) {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
  }
  
  return response;
}
```

---

## Database Conventions

### Migrations Must Be Idempotent

All migrations use:

```sql
-- Tables
create table if not exists public.businesses (...);

-- Indexes
create index if not exists idx_businesses_owner_id 
  on public.businesses(owner_id);

-- Triggers (drop first)
drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- Policies (drop first)
drop policy if exists &quot;businesses_owner_insert&quot; on public.businesses;
create policy &quot;businesses_owner_insert&quot;
  on public.businesses for insert
  with check (owner_id = auth.uid());

-- Functions (already idempotent)
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

**Why**: Migrations can be re-run against existing databases without errors.

---

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

---

### RLS Policy Pattern

```sql
-- Enable RLS
alter table public.businesses enable row level security;

-- Business owners can only insert their own business
drop policy if exists &quot;businesses_owner_insert&quot; on public.businesses;
create policy &quot;businesses_owner_insert&quot;
  on public.businesses for insert
  with check (owner_id = auth.uid());

-- Business owners can only read their own business
drop policy if exists &quot;businesses_owner_select&quot; on public.businesses;
create policy &quot;businesses_owner_select&quot;
  on public.businesses for select
  using (owner_id = auth.uid());
```

---

## Timezone Handling

All datetimes in the database are stored in **UTC**. Display to users in **Asia/Tbilisi (UTC+4)**.

```typescript
import { formatTbilisi, parseTbilisi } from '@/lib/utils/datetime';

// Format UTC date for display
const displayDate = formatTbilisi(utcDateString, &quot;MMM d, yyyy 'at' HH:mm&quot;);
// Example: &quot;Dec 15, 2026 at 14:30&quot;

// Parse Tbilisi date to UTC for storage
const utcDate = parseTbilisi(tbilisiDateString);
```

**Why**:
- Georgia is in Asia/Tbilisi timezone (UTC+4)
- Supabase stores all timestamps in UTC
- Always convert to/from UTC at the boundary (display/storage)

---

## Availability Logic (Critical)

The n8n POC has a bug: it only checks exact time match, missing overlapping bookings.

### Correct Overlap Detection

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

### When Building Booking Flow

1. Query all bookings for `staff_id` on `date` with `status = 'confirmed'`
2. For each booking, check `hasOverlap()` against requested slot
3. If any overlap → slot unavailable

```typescript
const { data: existingBookings } = await supabase
  .from('bookings')
  .select('start_time, end_time')
  .eq('staff_id', staffId)
  .eq('date', requestedDate)
  .eq('status', 'confirmed');

const isAvailable = !existingBookings.some(booking =>
  hasOverlap(
    new Date(booking.start_time),
    new Date(booking.end_time),
    requestedStartTime,
    requestedEndTime
  )
);
```

---

## Internationalization (i18n)

Three languages: Georgian (`ka`), English (`en`), Russian (`ru`).

### Database Columns

```sql
name varchar,           -- Default (Georgian)
name_ka varchar,        -- Georgian (explicit)
name_ru varchar,        -- Russian
description text,       -- Default (Georgian)
description_ka text,    -- Georgian (explicit)
description_ru text     -- Russian
```

### UI Translations

**Library**: `next-intl` (not yet wired up)

**Default locale**: Georgian (`ka`)

**Pattern**:
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('Common');
<h1>{t('welcome')}</h1>
```

---

## Salome Integration (Voice Booking)

**Current state**: POC exists using n8n webhooks + Google Calendar. Platform will replace this.

### When Implemented

**API endpoints**:
- `/api/salome/check-availability` — Check if time slot available
- `/api/salome/book-appointment` — Create booking from voice call

**Database**:
- Bookings created with `booking_source = 'voice'` and `call_id` from Vapi
- Each business gets dedicated DIDWW phone number (`businesses.salome_phone`)
- Vapi agent per business (`businesses.vapi_agent_id`)

**Environment**:
- `VAPI_API_KEY` in `.env.local` (exists but not used yet)

---

## See Also

- **ARCHITECTURE.md** — Database schema, user types, RLS policies
- **GOTCHAS.md** — Common errors, debugging tips
- **CRITICAL_RULES.md** — Mandatory rules (test IDs, JSX escaping)
