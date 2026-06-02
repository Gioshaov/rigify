# Rigify — Platform Architecture Spec
### Updated Based on Current Implementation — June 2, 2026

---

## What You Are Building

Rigify is a Georgian beauty and wellness booking marketplace. Think Booksy/Fresha but built for Georgia — no equivalent exists in the market.

The platform has three layers:
1. **Marketplace** — customers discover and book businesses online (**not yet built**)
2. **Salome** — AI voice receptionist add-on (POC exists, needs platform integration)
3. **Social media bots** — Instagram/Facebook DM chatbots (post-launch, same backend)

The POC (Salome voice agent) is already live and working. This platform is the proper backend that replaces the current Google Calendar hack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File storage | Supabase Storage (business photos, avatars) |
| API | Next.js API Routes + Server Actions |
| Deployment | Vercel |
| Domain | rigify.ge (planned) |

---

## Folder Structure (Current Implementation)

```
rigify/
├── app/
│   ├── page.tsx                             # Marketing homepage
│   ├── for-businesses/
│   │   └── page.tsx                         # Marketing: for businesses
│   ├── (auth)/                              # Auth routes
│   │   ├── login/
│   │   │   ├── page.tsx                     # Unified login (all user types)
│   │   │   └── actions.ts                   # Server action with type detection
│   │   ├── register/                        # ❌ REMOVED (admin-gated onboarding now)
│   │   ├── customer-register/
│   │   │   ├── page.tsx
│   │   │   ├── CustomerRegisterForm.tsx
│   │   │   └── actions.ts                   # Customer registration
│   │   └── logout/
│   │       └── route.ts                     # POST only (CSRF protection)
│   ├── admin/                               # ✨ Super admin panel
│   │   ├── layout.tsx                       # Admin layout with sign out
│   │   ├── page.tsx                         # Business list
│   │   ├── AdminSignOutButton.tsx           # POST form logout
│   │   ├── onboard/
│   │   │   ├── page.tsx                     # Onboard new business
│   │   │   ├── OnboardForm.tsx              # With unsaved changes warning
│   │   │   └── actions.ts                   # Creates business + owner + optional staff
│   │   └── businesses/
│   │       └── [id]/
│   │           └── edit/
│   │               ├── page.tsx             # Edit business details
│   │               ├── EditBusinessForm.tsx # With unsaved changes warning
│   │               ├── StaffEditRow.tsx     # Inline staff editing
│   │               ├── actions.ts           # Update business (syncs is_active)
│   │               └── staff-actions.ts     # Update staff members
│   ├── dashboard/                           # Business owner dashboard (protected)
│   │   ├── layout.tsx                       # Sidebar layout
│   │   ├── page.tsx                         # Overview / today's appointments
│   │   ├── appointments/
│   │   │   └── page.tsx                     # All appointments (list view)
│   │   ├── staff/
│   │   │   ├── page.tsx                     # Staff list
│   │   │   └── invite/
│   │   │       ├── page.tsx
│   │   │       ├── InviteStaffForm.tsx
│   │   │       └── actions.ts               # Create staff with auth
│   │   ├── services/
│   │   │   └── page.tsx                     # Services management
│   │   ├── settings/
│   │   │   └── page.tsx                     # Business settings
│   │   └── salome/
│   │       └── page.tsx                     # Salome add-on (placeholder)
│   ├── staff-dashboard/                     # ✨ Staff dashboard (standalone)
│   │   ├── layout.tsx                       # Staff layout (no parent inheritance)
│   │   └── page.tsx                         # Staff view of today's appointments
│   ├── customer/                            # ✨ Customer dashboard
│   │   └── dashboard/
│   │       ├── layout.tsx                   # Customer layout with sidebar
│   │       ├── page.tsx                     # Upcoming & past bookings
│   │       └── profile/
│   │           ├── page.tsx
│   │           ├── CustomerProfileForm.tsx
│   │           └── actions.ts               # Update customer profile
│   ├── api/                                 # ❌ NOT YET BUILT (most endpoints)
│   │   └── contact/
│   │       └── route.ts                     # POST contact form
│   └── layout.tsx                           # Root layout
├── components/
│   ├── ui/                                  # Base components (NOT YET BUILT)
│   ├── marketing/                           # ✨ Marketing components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── Footer.tsx
│   │   ├── ContactForm.tsx
│   │   └── ForBusinessesPage.tsx            # Business contact form
│   ├── dashboard/                           # Business dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── AppointmentRow.tsx
│   │   └── StaffSidebar.tsx                 # ✨ Staff sidebar
│   └── customer/                            # ✨ Customer components
│       └── CustomerSidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        # Browser client
│   │   ├── server.ts                        # Server client + admin client
│   │   └── middleware.ts                    # Auth middleware (4 user types)
│   ├── utils/
│   │   ├── availability.ts                  # Overlap detection (critical for booking)
│   │   ├── datetime.ts                      # Tbilisi timezone helpers
│   │   └── formatting.ts
│   ├── hooks/
│   │   └── useUnsavedChanges.ts             # ✨ Form dirty state tracking
│   ├── constants/
│   │   ├── categories.ts                    # Service categories (ka/en/ru)
│   │   └── cities.ts                        # Georgian cities (ka/en/ru)
│   └── types/
│       ├── index.ts                         # Main types
│       └── business.ts                      # Business-specific types
├── supabase/
│   └── migrations/                          # 18 migrations (all idempotent)
├── middleware.ts                            # Auth protection for all dashboards
├── next.config.ts
├── tailwind.config.ts
└── .env.local                               # Environment variables
```

