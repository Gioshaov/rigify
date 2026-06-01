# Rigify Development Session Summary
**Date**: June 1, 2026  
**Repository**: https://github.com/Gioshaov/rigify  
**Last Updated**: June 1, 2026

---

## What We Accomplished

### 1. Fixed Database Migrations & Made Them Idempotent
**Problem**: Migration files were not idempotent, causing errors when re-run against existing database.

**Solution**: Updated all migration files to use:
- `drop trigger if exists` before `create trigger`
- `drop policy if exists` before `create policy`
- `create table if not exists`
- `create index if not exists`

**Files Modified**:
- `supabase/migrations/20260601000001_businesses.sql`
- `supabase/migrations/20260601000004_bookings.sql`
- `supabase/migrations/20260601000005_reviews.sql`
- `supabase/migrations/20260601000006_subscriptions.sql`
- `supabase/migrations/20260601000007_rls.sql`

---

### 2. Fixed Business Owner Registration Auth Issue
**Problem**: 
- Business owner registration was showing "Could not create business: permission denied for table businesses"
- Dashboard showed "No business linked to this account" even when owner_id matched

**Root Cause**: 
- Missing GRANT permissions on tables for `authenticated` and `anon` roles
- RLS policies were correct, but PostgreSQL checks GRANTs before RLS

**Solution**: Added grants to all tables:
```sql
grant select, insert, update, delete on public.businesses to authenticated;
grant select on public.businesses to anon;
grant all privileges on public.businesses to service_role;
```

**Files Modified**:
- `app/(auth)/register/actions.ts` (cleaned up debug logs, improved session handling)
- `app/dashboard/page.tsx` (added debug logging and admin bypass check)

---

### 3. Implemented Customer Authentication System
**Problem**: The system only had business owner accounts. End-users (customers who book appointments) had no way to create accounts, view their bookings, or manage their profile.

**Solution**: Built a complete customer authentication system separate from business owners.

#### Database Changes (3 new migrations)

**Migration 1**: `20260601000009_customers.sql`
- Created `customers` table with profile data (name, phone, email, preferences)
- Links to `auth.users` via `id` (PK/FK)
- Includes `updated_at` trigger

**Migration 2**: `20260601000010_bookings_customer_id.sql`
- Added nullable `customer_id` column to `bookings` table
- Supports both:
  - **Authenticated bookings**: `customer_id` set (linked to customer account)
  - **Guest bookings**: `customer_id` null (existing behavior)

**Migration 3**: `20260601000011_customer_rls.sql`
- RLS policies for customers (own profile only)
- Updated bookings RLS to allow customers to view their own bookings
- Added GRANT permissions for authenticated role

#### Frontend Implementation

**Customer Registration**:
- `app/(auth)/customer-register/page.tsx`
- `app/(auth)/customer-register/CustomerRegisterForm.tsx`
- `app/(auth)/customer-register/actions.ts`
- Route: `/customer-register`
- Fields: name, phone, email, password
- Creates auth user + customer profile, redirects to `/customer/dashboard`

**Customer Dashboard**:
- `app/customer/dashboard/layout.tsx` (separate layout from business dashboard)
- `app/customer/dashboard/page.tsx` (upcoming & past bookings list)
- `app/customer/dashboard/profile/page.tsx` (edit profile)
- `app/customer/dashboard/profile/CustomerProfileForm.tsx`
- `app/customer/dashboard/profile/actions.ts`
- `components/customer/CustomerSidebar.tsx` (customer-specific navigation)

**Login Routing**:
- Updated `app/(auth)/login/actions.ts`
- After successful login, checks if user has:
  - `businesses` row → redirect to `/dashboard` (business owner)
  - `customers` row → redirect to `/customer/dashboard` (customer)
  - Neither → show error

**Middleware Protection**:
- Updated `lib/supabase/middleware.ts`
- Business owners can't access `/customer/dashboard/*` (auto-redirect)
- Customers can't access `/dashboard/*` (auto-redirect)
- Both require authentication

---

### 4. Set Up GitHub Repository
**Repository**: https://github.com/Gioshaov/rigify  
**Branch**: `main`

**Commits**:
1. Initial commit (before customer auth)
2. Customer authentication system implementation

---

