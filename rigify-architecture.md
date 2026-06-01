# Rigify — Platform Architecture Spec
### For Claude Code — June 2026

---

## What You Are Building

Rigify is a Georgian beauty and wellness booking marketplace. Think Booksy/Fresha but built for Georgia — no equivalent exists in the market.

The platform has three layers:
1. **Marketplace** — customers discover and book businesses online
2. **Salome** — AI voice receptionist add-on (already built as POC, needs platform integration)
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
| API | Next.js API Routes + Supabase client |
| Deployment | Vercel |
| Domain | rigify.ge (planned) |

---

## Folder Structure

```
rigify/
├── app/
│   ├── (public)/                        # Public marketplace routes
│   │   ├── page.tsx                     # Homepage / discovery
│   │   ├── [city]/
│   │   │   └── [category]/
│   │   │       └── page.tsx             # Filtered listing page
│   │   ├── business/
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Business profile page
│   │   └── book/
│   │       └── [slug]/
│   │           └── page.tsx             # Booking flow
│   ├── (auth)/                          # Auth routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/                       # Business owner dashboard (protected)
│   │   ├── layout.tsx                   # Sidebar layout
│   │   ├── page.tsx                     # Overview / today's appointments
│   │   ├── appointments/
│   │   │   └── page.tsx                 # All appointments, calendar view
│   │   ├── staff/
│   │   │   └── page.tsx                 # Staff management
│   │   ├── services/
│   │   │   └── page.tsx                 # Services management
│   │   ├── settings/
│   │   │   └── page.tsx                 # Business profile settings
│   │   └── salome/
│   │       └── page.tsx                 # Salome add-on upsell + management
│   ├── api/
│   │   ├── businesses/
│   │   │   ├── route.ts                 # GET /api/businesses (search/filter)
│   │   │   └── [id]/
│   │   │       └── route.ts             # GET /api/businesses/[id]
│   │   ├── bookings/
│   │   │   ├── route.ts                 # POST /api/bookings (create booking)
│   │   │   └── [id]/
│   │   │       └── route.ts             # GET/PATCH/DELETE /api/bookings/[id]
│   │   ├── availability/
│   │   │   └── route.ts                 # POST /api/availability (check slot)
│   │   ├── services/
│   │   │   └── route.ts                 # GET/POST /api/services
│   │   ├── staff/
│   │   │   └── route.ts                 # GET/POST /api/staff
│   │   ├── reviews/
│   │   │   └── route.ts                 # GET/POST /api/reviews
│   │   └── salome/
│   │       ├── check-availability/
│   │       │   └── route.ts             # POST — called by Vapi/n8n
│   │       └── book-appointment/
│   │           └── route.ts             # POST — called by Vapi/n8n
│   └── layout.tsx                       # Root layout
├── components/
│   ├── ui/                              # Base components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   └── StarRating.tsx
│   ├── marketplace/                     # Public-facing components
│   │   ├── SearchBar.tsx
│   │   ├── CategoryPills.tsx
│   │   ├── BusinessCard.tsx
│   │   ├── BusinessGrid.tsx
│   │   ├── CityFilter.tsx
│   │   └── ReviewCard.tsx
│   ├── booking/                         # Booking flow components
│   │   ├── BookingFlow.tsx              # Multi-step container
│   │   ├── ServiceSelector.tsx          # Step 1
│   │   ├── StaffSelector.tsx            # Step 2
│   │   ├── DateTimePicker.tsx           # Step 3
│   │   └── BookingConfirm.tsx           # Step 4
│   ├── dashboard/                       # Business dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── AppointmentRow.tsx
│   │   ├── AppointmentCalendar.tsx
│   │   ├── StaffCard.tsx
│   │   ├── ServiceRow.tsx
│   │   ├── MetricCard.tsx
│   │   └── SalomeBadge.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── LanguageSwitcher.tsx         # Georgian / English / Russian
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   ├── server.ts                    # Server Supabase client
│   │   └── middleware.ts                # Auth middleware
│   ├── utils/
│   │   ├── availability.ts              # Slot overlap detection logic
│   │   ├── datetime.ts                  # Georgian date/time helpers
│   │   └── formatting.ts               # Price, duration formatters
│   └── constants/
│       ├── categories.ts                # Service categories
│       └── cities.ts                    # Georgian cities list
├── hooks/
│   ├── useBusinesses.ts
│   ├── useAvailability.ts
│   ├── useBooking.ts
│   └── useDashboard.ts
├── types/
│   └── index.ts                         # All TypeScript types
├── i18n/
│   ├── ka.json                          # Georgian translations
│   ├── en.json                          # English translations
│   └── ru.json                          # Russian translations
├── middleware.ts                        # Auth protection for /dashboard
├── next.config.ts
├── tailwind.config.ts
└── .env.local                           # Environment variables (see below)
```