---

## User Types & Authentication (Current Implementation)

### 1. Super Admin
- **Purpose**: Platform administrators who onboard businesses
- **Registration**: Manual (set `app_metadata.is_super_admin = true` in Supabase)
- **Login**: `/login` → redirects to `/admin`
- **Access**: Full platform access, bypasses all business/staff checks
- **Routes**: `/admin/*` (onboard businesses, edit businesses, manage staff)
- **Database**: `auth.users` only (no linked table)
- **Special behavior**: Always granted access regardless of any business status

### 2. Business Owner
- **Purpose**: Merchants who run salons/clinics/barbershops
- **Registration**: Created by super admin via `/admin/onboard`
- **Login**: `/login` → redirects to `/dashboard`
- **Access**: Manage own business (services, staff, appointments, settings)
- **Routes**: `/dashboard/*`
- **Database**: `auth.users` + `businesses` table (linked via `owner_id`)
- **Login blocked if**: `is_active = false`
- **Multi-tenancy**: Each business has unique `subdomain` (e.g., `mitte.rigify.ge`)

### 3. Staff Member (with auth)
- **Purpose**: Employees who need system access (receptionists, managers)
- **Registration**: Created by business owner via `/dashboard/staff/invite` OR super admin during onboarding
- **Login**: `/login` → redirects to `/staff-dashboard`
- **Access**: Permission-based (view/edit appointments, customers, services, etc.)
- **Routes**: `/staff-dashboard/*`
- **Database**: `auth.users` + `staff` table (linked via `user_id`) + `staff_permissions`
- **Roles**: 
  - `staff` (basic permissions)
  - `manager` (elevated permissions)
- **Login blocked if**: `is_active = false`

### 4. Customer (with account)
- **Purpose**: End-users who create accounts to track bookings
- **Registration**: Self-service at `/customer-register`
- **Login**: `/login` → redirects to `/customer/dashboard`
- **Access**: View own bookings, edit profile
- **Routes**: `/customer/dashboard/*`
- **Database**: `auth.users` + `customers` table (linked via `id`)

### 5. Guest Customer (no account)
- **Purpose**: End-users who book without creating an account
- **Registration**: None (just provide name/phone/email during booking)
- **Login**: N/A
- **Access**: None
- **Database**: `bookings` table with `customer_id = null`, stores contact info directly
- **Booking sources**: Voice (Salome), Instagram, Facebook, or future web form
- **Constraint**: Must provide email OR phone (database check)

### Login Flow
```typescript
// app/(auth)/login/actions.ts

1. Sign in with email/password
2. Check user type in order:
   a. Super admin? (app_metadata.is_super_admin) → /admin
   b. Business owner? (businesses.owner_id) → /dashboard
      - Block if is_active = false
   c. Staff? (staff.user_id) → /staff-dashboard
      - Block if is_active = false
   d. Customer? (customers.id) → /customer/dashboard
   e. None of above? → error "Account not properly set up"
```