### 4. Multi-Category Support, Staff Accounts & Enhanced Workflows
**Problem**: 
- Businesses could only select one category (limiting for multi-service salons)
- No way for business owners to create staff accounts with login access
- Phone wasn't required during registration
- Customer bookings showed only city instead of full address
- Guest bookings had no validation for contact info

**Solution**: Ultraplan implementation added multi-category support, complete staff authentication system, and improved data quality.

#### Database Changes (3 new migrations)

**Migration 12**: `20260601000012_businesses_multi_category.sql`
- Created `business_categories` junction table for many-to-many relationship
- Added RLS policies for public read and owner write
- Documented phone requirement (enforced in application layer)
- Indexes on `business_id` and `category_id` for performance

**Migration 13**: `20260601000013_staff_users.sql`
- Added `user_id` column to `staff` table (links to auth.users)
- Added `role` column ('staff' or 'manager')
- Created `staff_permissions` table with granular permission flags:
  - `can_view_appointments`, `can_edit_appointments`
  - `can_view_customers`, `can_view_services`, `can_edit_services`
  - `can_view_staff`, `can_edit_staff`
  - `can_view_settings`, `can_edit_settings`
  - `can_view_salome`, `can_edit_salome`
- Created trigger to auto-create default permissions for new staff
- Added RLS policies for staff to view their business bookings
- Updated staff RLS to allow self-selection

**Migration 14**: `20260601000014_guest_booking_validation.sql`
- Added check constraint: guest bookings must have email OR phone (prevents incomplete contact info)

#### Frontend Implementation

**Business Registration**:
- `app/(auth)/register/RegisterForm.tsx`:
  - Changed category selector from single dropdown to multi-select checkboxes
  - Made phone field required
  - Added client-side validation for at least one category
- `app/(auth)/register/actions.ts`:
  - Validates phone is provided
  - Validates at least one category selected
  - Inserts all selected categories into `business_categories` junction table
  - Maintains backward compatibility (first category saved to `category` field)

**Staff Invitation System**:
- `app/dashboard/staff/invite/page.tsx` - Invitation page
- `app/dashboard/staff/invite/InviteStaffForm.tsx` - Client form
- `app/dashboard/staff/invite/actions.ts` - Server action
  - Business owners can create staff accounts with email/password
  - Select role: 'staff' (basic permissions) or 'manager' (elevated permissions)
  - Auto-creates auth user + staff record + default permissions via trigger
  - Rollback handling: deletes auth user if staff creation fails
- `app/dashboard/staff/page.tsx` - Added "Invite Staff" button