---

## Database Schema (Supabase / PostgreSQL)

### businesses
```sql
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  slug text unique not null,              -- URL slug e.g. "mitte-beauty"
  name text not null,
  name_ka text,                           -- Georgian name
  name_ru text,                           -- Russian name
  description text,
  description_ka text,
  description_ru text,
  category text not null,                 -- hair, nails, skin, massage, brows, makeup, barbershop
  city text not null,                     -- tbilisi, batumi, kutaisi
  district text,                          -- neighbourhood e.g. "vake"
  address text not null,
  address_ka text,
  phone text,
  email text,
  website text,
  instagram text,
  cover_image_url text,
  logo_url text,
  hours jsonb,                            -- { mon: {open: "10:00", close: "20:00"}, ... }
  is_active boolean default true,
  salome_enabled boolean default false,   -- Salome add-on active
  salome_phone text,                      -- DIDWW number assigned
  vapi_agent_id text,                     -- Vapi agent ID for this business
  rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### services
```sql
create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  name_ka text,
  name_ru text,
  description text,
  category text,                          -- hair, nails, etc.
  duration_minutes integer not null,
  price_min numeric(10,2) not null,
  price_max numeric(10,2),                -- null if fixed price
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
```

### staff
```sql
create table staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  name_ka text,
  specialty text,                         -- e.g. "Hair stylist"
  specialty_ka text,
  bio text,
  avatar_url text,
  calendar_id text,                       -- Google Calendar ID for this staff member
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
```

### bookings
```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  service_id uuid references services(id),
  staff_id uuid references staff(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  appointment_datetime timestamptz not null,
  duration_minutes integer not null,
  end_datetime timestamptz not null,      -- computed: appointment_datetime + duration
  status text default 'confirmed',        -- confirmed, cancelled, completed, no_show
  booking_source text not null,           -- web, voice, instagram, facebook
  call_id text,                           -- Vapi call ID (voice bookings only)
  notes text,
  price numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### reviews
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
```

### subscriptions
```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  plan text not null,                     -- starter, growth, clinic
  status text default 'trial',           -- trial, active, cancelled, expired
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  salome_enabled boolean default false,
  salome_plan text,                       -- basic, standard (by call volume)
  languages text[] default '{ka}',        -- ka, en, ru
  monthly_call_limit integer,
  calls_this_month integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## API Endpoints

### Public endpoints (no auth)

```
GET  /api/businesses                     # List/search businesses
     ?city=tbilisi
     ?category=hair
     ?q=mitte                            # Text search
     ?limit=20&offset=0

GET  /api/businesses/[id]               # Single business with services + staff

POST /api/availability                   # Check if slot is free
     body: { business_id, staff_id, service_id, date, time }
     returns: { available: boolean, message: string }

POST /api/bookings                       # Create a booking
     body: { business_id, service_id, staff_id, customer_name,
             customer_phone, date, time, booking_source }
     returns: { booking_id, success, message }

GET  /api/reviews?business_id=[id]       # Get reviews for a business
```

### Salome endpoints (called by n8n/Vapi — replace current Google Calendar webhooks)

```
POST /api/salome/check-availability
     body: { business_id, staff_id, date, time }
     returns: { available: boolean, message: string }
     note: replaces https://n8n.poc.ge/webhook/check-availability

POST /api/salome/book-appointment
     body: { business_id, staff_id, name, phone, service,
             date, time, endTime, call_id }
     returns: { success: boolean, message: string }
     note: replaces https://n8n.poc.ge/webhook/book-appointment
```

### Dashboard endpoints (auth required)

```
GET  /api/dashboard/bookings             # Owner's bookings
     ?date=2026-06-01
     ?status=confirmed
     ?staff_id=[id]

PATCH /api/bookings/[id]                 # Update booking status
DELETE /api/bookings/[id]               # Cancel booking

GET  /api/dashboard/staff               # List staff
POST /api/staff                          # Add staff member
PATCH /api/staff/[id]                   # Update staff
DELETE /api/staff/[id]                  # Remove staff

GET  /api/dashboard/services            # List services
POST /api/services                       # Add service
PATCH /api/services/[id]               # Update service
DELETE /api/services/[id]              # Remove service

GET  /api/dashboard/stats               # Today count, week count, month revenue
```

---

## Authentication

- Supabase Auth — email/password
- Two user types: **customer** (books appointments) and **business owner** (manages dashboard)
- Business owners register at `/register` → creates `auth.users` entry + `businesses` row
- Row Level Security (RLS) on all tables — owners can only read/write their own business data
- `/dashboard/*` protected by middleware — redirects to `/login` if no session

---

## i18n (Internationalisation)

Three languages: Georgian (`ka`), English (`en`), Russian (`ru`).

- Default language: Georgian
- Language switcher in navbar — persists to localStorage + cookie
- All business content has `_ka`, `_en`, `_ru` columns — fall back to default if translation missing
- Use `next-intl` library for UI string translations
- Translation files in `/i18n/ka.json`, `/i18n/en.json`, `/i18n/ru.json`

---

## Salome Integration

Salome is a paid add-on per business. When enabled:

1. Business gets a DIDWW phone number assigned (`businesses.salome_phone`)
2. A dedicated Vapi agent is created for that business (`businesses.vapi_agent_id`)
3. The Vapi agent's system prompt is auto-generated from the business's services/staff/hours in Supabase
4. Vapi tools point to `/api/salome/check-availability` and `/api/salome/book-appointment` with `business_id` in the payload
5. Bookings created by voice calls land in the `bookings` table with `booking_source = 'voice'` and the `call_id` from Vapi

**n8n is no longer needed once the platform is live.** The `/api/salome/*` endpoints replace the current n8n webhooks entirely.

---

## Availability Logic

The current n8n implementation only checks exact time match — it misses overlapping bookings. The platform must fix this.

Correct overlap detection in `lib/utils/availability.ts`:

```typescript
// A slot is unavailable if any existing booking overlaps with it
// Overlap condition: existing.start < requested.end AND existing.end > requested.start

export function hasOverlap(
  existingStart: Date,
  existingEnd: Date,
  requestedStart: Date,
  requestedEnd: Date
): boolean {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}
```

The `/api/availability` endpoint queries `bookings` for the given `staff_id` and `date`, then runs overlap detection against all confirmed bookings.

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vapi (for Salome management)
VAPI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://rigify.ge
NEXT_PUBLIC_DEFAULT_LOCALE=ka
```

---

## Categories

```typescript
// lib/constants/categories.ts
export const CATEGORIES = [
  { id: 'hair',      ka: 'თმა',        en: 'Hair',     ru: 'Волосы'  },
  { id: 'nails',     ka: 'ფრჩხილები',  en: 'Nails',    ru: 'Ногти'   },
  { id: 'skin',      ka: 'კანი',       en: 'Skin',     ru: 'Кожа'    },
  { id: 'massage',   ka: 'მასაჟი',     en: 'Massage',  ru: 'Массаж'  },
  { id: 'brows',     ka: 'წარბები',    en: 'Brows',    ru: 'Брови'   },
  { id: 'makeup',    ka: 'მაკიაჟი',    en: 'Makeup',   ru: 'Макияж'  },
  { id: 'barber',    ka: 'საბარბეro',  en: 'Barbershop', ru: 'Барбершоп' },
];
```

## Cities

```typescript
// lib/constants/cities.ts
export const CITIES = [
  { id: 'tbilisi',  ka: 'თბილისი',  en: 'Tbilisi',  ru: 'Тбилиси' },
  { id: 'batumi',   ka: 'ბათუმი',   en: 'Batumi',   ru: 'Батуми'  },
  { id: 'kutaisi',  ka: 'ქუთაისი',  en: 'Kutaisi',  ru: 'Кутаиси' },
  { id: 'rustavi',  ka: 'რუსთავი',  en: 'Rustavi',  ru: 'Рустави' },
];
```

---

## TypeScript Types

```typescript
// types/index.ts

export interface Business {
  id: string;
  slug: string;
  name: string;
  name_ka?: string;
  category: string;
  city: string;
  district?: string;
  address: string;
  phone?: string;
  cover_image_url?: string;
  logo_url?: string;
  hours: BusinessHours;
  rating: number;
  review_count: number;
  salome_enabled: boolean;
  salome_phone?: string;
  services?: Service[];
  staff?: StaffMember[];
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  name_ka?: string;
  duration_minutes: number;
  price_min: number;
  price_max?: number;
  category: string;
  is_active: boolean;
}

export interface StaffMember {
  id: string;
  business_id: string;
  name: string;
  name_ka?: string;
  specialty?: string;
  avatar_url?: string;
  calendar_id?: string;
  is_active: boolean;
}

export interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  staff_id: string;
  customer_name: string;
  customer_phone: string;
  appointment_datetime: string;
  duration_minutes: number;
  end_datetime: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  booking_source: 'web' | 'voice' | 'instagram' | 'facebook';
  call_id?: string;
  price?: number;
}

export interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface BusinessHours {
  [day: string]: { open: string; close: string } | null;
}
```

---

## Build Sequence for Claude Code

Build in this order — each phase is independently deployable:

**Phase 1 — Foundation**
- Supabase project setup + all tables + RLS policies
- Auth (register, login, session middleware)
- Seed data: Mitte Beauty Salon with full services and staff

**Phase 2 — Marketplace (public)**
- Homepage with search + category filter
- Business profile page
- Booking flow (4 steps)

**Phase 3 — Dashboard**
- Business owner dashboard
- Appointments view (today + upcoming)
- Staff management
- Services management

**Phase 4 — Salome Integration**
- `/api/salome/check-availability` endpoint
- `/api/salome/book-appointment` endpoint
- Salome upsell page in dashboard
- Auto-generate Vapi system prompt from business data

**Phase 5 — Polish**
- i18n (Georgian/English/Russian)
- Reviews
- Business settings page
- Subscription/plan management

---

## Notes for Claude Code

- **Calendar ID** — never hardcode. Always store as `staff.calendar_id` in Supabase and read dynamically.
- **Overlap detection** — use the `hasOverlap()` function above. The old n8n exact-match logic is a known bug, do not replicate it.
- **Salome endpoints** — keep them at `/api/salome/*` so the Vapi tool URLs only need to change once (from n8n.poc.ge to rigify.ge).
- **Timezone** — all datetimes stored as UTC in Supabase, displayed in Asia/Tbilisi (UTC+4). Use `date-fns-tz` for conversion.
- **Georgian text** — the system prompt for Salome must be auto-generated in Georgian from the business's Supabase data. Template is in the Salome handoff document.
- **booking_source field** — always required. Voice bookings come through `/api/salome/book-appointment` so set `booking_source = 'voice'` automatically in that endpoint.
- **RLS** — business owners must never be able to read other businesses' bookings. Enforce at database level, not just API level.