---

## Database Schema (Actual Implementation)

### Core Tables

#### businesses
```sql
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  subdomain text unique not null,         -- ✨ NEW: e.g. "mitte"
  slug text unique not null,              -- URL slug e.g. "mitte-beauty-salon"
  name text not null,
  name_ka text,
  name_ru text,
  description text,
  description_ka text,
  description_ru text,
  category text not null,                 -- Primary category (backward compat)
  city text not null,                     -- tbilisi, batumi, kutaisi, rustavi
  address text not null,
  phone text not null,                    -- ✨ REQUIRED
  email text,
  status text default 'active',           -- ✨ NEW: 'active' or 'inactive'
  is_active boolean default true,         -- ✨ NEW: Synced with status
  salome_enabled boolean default false,
  salome_phone text,
  vapi_agent_id text,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index businesses_subdomain_idx on businesses(subdomain);
create unique index businesses_slug_idx on businesses(slug);
create index businesses_owner_id_idx on businesses(owner_id);
create index businesses_city_category_idx on businesses(city, category);
```

#### business_categories (✨ NEW — Many-to-Many)
```sql
create table business_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  category_id text not null,              -- hair, nails, skin, massage, brows, makeup, barber
  created_at timestamptz default now()
);

create unique index business_categories_unique 
  on business_categories(business_id, category_id);
create index business_categories_business_idx on business_categories(business_id);
```

#### customers (✨ NEW)
```sql
create table customers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null,
  preferences jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### services
```sql
create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  name_ka text,
  name_ru text,
  description text,
  category text,
  duration_minutes integer not null,
  price_min numeric(10,2) not null,
  price_max numeric(10,2),
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index services_business_id_idx on services(business_id);
```

#### staff (✨ UPDATED — With Auth)
```sql
create table staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid references auth.users(id), -- ✨ NEW: For staff login
  name text not null,
  name_ka text,
  role text not null,                     -- ✨ NEW: 'staff' or 'manager'
  specialty text,
  specialty_ka text,
  bio text,
  avatar_url text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index staff_business_id_idx on staff(business_id);
create index staff_user_id_idx on staff(user_id);
```

#### staff_permissions (✨ NEW)
```sql
create table staff_permissions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade,
  can_view_appointments boolean default true,
  can_edit_appointments boolean default false,
  can_view_customers boolean default true,
  can_view_services boolean default true,
  can_edit_services boolean default false,
  can_view_staff boolean default false,
  can_edit_staff boolean default false,
  can_view_settings boolean default false,
  can_edit_settings boolean default false,
  can_view_salome boolean default false,
  can_edit_salome boolean default false,
  created_at timestamptz default now()
);

-- Auto-created via trigger when staff member is created
create or replace function create_default_permissions()
returns trigger as $$
begin
  insert into staff_permissions (staff_id)
  values (new.id);
  return new;
end;
$$ language plpgsql;

create trigger staff_create_permissions
  after insert on staff
  for each row execute function create_default_permissions();
```

#### bookings (✨ UPDATED — Guest + Authenticated)
```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  service_id uuid references services(id),
  staff_id uuid references staff(id),
  customer_id uuid references customers(id), -- ✨ NEW: Nullable (null = guest)
  customer_name text not null,
  customer_phone text,                       -- Required if customer_id is null
  customer_email text,                       -- Required if customer_id is null
  appointment_datetime timestamptz not null,
  duration_minutes integer not null,
  end_datetime timestamptz not null,
  status text default 'confirmed',           -- confirmed, cancelled, completed, no_show
  booking_source text not null,              -- web, voice, instagram, facebook
  call_id text,                              -- Vapi call ID (voice bookings)
  notes text,
  price numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- ✨ CONSTRAINT: Guest bookings must have email OR phone
  constraint guest_booking_contact_check 
    check (customer_id is not null or customer_email is not null or customer_phone is not null)
);

create index bookings_business_id_idx on bookings(business_id);
create index bookings_staff_id_idx on bookings(staff_id);
create index bookings_customer_id_idx on bookings(customer_id);
create index bookings_datetime_idx on bookings(appointment_datetime);
-- ✨ Composite indexes for hot queries
create index idx_bookings_customer_datetime 
  on bookings(customer_id, appointment_datetime desc);
