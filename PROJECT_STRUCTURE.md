# Rigify Project Structure

**Last Updated**: June 5, 2026  
**Purpose**: Reference guide for project organization

---

## Root Directory

```
rigify/
├── app/                      # Next.js 14 App Router pages
├── components/               # Reusable React components
├── lib/                      # Utilities, hooks, types, constants
├── supabase/                 # Database migrations
├── scripts/                  # Development utility scripts
├── design-assets/            # Design mockups and branding
├── public/                   # Static files (served from /)
├── types/                    # Global TypeScript types
├── node_modules/             # Dependencies (git-ignored)
│
├── CLAUDE.md                 # Main project instructions
├── LATEST_SESSION.md         # Living doc: current status + latest work
├── SESSION_HISTORY.md        # Full chronological archive
├── UI_GUIDE.md              # Complete UI/UX design system
│
├── middleware.ts             # Next.js middleware (auth routing)
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.mjs           # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── .env.local               # Environment variables (git-ignored)
```

---

## Recent Improvements (June 5, 2026)

### ✅ Cleaned Root Directory
- Moved utility scripts → `/scripts`
- Moved design assets → `/design-assets`
- Deleted old patch file (`rigify-all-changes.patch`)
- Removed empty `.claude-ui` directory

### ✅ Fixed Duplicate Routes
- Removed duplicate `/logout` route
- Kept CSRF-protected `/(auth)/logout` route only

### ✅ Improved Component Organization
- Moved `CitiesSection.tsx` from `app/` → `components/marketing/`

### ✅ Added Missing Directories
- Created `/public` for static assets
- Created `/scripts` with README
- Created `/design-assets` with README

### ✅ Consolidated Documentation
- 4 essential MD files (down from 8+)
- All UI docs in single `UI_GUIDE.md`
- Session management streamlined

---

## App Directory Structure

```
app/
├── (auth)/                   # Auth routes (grouped)
│   ├── login/                # Unified login
│   ├── logout/               # CSRF-protected logout
│   ├── customer-register/    # Customer registration
│   └── forgot-password/      # Password reset
│
├── admin/                    # Super admin panel
│   ├── (auth-required)/      # Protected routes
│   │   ├── onboard/          # New business onboarding
│   │   └── businesses/[id]/edit/
│   └── login/                # Admin login
│
├── dashboard/                # Business owner dashboard
│   ├── appointments/
│   ├── staff/
│   ├── services/
│   ├── settings/
│   └── salome/
│
├── staff-dashboard/          # Staff member dashboard
│
├── customer/dashboard/       # Customer dashboard
│   ├── page.tsx              # Bookings list
│   └── profile/
│
├── businesses/               # Public marketplace
│   ├── page.tsx              # Directory
│   └── [slug]/               # Business profile
│       ├── book/             # Booking flow
│       └── booking-confirmed/
│
└── api/                      # API routes
    ├── contact/
    ├── availability/
    └── bookings/
```

---

## Components Directory

```
components/
├── dashboard/                # Business owner components
├── customer/                 # Customer components
├── marketing/                # Marketing pages
│   ├── ForBusinessesPage.tsx
│   └── CitiesSection.tsx
├── ui/                       # Shared UI
│   ├── LanguageToggle.tsx
│   └── ImageUpload.tsx
└── providers/                # React contexts
    └── RootProviders.tsx
```

---

## Lib Directory

```
lib/
├── supabase/                 # Supabase utilities
│   ├── client.ts             # Browser client
│   ├── server.ts             # Server + admin client
│   └── middleware.ts         # Auth middleware
│
├── utils/                    # Utility functions
│   ├── availability.ts       # Overlap detection
│   ├── datetime.ts           # Tbilisi timezone
│   ├── validation.ts         # Input validation
│   └── server-translations.ts
│
├── constants/                # Static data
│   ├── categories.ts         # Service categories
│   ├── cities.ts             # Georgian cities
│   └── districts.ts          # Tbilisi districts
│
├── translations/             # i18n strings (150+)
├── hooks/                    # React hooks
├── contexts/                 # React contexts
└── types/                    # TypeScript types
```

---

## Scripts Directory

```
scripts/
├── README.md
├── contrast-audit.js         # WCAG AA checker
└── find-outline-color.js     # Color utility
```

**Usage**: `node scripts/contrast-audit.js`

---

## Design Assets

```
design-assets/
├── README.md
└── stitch_rigify_dark_premium_marketplace/
    ├── homepage_discovery/
    ├── booking_flow/
    ├── business_dashboard/
    ├── rigify_logo/
    └── ... (19 design folders)
```

**Purpose**: Reference designs from Stitch AI. Not used in production code.

---

## Key Patterns

### Route Groups
- `(auth)` - Groups auth routes without affecting URL
- `(auth-required)` - Groups protected admin routes

### File Naming
- Pages: `page.tsx`
- Layouts: `layout.tsx`
- API routes: `route.ts`
- Server actions: `actions.ts`
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`

### Import Paths
- Use `@/` alias for root imports
- Example: `import { createClient } from '@/lib/supabase/client'`

---

## Documentation Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `CLAUDE.md` | Main instructions | When patterns change |
| `LATEST_SESSION.md` | Current status | Every session end |
| `SESSION_HISTORY.md` | Full archive | Every session end |
| `UI_GUIDE.md` | Design system | When UI changes |
| `PROJECT_STRUCTURE.md` | This file | When structure changes |

---

**Result**: Clean, organized structure with clear separation of concerns. Ready for production deployment.
