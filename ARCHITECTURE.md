# Rigify Architecture

This document describes the system architecture, database schema, authentication flows, and user types.

---

## User Types

Rigify has **4 distinct user types**, each with different access levels:

### 1. Admin (System Administrator)
- **Access**: Full platform control
- **Auth**: Admin-only login (not yet built)
- **Database**: TBD (admin table structure not defined)

### 2. Business Owners (Merchants)
- **Access**: Manage their salon/clinic
- **Register**: `/register`
- **Dashboard**: `/dashboard`
- **Database link**: `auth.users.id` → `businesses.owner_id`
- **Can manage**: services, staff, appointments, settings, Salome AI

### 3. Staff Members
- **Access**: View assigned appointments, mark completed
- **Created by**: Business owners (via `/dashboard/staff/invite`)
- **Dashboard**: `/staff/dashboard` (not yet built)
- **Database link**: `auth.users.id` → `staff.id`
- **Cannot**: Edit services, invite staff, manage billing

### 4. Customers (End Users)
- **Option A**: Register at `/customer-register` → `/customer/dashboard`
  - Can view booking history, edit profile, save favorites
  - **Database link**: `auth.users.id` → `customers.id`
- **Option B**: Book as guest (no account needed)
  - Just provide name, phone, email at booking time
  - No login, no dashboard access
  - **Database**: `bookings.customer_id` is NULL for guest bookings

---

## User Flow Distinction

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

---

## Database Schema

### Core Tables

**businesses**:
- `id` (uuid, PK)
- `owner_id` (uuid, FK → `auth.users.id`)
- `name`, `slug`, `description`
- `category` (enum: hair, nails, makeup, etc.)
- `city`, `address`, `phone`, `email`
- `salome_phone`, `vapi_agent_id` (for voice booking)
- `created_at`, `updated_at`

**customers**:
- `id` (uuid, PK, FK → `auth.users.id`)
- `name`, `phone`, `email`
- `preferences` (jsonb)
- `created_at`, `updated_at`

**staff**:
- `id` (uuid, PK, FK → `auth.users.id`)
- `business_id` (uuid, FK → `businesses.id`)
- `name`, `phone`, `email`, `role`
- `created_at`, `updated_at`

**services**:
- `id` (uuid, PK)
- `business_id` (uuid, FK → `businesses.id`)
- `name`, `description`, `price`, `duration` (minutes)
- `category`
- `created_at`, `updated_at`

**bookings**:
- `id` (uuid, PK)
- `business_id` (uuid, FK → `businesses.id`)
- `service_id` (uuid, FK → `services.id`)
- `staff_id` (uuid, FK → `staff.id`)
- `customer_id` (uuid, nullable, FK → `customers.id`) — **NULL for guest bookings**
- `guest_name`, `guest_phone`, `guest_email` — **Used when customer_id is NULL**
- `date`, `start_time`, `end_time`
- `status` (enum: pending, confirmed, completed, cancelled)
- `booking_source` (enum: web, voice, instagram, facebook)
- `call_id` (for voice bookings via Vapi)
- `notes`
- `created_at`, `updated_at`

**reviews**:
- `id` (uuid, PK)
- `business_id` (uuid, FK)
- `customer_id` (uuid, FK)
- `booking_id` (uuid, FK)
- `rating` (1-5)
- `comment`
- `created_at`

**subscriptions** (for Salome AI):
- `id` (uuid, PK)
- `business_id` (uuid, FK)
- `plan` (enum: free, basic, pro)
- `status` (enum: active, cancelled, expired)
- `started_at`, `ends_at`

---

## Authentication Flow

### Login Routing (`/login`)

1. Single unified login page for all user types
2. After successful authentication:
   - Check if user has `businesses` row → redirect to `/dashboard` (business owner)
   - Check if user has `customers` row → redirect to `/customer/dashboard` (customer)
   - Check if user has `staff` row → redirect to `/staff/dashboard` (staff member)
   - If none → show error (orphaned user)

**Implementation**:
```typescript
const { data: { user } } = await supabase.auth.getUser();
const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
const { data: customer } = await supabase.from("customers").select("id").eq("id", user.id).single();

if (business) redirect("/dashboard");
if (customer) redirect("/customer/dashboard");
// else error
```

---

## Middleware Protection

**File**: `lib/supabase/middleware.ts`

**Protected routes**:
- `/dashboard/*` → business owners only (customers/staff auto-redirected)
- `/customer/dashboard/*` → customers only (business owners/staff auto-redirected)
- `/staff/dashboard/*` → staff only (not yet built)

**Logic**:
```typescript
if (isDashboard && !user) redirect("/login"); // Require auth

if (user && isDashboard) {
  // Check user type
  const { data: business } = await supabase.from("businesses")...;
  const { data: customer } = await supabase.from("customers")...;
  
  if (isCustomerDashboard && business && !customer) {
    redirect("/dashboard"); // Business owner on customer dashboard
  }
  if (isBusinessDashboard && customer && !business) {
    redirect("/customer/dashboard"); // Customer on business dashboard
  }
}
```

---

## RLS (Row Level Security)

All tables have RLS enabled. Policies ensure users can only access their own data.

### Business Owners
- **Read/Write**: Own business data (`business_id` or `owner_id` matches)
- **Cannot**: Access other businesses' data

### Customers
- **Read**: Own profile and bookings (`customer_id` matches)
- **Cannot**: Access other customers' data or business internal data

### Staff
- **Read**: Own business's data (`business_id` matches)
- **Write**: Limited (can update appointment status, not services/staff)

### Service Role (Admin Client)
- **Bypasses all RLS** — used in server actions for registration, system operations
- **Never exposed to browser**

---

## Critical Permission Issue (Fixed)

### Problem
Even with RLS policies, PostgreSQL checks GRANT permissions first. Without grants, queries fail with &quot;permission denied for table X&quot; before RLS is even evaluated.

### Solution
All tables now have explicit grants:

```sql
grant select, insert, update, delete on public.businesses to authenticated;
grant select on public.businesses to anon;
grant all privileges on public.businesses to service_role;
```

**Applied to**: `businesses`, `customers`, `services`, `staff`, `bookings`, `reviews`, `subscriptions`.

---

## Environment Variables

**Supabase**:
- `NEXT_PUBLIC_SUPABASE_URL` — Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — Private service role key (server-only, bypasses RLS)

**Salome AI (Voice Booking)**:
- `VAPI_API_KEY` — Vapi API key (exists but not used yet)

**Vercel**:
- `NEXT_PUBLIC_SITE_URL` — Site URL for redirects

---

## Implementation Status

### ✅ What&apos;s Built

**Authentication System**:
- Business owner registration (`/register`)
- Customer registration (`/customer-register`)
- Unified login (`/login`)
- Middleware protection
- Session management

**Database**:
- All 11 migrations applied
- RLS enabled on all tables
- Idempotent migrations (can re-run safely)

**Dashboards**:
- Business owner dashboard (`/dashboard`) — appointments, services, staff, settings
- Customer dashboard (`/customer/dashboard`) — booking history, profile

### ❌ What&apos;s NOT Built

- Admin panel
- Staff dashboard (`/staff/dashboard`)
- Public booking flow (`/businesses`, `/businesses/[slug]`, `/businesses/[slug]/book`)
- Salome AI integration (API endpoints)

---

## See Also

- **PATTERNS.md** — Supabase client usage, server actions, middleware patterns
- **GOTCHAS.md** — Permission errors, orphaned users, debugging
- **CLAUDE.md** — Project overview, commands