create index idx_bookings_business_datetime 
  on bookings(business_id, appointment_datetime desc);
```

#### reviews
```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  booking_id uuid references bookings(id),
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create index reviews_business_id_idx on reviews(business_id);
```

#### subscriptions
```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  plan text not null,                     -- starter, growth, clinic
  status text default 'trial',            -- trial, active, cancelled, expired
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  salome_enabled boolean default false,
  salome_plan text,
  languages text[] default '{ka}',
  monthly_call_limit integer,
  calls_this_month integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

### businesses
- Public read: `select` for anon (only active businesses)
- Owner read: `select` where `owner_id = auth.uid()`
- Owner write: `insert`, `update`, `delete` where `owner_id = auth.uid()`

### staff
- Self read: Staff can read their own record (`user_id = auth.uid()`)
- Owner read: Business owner can read their staff (`business_id` matches)
- Owner write: Business owner can manage their staff

### bookings
- Business owner: Full access to own business bookings
- Staff: Read own business bookings (based on permissions)
- Customer: Read own bookings (`customer_id = auth.uid()`)

### GRANT Permissions
```sql
-- Required on ALL tables (RLS checks happen AFTER grant checks)
grant select, insert, update, delete on public.{table} to authenticated;
grant select on public.{table} to anon;
grant all privileges on public.{table} to service_role;
```

---

## API Endpoints

### ❌ NOT YET BUILT (Most Endpoints)

The following are from the original spec but **have not been implemented yet**:

```
GET  /api/businesses                     # NOT BUILT
GET  /api/businesses/[id]               # NOT BUILT
POST /api/availability                   # NOT BUILT
POST /api/bookings                       # NOT BUILT
GET  /api/reviews                        # NOT BUILT
```

### ✅ Currently Implemented

```
POST /api/contact                        # Contact form submission
```

### Salome endpoints (PLANNED — not yet built)

```
POST /api/salome/check-availability      # NOT BUILT
POST /api/salome/book-appointment        # NOT BUILT
```

These will replace the current n8n webhooks:
- Current: `https://n8n.poc.ge/webhook/check-availability`
- Future: `https://rigify.ge/api/salome/check-availability`

---

## Middleware Protection

```typescript
// middleware.ts

export async function middleware(request: NextRequest) {
  // 1. Session refresh
  const { user } = await supabase.auth.getUser();
  
  // 2. Super admin check (FIRST)
  const isSuperAdmin = user?.app_metadata?.is_super_admin === true;
  
  // 3. Route protection
  if (pathname.startsWith('/admin')) {
    if (!isSuperAdmin) redirect('/login');
  }
  
  // 4. Parallel user type detection (for other dashboards)
  const [{ data: business }, { data: customer }, { data: staff }] = 
    await Promise.all([...]);
  
  // 5. Dashboard-specific protection
  if (pathname.startsWith('/dashboard')) {
    if (!business) redirect('/login');
  }
  
  if (pathname.startsWith('/staff-dashboard')) {
    if (!staff) redirect('/login');
  }
  
  if (pathname.startsWith('/customer/dashboard')) {
    if (!customer) redirect('/login');
  }
  
  // 6. Cross-dashboard access prevention
  // Business owners can't access staff/customer dashboards
  // Staff can't access business owner/customer dashboards
  // Customers can't access business owner/staff dashboards
  
  // 7. Preserve session cookies on all redirects
  return response;
}
```

---

## Critical Implementation Details

### 1. Super Admin Bypass Pattern
```typescript
// ALWAYS check super admin FIRST
const isSuperAdmin = user.app_metadata?.is_super_admin === true;
if (isSuperAdmin) {
  redirect("/admin");
}

// Then check other conditions
```

### 2. is_active Synchronization
```typescript
// When updating business status
await admin.from('businesses').update({
  status,
  is_active: status === 'active' // Always sync
});
```

### 3. Admin Client Usage
```typescript
// Super admin operations MUST use admin client
const admin = createAdminClient(); // Bypasses RLS
const supabase = createClient();   // Respects RLS
```