**Staff Dashboard**:
- `app/dashboard/staff-view/layout.tsx` - Staff dashboard layout
- `app/dashboard/staff-view/page.tsx` - Staff overview (today's appointments for their business)
- `components/dashboard/StaffSidebar.tsx` - Navigation with permission-based filtering
  - Shows business name + staff role
  - Only displays navigation items they have permission to access
  - Same logout flow as business owners

**Login & Routing**:
- `app/(auth)/login/actions.ts`:
  - Added staff user detection
  - Routes staff to `/dashboard/staff-view`
  - Precedence: business owner > staff > customer
- `lib/supabase/middleware.ts`:
  - Added staff dashboard protection (`/dashboard/staff-view/*`)
  - Prevents cross-dashboard access:
    - Business owners redirected away from staff/customer dashboards
    - Staff redirected away from business owner/customer dashboards
    - Customers redirected away from business owner/staff dashboards

**Customer Dashboard Enhancement**:
- `app/customer/dashboard/page.tsx`:
  - Updated queries to fetch `businesses(name, address)` instead of just city
  - Displays full address for both upcoming and past bookings

**TypeScript Types**:
- `lib/types/business.ts` (new file):
  - `CategoryId` type for valid category IDs
  - `BusinessCategory` interface for junction table
  - `Business` interface with categories array
  - `StaffPermissions` interface for permission flags
  - `Staff` interface with user_id and role

#### Files Changed

**New Files (11)**:
- `supabase/migrations/20260601000012_businesses_multi_category.sql`
- `supabase/migrations/20260601000013_staff_users.sql`
- `supabase/migrations/20260601000014_guest_booking_validation.sql`
- `app/dashboard/staff/invite/page.tsx`
- `app/dashboard/staff/invite/InviteStaffForm.tsx`
- `app/dashboard/staff/invite/actions.ts`
- `app/dashboard/staff-view/layout.tsx`
- `app/dashboard/staff-view/page.tsx`
- `components/dashboard/StaffSidebar.tsx`
- `lib/types/business.ts`
- `IMPLEMENTATION_SUMMARY.md`

**Modified Files (6)**:
- `app/(auth)/register/RegisterForm.tsx` - Multi-select categories, required phone
- `app/(auth)/register/actions.ts` - Junction table inserts
- `app/(auth)/login/actions.ts` - Staff detection & routing
- `app/dashboard/staff/page.tsx` - "Invite Staff" button
- `app/customer/dashboard/page.tsx` - Show address instead of city
- `lib/supabase/middleware.ts` - Staff dashboard protection

#### User Flows

**Business Owner → Staff Invitation**:
1. Navigate to `/dashboard/staff`
2. Click "Invite Staff" button → `/dashboard/staff/invite`
3. Enter staff details (name, email, password, role, specialty)
4. Submit → Creates auth user + staff record + permissions
5. Staff receives credentials (email/password) from business owner

**Staff → Login & Access**:
1. Login at `/login` with credentials from business owner
2. Auto-routes to `/dashboard/staff-view`
3. See today's appointments for their business
4. Navigation filtered by permissions (only show what they can access)
5. Can view/edit based on role (staff vs manager)

**Multi-Category Registration**:
1. Business owner registers at `/register`
2. Select multiple categories via checkboxes (required: at least one)
3. Phone field is required
4. Submit → Business created with primary category + all categories in junction table

---

## Current System Architecture

### User Types

1. **Business Owners** (merchants)
   - Register: `/register` (multi-category selection + required phone)
   - Login: `/login` → redirects to `/dashboard`
   - Manage: business settings, services, staff, appointments, Salome AI
   - Can invite staff members with different permission levels
   - Database: `auth.users` + `businesses` table (linked via `owner_id`)

2. **Staff Members** (employees with system access) ✨ NEW
   - Created by: business owner via `/dashboard/staff/invite`
   - Login: `/login` → redirects to `/dashboard/staff-view`
   - Features: view/edit appointments, customers, services (based on permissions)
   - Roles: 'staff' (basic) or 'manager' (elevated)
   - Permission-based navigation (only see what they can access)
   - Database: `auth.users` + `staff` table (linked via `user_id`) + `staff_permissions` table

3. **Customers** (end-users with accounts)
   - Register: `/customer-register`
   - Login: `/login` → redirects to `/customer/dashboard`
   - Features: view bookings (with full business address), manage profile
   - Database: `auth.users` + `customers` table (linked via `id`)

4. **Guest Customers** (bookings without accounts)
   - No registration required
   - Book via: voice (Salome AI), Instagram, Facebook, or future web booking form
   - Must provide email OR phone (validated at database level)
   - Database: `bookings` with `customer_id = null`, stores name/phone/email directly

### Database Schema

**Core Tables**:
- `businesses` - business profiles (salons, clinics, etc.)
- `business_categories` - many-to-many junction for business categories ✨ NEW
- `customers` - customer profiles
- `services` - services offered by businesses
- `staff` - staff members at businesses (now with `user_id` and `role`) ✨ UPDATED
- `staff_permissions` - granular permissions per staff member ✨ NEW
- `bookings` - appointments (supports authenticated & guest bookings)
- `reviews` - customer reviews
- `subscriptions` - business subscription plans

**Auth Flow**:
```
auth.users (Supabase Auth)
    ├─→ businesses (owner_id FK) [Business Owners]
    ├─→ staff (user_id FK) [Staff Members] ✨ NEW
    └─→ customers (id FK) [Customers]

businesses ←→ business_categories ←→ categories (many-to-many) ✨ NEW

staff → staff_permissions (1:1, auto-created via trigger) ✨ NEW

bookings
    ├─→ customer_id (FK to customers) [Authenticated Booking]
    └─→ customer_name/phone/email [Guest Booking]
```

---

## Issues Resolved

### ✅ "Permission denied for table businesses"
- **Cause**: Missing GRANT permissions for authenticated role
- **Fix**: Added grants in migration `20260601000011_customer_rls.sql`

### ✅ "Permission denied for table customers"
- **Cause**: Same as above
- **Fix**: Added grants in same migration

### ✅ "No business linked to this account" after registration
- **Cause**: Session cookie not propagating, auth.uid() returning NULL in RLS
- **Fix**: 
  - Simplified registration flow (removed redundant signInWithPassword)
  - Added grants so authenticated users can query their own data
  - Added debug logging to diagnose session issues

### ✅ Orphaned users (user exists but no business/customer profile)
- **Cause**: Registration failed after creating auth user but before creating profile
- **Fix**: Cleaned up orphaned users, fixed permission issues so registration completes fully

---

## What's NOT Implemented Yet

### Public Booking Flow (HIGH PRIORITY NEXT STEP)
Currently, there is NO way for the public to:
- Browse businesses (marketplace/directory)
- View business profiles (services, staff, hours)
- Book appointments via web form

**Booking sources exist**:
- ✅ Voice (Salome AI) - assumes external integration
- ✅ Instagram - assumes external integration
- ✅ Facebook - assumes external integration
- ❌ Web booking form - **NOT BUILT**

**What needs to be built**:
1. **Business Directory** (`/businesses`)
   - Search/filter by category, city, rating
   - Grid/list view of active businesses
   
2. **Business Profile Page** (`/businesses/[slug]`)
   - Business info (name, description, hours, location)
   - Services list with pricing
   - Staff profiles
   - Reviews
   - **Book appointment button**

3. **Booking Flow** (`/businesses/[slug]/book`)
   - Select service
   - Select staff (optional)
   - Select date & time (calendar with availability)
   - Enter customer details:
     - If logged in as customer: pre-fill from profile
     - If guest: enter name/phone/email
   - Confirmation page
   - Create booking via server action

4. **Booking Confirmation**
   - Email confirmation (via Supabase email or external service)
   - SMS confirmation (optional)
   - Add to calendar link

### Other Missing Features
- **Staff Management** (partially implemented):
  - ✅ Staff account creation
  - ✅ Staff login & dashboard
  - ✅ Permission-based access
  - ❌ Staff management page (list all staff, view details)
  - ❌ Deactivate/reactivate staff accounts
  - ❌ Edit staff permissions UI (permissions exist, need UI)
  - ❌ Staff can't view/edit their own availability
  - ❌ Staff-specific appointment views (filter by assigned staff)

- **Customer Booking Management**:
  - Cancel booking (from `/customer/dashboard`)
  - Reschedule booking
  - Leave review after completed booking

- **Business Owner Features**:
  - Calendar view of appointments (currently just a list)
  - Drag-and-drop scheduling
  - Real-time availability checking

- **Salome AI Integration**:
  - Voice receptionist setup
  - Call recording/transcripts
  - VAPI integration (API key exists in .env but not wired up)

- **Payment Processing**:
  - No payment system (bookings are free)
  - Would need Stripe/Square integration for deposits/full payment

- **Email/SMS Notifications**:
  - Booking confirmations
  - Reminders (24h before appointment)
  - Cancellation notices

---

## Next Steps (Prioritized)

### 1. Build Public Booking Flow (CRITICAL)
Without this, customers can't actually book appointments via the web. This is the core user journey.

**Tasks**:
- [ ] Create `/businesses` page (directory/marketplace)
- [ ] Create `/businesses/[slug]` page (business profile)
- [ ] Build booking form with calendar picker
- [ ] Implement availability checking (no double-bookings)
- [ ] Create booking confirmation flow
- [ ] Test guest booking vs authenticated customer booking

**Estimated effort**: 4-6 hours

---

### 2. Customer Booking Management
- [ ] Add "Cancel" button to customer bookings (with business policy: e.g., 24h notice required)
- [ ] Add "Rescheduling" flow
- [ ] Add "Leave Review" after completed appointment

**Estimated effort**: 2-3 hours

---

### 3. Business Owner Calendar View
- [ ] Replace appointment list with calendar grid view
- [ ] Add day/week/month views
- [ ] Show staff schedules side-by-side
- [ ] Highlight conflicts/overlaps

**Estimated effort**: 3-4 hours

---

### 4. Notifications System
- [ ] Set up email templates (Supabase Auth emails or Resend/SendGrid)
- [ ] Booking confirmation email
- [ ] Reminder email (24h before)
- [ ] SMS notifications (Twilio integration)

**Estimated effort**: 3-4 hours

---

### 5. Salome AI Integration (Voice Booking)
- [ ] Wire up VAPI API key
- [ ] Build voice agent configuration UI
- [ ] Test voice booking flow
- [ ] Handle voice → booking creation

**Estimated effort**: Unknown (depends on VAPI docs)

---

## Technical Debt / Known Issues

### Performance
- No indexes on frequently queried columns (some exist, audit needed)
- No pagination on bookings list (will be slow with many bookings)

### Security
- `.env.local` contains real Supabase keys (already in .gitignore ✅)
- No rate limiting on registration/login
- No CAPTCHA on public forms

### Code Quality
- Debug console.logs still present in production code (should remove)
- No error boundaries in React components
- No loading states on some forms

### Testing
- No automated tests (unit, integration, or E2E)
- Only manual testing performed

---

## Database Migrations Applied

All migrations in `supabase/migrations/`:
1. `20260601000001_businesses.sql` ✅
2. `20260601000002_services.sql` ✅
3. `20260601000003_staff.sql` ✅
4. `20260601000004_bookings.sql` ✅
5. `20260601000005_reviews.sql` ✅
6. `20260601000006_subscriptions.sql` ✅
7. `20260601000007_rls.sql` ✅
8. `20260601000008_indexes.sql` ✅
9. `20260601000009_customers.sql` ✅
10. `20260601000010_bookings_customer_id.sql` ✅
11. `20260601000011_customer_rls.sql` ✅
12. `20260601000012_businesses_multi_category.sql` ✅ NEW - Multi-category support
13. `20260601000013_staff_users.sql` ✅ NEW - Staff authentication & permissions
14. `20260601000014_guest_booking_validation.sql` ✅ NEW - Guest contact validation

---

## Environment Setup

**Required Environment Variables** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://zipxmghbougztwdtzftn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (JWT)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (JWT)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=ka
VAPI_API_KEY= (not yet used)
```

**Supabase Project Settings**:
- **Email confirmation**: DISABLED (for development)
- **Auth providers**: Email/Password only
- **RLS**: ENABLED on all tables

---

## Development Workflow

**Local Development**:
```bash
npm run dev         # Start Next.js dev server
npm run build       # Build for production
npm run type-check  # TypeScript validation
```

**Database**:
```bash
supabase db push    # Apply migrations
supabase db reset   # Reset database (destructive)
```

**Git**:
```bash
git status
git add .
git commit -m "message"
git push origin main
```

---

## References

**Tech Stack**:
- **Framework**: Next.js 14.2.18 (App Router)
- **Language**: TypeScript 5.5
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS 3.4

**Key Dependencies**:
- `@supabase/supabase-js` 2.45.0
- `@supabase/ssr` 0.5.2
- `next-intl` 3.22.0 (i18n - Georgian/English/Russian)
- `date-fns` 3.6.0 & `date-fns-tz` 3.2.0 (Tbilisi timezone)

---

## Session End State

✅ **Working**:
- Business owner registration & login (multi-category + required phone)
- Staff account creation by business owners
- Staff authentication & permission-based access
- Staff dashboard with filtered navigation
- Customer registration & login
- Login routing based on user type (business owner / staff / customer)
- Middleware protection for all dashboard types
- Customer can view bookings with full business address
- Customer can edit profile
- Database migrations idempotent
- GitHub repository set up
- All 14 migrations applied successfully

✨ **New This Session**:
- Multi-category support for businesses
- Complete staff authentication system
- Permission-based staff dashboard
- Phone required for business registration
- Guest booking validation (email OR phone required)
- Customer bookings show full address

❌ **Not Working / Missing**:
- Public booking flow (no way for customers to book via web)
- Business directory/marketplace
- Calendar view for business owners
- Notifications
- Salome AI integration
- Staff permission editor UI (permissions exist, but no UI to edit them yet)
- Staff management page (list all staff, deactivate accounts)

---

**Ready for Next Session**: Build the public booking flow starting with the business directory page.