### 4. Staff Email Validation
```typescript
// Validate BEFORE creating auth user
if (staffEmail && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(staffEmail)) {
  return { success: false, message: 'Invalid email' };
}

// Then create auth user
// Then create staff record
// Rollback auth user if staff creation fails
```

### 5. Unsaved Changes Warning
```typescript
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChanges';

const [isDirty, setIsDirty] = useState(false);
useUnsavedChanges(isDirty && !loading && !result);

// Track form changes
useEffect(() => {
  const handleInput = () => setIsDirty(true);
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('input', handleInput);
    return () => form.removeEventListener('input', handleInput);
  }
}, []);

// Reset after save
if (result?.success) {
  setIsDirty(false);
}
```

### 6. Parallel Queries (Performance)
```typescript
// BAD: Sequential (3x latency)
const { data: business } = await supabase.from('businesses')...;
const { data: customer } = await supabase.from('customers')...;
const { data: staff } = await supabase.from('staff')...;

// GOOD: Parallel (1x latency)
const [
  { data: business },
  { data: customer },
  { data: staff }
] = await Promise.all([
  supabase.from('businesses')...,
  supabase.from('customers')...,
  supabase.from('staff')...
]);
```

---

## i18n (Internationalization)

Three languages: Georgian (`ka`), English (`en`), Russian (`ru`).

- Default language: Georgian
- Language switcher in navbar (not yet implemented)
- Database columns: `name`, `name_ka`, `name_ru` (fall back to default if translation missing)
- UI translations: `next-intl` library (installed but not yet wired up)
- Translation files: `/i18n/ka.json`, `/i18n/en.json`, `/i18n/ru.json`

---

## Salome Integration (Planned)

**Current state**: POC exists using n8n webhooks + Google Calendar

**Platform integration** (when built):
1. Business enables Salome from `/dashboard/salome`
2. Platform assigns DIDWW phone number (`businesses.salome_phone`)
3. Platform creates Vapi agent (`businesses.vapi_agent_id`)
4. Vapi agent system prompt auto-generated from business data (services, staff, hours)
5. Vapi tools point to `/api/salome/*` endpoints with `business_id`
6. Voice bookings land in `bookings` table with:
   - `booking_source = 'voice'`
   - `call_id` from Vapi

**n8n replacement**: `/api/salome/*` endpoints replace n8n webhooks entirely

---

## Availability Logic (Critical)

The n8n POC has a bug: it only checks exact time match, missing overlapping bookings.

**Correct overlap detection** (`lib/utils/availability.ts`):

```typescript
export function hasOverlap(
  existingStart: Date,
  existingEnd: Date,
  requestedStart: Date,
  requestedEnd: Date
): boolean {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

// Usage in availability check:
export async function checkAvailability(
  staffId: string,
  date: string,
  startTime: Date,
  endTime: Date
): Promise<{ available: boolean; message: string }> {
  // 1. Query all confirmed bookings for staff on date
  const bookings = await getBookingsForStaffAndDate(staffId, date);
  
  // 2. Check each booking for overlap
  for (const booking of bookings) {
    if (hasOverlap(booking.start, booking.end, startTime, endTime)) {
      return { 
        available: false, 
        message: 'This time slot overlaps with an existing booking' 
      };
    }
  }
  
  return { available: true, message: 'Time slot is available' };
}
```

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zipxmghbougztwdtzftn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Vapi (for Salome — not yet used)
VAPI_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=ka
```

**Supabase Project Settings**:
- Email confirmation: DISABLED (for development)
- Auth providers: Email/Password only
- RLS: ENABLED on all tables

---

## Categories & Cities

```typescript
// lib/constants/categories.ts
export const CATEGORIES = [
  { id: 'hair',    ka: 'თმა',        en: 'Hair',       ru: 'Волосы'    },
  { id: 'nails',   ka: 'ფრჩხილები',  en: 'Nails',      ru: 'Ногти'     },
  { id: 'skin',    ka: 'კანი',       en: 'Skin',       ru: 'Кожа'      },
  { id: 'massage', ka: 'მასაჟი',     en: 'Massage',    ru: 'Массаж'    },
  { id: 'brows',   ka: 'წარბები',    en: 'Brows',      ru: 'Брови'     },
  { id: 'makeup',  ka: 'მაკიაჟი',    en: 'Makeup',     ru: 'Макияж'    },
  { id: 'barber',  ka: 'საბარბეro',  en: 'Barbershop', ru: 'Барбершоп' },
];

// lib/constants/cities.ts
export const CITIES = [
  { id: 'tbilisi',  ka: 'თბილისი',  en: 'Tbilisi',  ru: 'Тбилиси' },
  { id: 'batumi',   ka: 'ბათუმი',   en: 'Batumi',   ru: 'Батуми'  },
  { id: 'kutaisi',  ka: 'ქუთაისი',  en: 'Kutaisi',  ru: 'Кутаиси' },
  { id: 'rustavi',  ka: 'რუსთავი',  en: 'Rustavi',  ru: 'Рустави' },
];
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

## What's Built vs. Original Spec

### ✅ Built (Deviates from Spec)
- Admin panel with onboarding (spec had self-service registration)
- Customer authentication system (not in spec)
- Staff authentication system (spec had staff records without auth)
- Multi-category support (spec showed single category)
- Subdomain-based multi-tenancy (not in spec)
- Performance optimizations (parallel queries, composite indexes)

### ❌ Not Yet Built (From Spec)
- Public booking flow (marketplace, business profiles, booking form)
- Business directory/search (`/businesses`)
- Business profile page (`/businesses/[slug]`)
- Booking form with calendar picker
- Most API endpoints
- Salome integration endpoints
- Calendar view for business owners
- Customer booking management (cancel/reschedule)
- Email/SMS notifications
- Reviews system
- Payment processing

---

## Build Sequence (Original Plan — Modified)

**Phase 1 — Foundation** ✅ COMPLETE
- Supabase setup + all tables + RLS
- Auth (admin, business owner, staff, customer)
- Migrations (18 total, all idempotent)

**Phase 2 — Marketplace (public)** ❌ NOT STARTED
- Homepage with search + category filter
- Business profile page
- Booking flow (4 steps)

**Phase 3 — Dashboard** ✅ MOSTLY COMPLETE
- Business owner dashboard ✅
- Appointments view (list only, no calendar) ✅
- Staff management ✅
- Services management ✅
- Settings (basic) ✅

**Phase 4 — Salome Integration** ❌ NOT STARTED
- `/api/salome/check-availability` endpoint
- `/api/salome/book-appointment` endpoint
- Salome upsell page (placeholder exists)

**Phase 5 — Polish** ❌ NOT STARTED
- i18n (Georgian/English/Russian)
- Reviews
- Business settings page
- Subscription management

---

## Key Learnings

1. **RLS vs Grants**: PostgreSQL checks GRANT permissions before RLS policies
2. **Admin Client Usage**: Super admins need `createAdminClient()` to bypass RLS
3. **Code Review**: Running reviews before push caught 4 critical security issues
4. **Migration Idempotency**: All migrations must be rerunnable with `if exists` checks
5. **Session Handling**: Middleware must preserve cookies on all redirect responses
6. **Field Synchronization**: Having both `status` and `is_active` required sync logic
7. **Super Admin Privileges**: Always check super admin status BEFORE other validations
8. **CSRF Protection**: Use POST forms for logout, never GET endpoints
9. **Staff Validation**: Validate email BEFORE creating auth user to prevent orphans
10. **Performance**: Parallel queries on hot paths (login, middleware) reduced latency by 50-66%

---

## Notes for Claude Code

- **Super admin check**: Always FIRST, before any other validation
- **Admin client**: Use for super admin operations, never expose to browser
- **Overlap detection**: Use `hasOverlap()` function, not exact time match
- **Timezone**: UTC in database, Asia/Tbilisi for display (use `date-fns-tz`)
- **Salome endpoints**: Keep at `/api/salome/*` for easy n8n migration
- **booking_source**: Always required, automatically set to 'voice' in Salome endpoint
- **RLS**: Business owners must never read other businesses' data (enforce at DB level)
- **is_active sync**: Always sync `is_active = (status === 'active')` when updating
- **Code review**: Run `/codex:review --background` and `@code-reviewer` before every push
- **Migration pattern**: All migrations use `if exists` for idempotency

---

**Last Updated**: June 2, 2026  
**Status**: Foundation complete, ready for public booking flow implementation
