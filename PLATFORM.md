# Rigify Platform

> A non-technical overview of what Rigify is, who uses it, how it works, what we run on, and what's still to be built.
>
> **Last verified:** 2026-06-28 — against codebase, `package.json`, `supabase/migrations/`, and `LATEST_SESSION.md`. If you're reading this more than ~3 months out, treat the "What's Built" section as a snapshot — `LATEST_SESSION.md` always has the freshest list.

---

## 1. What is Rigify

Rigify is **Georgia's beauty & wellness booking marketplace** — think Booksy or Fresha, built for Georgia (the country, not the US state). Customers discover and book appointments with hair salons, barbers, nail studios, massage therapists, cosmetologists, and tattoo / piercing artists.

The product has three legs:

- **The marketplace (built and live).** A public website at `rigify.ge` where customers browse businesses by category, city, rating, or location on a map, see services and staff, and book an appointment — with or without an account.
- **Salome AI voice receptionist (planned).** A phone number per business that picks up calls, talks to the customer in Georgian, checks availability, and books the appointment without a human. A proof-of-concept exists today using n8n + Google Calendar; the production integration on Vapi is not yet built.
- **Social bots (planned).** Instagram and Facebook DM chatbots that handle the same "what's free Saturday?" booking conversations the voice receptionist would. Not started yet.

**Market focus:** Tbilisi is live. Batumi and Kutaisi are advertised on the homepage as "coming soon" but no businesses have been onboarded in them yet.

**Languages:** Georgian (primary) and English are both supported in the UI via a site-wide toggle. Russian was originally planned and had database columns, but those were dropped in late June 2026 — so the product is currently Georgian / English only.

**Monetization:** Not yet decided. There is no payment processor integrated (no Stripe, no local Georgian payment provider). Bookings are free for customers and free for businesses today. The expected revenue paths are (a) a per-business subscription for the marketplace listing and Salome voice add-on, (b) optional commission on bookings. None of that is built.

---

## 2. Who uses it (user types)

Five distinct roles. The first four log in; the fifth doesn't.

### Customer (logged in)
- **Who:** Someone who wants to book a beauty / wellness appointment and wants their history saved.
- **Sign up at:** `/customer-register` (name, email, phone, password).
- **What they can do:**
  - Browse and book appointments
  - View upcoming and past bookings on a personal dashboard
  - Reschedule or cancel a booking
  - One free "emergency cancel" (within 24h of the appointment, normally a paid policy)
  - Edit their profile (name, phone, email, avatar)
  - Receive automatic emails for confirmation, reschedule, and cancellation
- **Lives at:** `/customer/dashboard`

### Customer (guest)
- **Who:** Someone who just wants to book once without making an account.
- **Sign up at:** nothing — they enter name, phone, and email at booking time.
- **What they can do:**
  - Browse and book exactly like a logged-in customer
  - Receive the confirmation email
- **What they can't do:** view, reschedule, or cancel their booking later from the website. They have to call the business or create an account.

### Business owner
- **Who:** Salon, barbershop, clinic, or independent artisan running their own appointment book.
- **Sign up:** Currently business owners are onboarded by a super admin (see below). Self-serve registration exists at `/register` but the standard path is admin-onboarded.
- **What they can do:**
  - See today's schedule and key stats on a dashboard
  - View, create, and edit appointments (with conflict detection so two appointments can't double-book the same staff slot)
  - Manage their service list (name, price, duration, category)
  - Invite staff members (auto-generates the staff login)
  - Edit their business profile — name, description, address, city, hours, cover image, logo
  - View the (planned) Salome AI voice receptionist status page
- **Lives at:** `/dashboard`

### Staff member
- **Who:** An employee of a business who works on customer appointments but doesn't manage the business itself.
- **Sign up:** Invited by the business owner — a login is auto-created for them.
- **What they can do:**
  - See their own personal schedule for today and this week
  - View basic stats (appointments today, next client, earnings, clients this week)
  - View detail on each appointment assigned to them
- **What they can't do:** Edit the business profile, manage services, invite other staff, or see other staff members' schedules.
- **Lives at:** `/staff-dashboard`

### Super admin
- **Who:** Platform operators (us — the founders / staff).
- **Sign up:** None — super admin status is granted manually in the Supabase auth console by setting a flag (`is_super_admin = true`) on a user.
- **What they can do:**
  - View platform-wide KPIs (total businesses, active businesses, total customers, today's bookings)
  - Onboard new businesses (creates the business profile, owner login, optional staff login in one wizard)
  - Browse, search, edit, and deactivate every business
  - Browse, search, edit every customer
  - Browse, search, edit, reschedule, cancel, or manually create every booking
  - View an audit log of admin actions
- **Lives at:** `admin.rigify.ge` (a separate subdomain — see Architecture section below)

---

## 3. Core flows

### Flow A: A customer books an appointment

1. The customer lands on the homepage (`rigify.ge`) and sees the hero, the six service-category tiles (Hair, Barber, Nails, Massage, Cosmetology, Tattoo / Piercing), and the regional rollout list (Tbilisi live, Batumi & Kutaisi coming).
2. They click **Browse Studios** and land on a directory page with three view modes they can toggle between: a **list** of business cards, a **map** with all businesses pinned, or a **split** view (list on the left, map on the right). The choice is remembered between visits.
3. They filter by city, category, rating, or use the "Near Me" button to sort by distance.
4. They click a business → they see the business profile: cover image, logo, name, rating, description, list of services with prices and durations, staff with photos and specialties, recent customer reviews, and a map of the location.
5. They click a service → a booking dialog opens. They pick a staff member (or let the system pick the first available one), pick a date on a calendar (only days with availability are selectable), pick an available time slot.
6. If they're not logged in, they enter their name, email, and phone. If they are logged in, those fields are pre-filled.
7. They confirm. The booking is saved, both the customer and the business get an email, and the customer sees a confirmation page with the appointment details.

A guest customer's flow ends here — they have the email and the confirmation page; that's all they get. A logged-in customer can come back to `/customer/dashboard` and reschedule or cancel later.

### Flow B: A business owner runs their day

1. They log in at `/login` and are redirected to `/dashboard`.
2. They see the dashboard header — date, city, business status (live or inactive), Salome status (active / not configured), today's revenue, and today's appointment count.
3. The main panel lists today's appointments in time order: customer name, service, staff, status badge (pending / confirmed / completed / cancelled).
4. Quick actions in the sidebar let them: create a manual appointment, jump to the staff directory, edit a service, or open Salome settings.
5. Day-to-day, they bounce between:
   - **/dashboard/appointments** — the full appointment list with a 3-month window, filterable by service/staff/status. They can edit any appointment, including rescheduling it (the system checks for staff conflicts).
   - **/dashboard/services** — add a new service, edit pricing or duration, deactivate one without deleting it.
   - **/dashboard/staff** — invite a new staff member (system auto-generates a login link), see who's active.
   - **/dashboard/settings** — change the business name, address, hours, cover image, logo.
   - **/dashboard/salome** — placeholder status page for the (still-planned) voice receptionist.

### Flow C: A super admin onboards a new business

1. The super admin opens `admin.rigify.ge/login` and signs in.
2. From the admin dashboard, they click **New Business** → they're taken to a multi-step onboarding wizard.
3. They fill in the business details: name, city, district, address, phone, category.
4. They fill in the owner's account: name, email, password.
5. Optionally they add one staff account too.
6. Submit. The system creates:
   - The business record (with an auto-generated URL slug)
   - The owner's auth user
   - The optional staff auth user
   - The link between owner and business
7. The owner can now log in at `/login` and start filling in services, staff, hours, and a cover photo.

### Flow D: Voice booking via Salome AI (planned, not built)

This describes the **intended** flow once Salome is built. Today's voice booking POC runs on n8n + Google Calendar outside the platform and is being phased out.

1. A potential customer calls the business's dedicated phone number (each business gets one from a telecom called DIDWW).
2. The call routes to Vapi (an AI voice platform), which runs a Georgian-speaking voice agent configured for that specific business — knows their services, staff, and hours.
3. The agent has a conversation with the caller: "Hi, what would you like to book?" → checks availability against the live database → "I have 2pm or 4pm Saturday, which works?"
4. When the caller confirms, the agent calls back to Rigify's API to create the booking. The booking is tagged with `booking_source = 'voice'` so the business knows where it came from.
5. The customer gets the standard confirmation email; the business sees the appointment on their dashboard.

**What needs to be built:** the two API endpoints Vapi calls (`/api/salome/check-availability` and `/api/salome/book-appointment`), per-business Vapi agent provisioning, and the admin UI for businesses to enable / configure Salome.

---

## 4. Tech stack at a glance

| Layer | What we use | What it does for us |
|---|---|---|
| Frontend framework | **Next.js 14** (App Router) | The whole website — pages, API routes, server-rendered HTML. The "App Router" is the modern Next.js way of organizing pages. |
| Language | **TypeScript** | JavaScript with type safety. Catches a lot of mistakes before they reach production. |
| Styling | **Tailwind CSS** | Visual styling via utility classes. Custom dark + gold theme defined centrally in `tailwind.config.ts`. |
| Database | **PostgreSQL** (via Supabase) | All business, customer, booking, service, staff, and review data. |
| Authentication | **Supabase Auth** (email + password) | Customer, business owner, and staff logins. Super admin is a flag on the auth user. No Google / Apple sign-in yet. |
| Hosting | **Vercel** | Runs the website at `rigify.ge` and `staging.rigify.ge`. Includes the CDN, SSL certificates, and serverless functions. |
| Email | **Resend** | All transactional emails (booking confirmation, reschedule, cancellation). Sender: `noreply@rigify.ge`. |
| Maps | **Mapbox GL** | The map view on the directory and business pages. Branded with our gold pins. |
| Icons | **Lucide React** | The icon set used throughout the UI. |
| Dates / timezone | **date-fns** + **date-fns-tz** | All times are stored in UTC and shown in Asia/Tbilisi (UTC+4). |
| Rate limiting cache | **Vercel KV** (Upstash Redis) | Throttles the public contact form to 5 submissions per 15 minutes per IP. |
| Testing | **Playwright** | Browser-driven end-to-end tests (`npm run test:e2e`). |
| Design tooling | **Stitch AI** + Figma | Initial visual designs were generated with Stitch (reference files live in `design-assets/`). No Figma plugin or integration — designs are exported as HTML/CSS and referenced when we build UI. |
| Source control | **GitHub** | Repo at `github.com/Gioshaov/rigify`. Two long-lived branches: `master` (production) and `staging`. |
| Voice (planned) | **Vapi** | AI voice agent platform for Salome. API key is in our environment but no code calls it yet. |
| Telecom (current) | **DIDWW** | Georgian phone numbers for the voice booking POC. Each business gets a number. |

---

## 5. Third-party services & integrations

Ordered by how critical they are. For each: what they do, current status, where the credentials live, and what they cost to the extent we know.

### Vercel — hosting + deployment pipeline
- **What:** Runs the website. Anytime someone visits rigify.ge, they hit Vercel's infrastructure first (CDN, SSL), and Vercel runs our Next.js code (page rendering, API calls) on its serverless functions.
- **Also handles:** Continuous deployment. Push to the `master` branch → production deploys automatically. Push to `staging` → staging deploys automatically.
- **Status:** Live.
- **Credentials:** Vercel dashboard login + environment variables configured per environment (production, staging, preview).
- **Cost:** Has a paid plan (the free tier doesn't allow the features we use). Check the billing page on vercel.com for the actual number.

### Supabase — database, authentication, file storage
- **What:** Stores every business, customer, booking, service, review, audit log, contact form submission. Also handles login (creates the user record, verifies passwords, manages session cookies). Also hosts uploaded files (cover images, logos).
- **Status:** Live. Separate projects for production and staging — they don't share data.
- **Credentials:** Three environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. The first two are safe to expose to the browser; the third is server-only and bypasses our access controls (it's used for things like creating a profile during registration).
- **Cost:** Paid plan for production (the free tier caps at 500MB database and pauses inactive projects, which we can't afford on production).

### Resend — transactional email
- **What:** Sends booking-related emails — confirmation to the customer, confirmation to the business, cancellation notice, reschedule notice. Four email templates total, branded with the Rigify dark + gold look.
- **Status:** Live since 2026-06-18. Sender domain (`rigify.ge`) is verified with SPF and DKIM records so emails don't go to spam.
- **Credentials:** `RESEND_API_KEY` environment variable. See `RESEND_SETUP.md` for the full setup walk-through.
- **Cost:** Free tier covers 100 emails / day and 3,000 / month. We're well under that today.

### Mapbox — interactive maps
- **What:** The map on the directory page (`/businesses`) and on each business profile. Custom-styled with our gold marker pins, zoomed to the Georgia region.
- **Status:** Live.
- **Credentials:** `NEXT_PUBLIC_MAPBOX_TOKEN`. Safe to expose to the browser (it's scoped to map view requests only).
- **Cost:** Free tier covers 50,000 map loads per month. We're well under.

### Vercel KV (Upstash Redis) — rate-limiting cache
- **What:** A small fast key-value store that we use only to throttle the public contact form. Without it, someone could spam our contact form with thousands of submissions.
- **Status:** Live, used by `app/api/contact/route.ts`. It's also designed to fail gracefully — if Redis is down, the contact form still accepts submissions, it just can't rate-limit them.
- **Credentials:** Auto-provisioned by Vercel — no manual setup once you've created the KV store in the Vercel dashboard.
- **Cost:** Included with the Vercel plan up to a usage limit we are nowhere near.

### Vapi — AI voice agent (planned, not active)
- **What:** Will power Salome, the voice receptionist that picks up calls and books appointments. See Flow D above.
- **Status:** Environment variable is reserved (`VAPI_API_KEY`), but **no code currently calls Vapi**. The integration is on the roadmap.
- **Credentials:** `VAPI_API_KEY` placeholder in `.env.local`.
- **Cost:** Per-call pricing on Vapi; the exact tier we'd land on depends on call volume.

### DIDWW — Georgian phone numbers
- **What:** Provides the actual Georgian phone numbers that route incoming calls to our voice booking system. Each business that opts into Salome will get a dedicated number.
- **Status:** In use today by the standalone n8n voice booking POC. Will be re-pointed at Vapi once Salome is built.
- **Credentials:** Managed in the DIDWW dashboard, not in our codebase.
- **Cost:** Per-number, per-month from DIDWW.

### n8n — voice booking POC (being replaced)
- **What:** A separate workflow automation tool currently running the voice booking proof-of-concept against Google Calendar. **It is not part of the Rigify codebase.** It's an external tool we wired up to test the concept.
- **Status:** Live but tactical. The plan is to replace it with the native Salome / Vapi integration described above. Once that lands, n8n can be retired.
- **Credentials:** Managed in n8n's own dashboard.
- **Cost:** n8n's own pricing tier (cloud-hosted).

### GitHub — source control & CI
- **What:** Holds the code, manages pull requests, runs the test suite on every push via GitHub Actions.
- **Status:** Live. Repo: `github.com/Gioshaov/rigify`.
- **Credentials:** Individual developer accounts; access controlled by repo collaborator list.
- **Cost:** Free (private repo on the free tier, since the team is small).

### Google Fonts — typography
- **What:** Provides two fonts used everywhere — Hanken Grotesk (the main text and UI font) and JetBrains Mono (for any code or technical text). Plus Material Symbols for some icons.
- **Status:** Live. Pulled in by Next.js's built-in Google Fonts loader.
- **Cost:** Free.

### What we **don't** use (yet)
- **No payment processor.** No Stripe, no local Georgian payment provider. All bookings are free. When monetization starts, this is the first integration we'll need.
- **No SMS provider.** Notifications are email-only. No Twilio, no Vonage.
- **No analytics.** No Mixpanel, Amplitude, GA4, or Vercel Analytics. If we want to track conversion funnels or page views, we'll need to add one.
- **No error monitoring.** No Sentry, no Bugsnag. Server errors show up only in Vercel's deployment logs.
- **No CRM.** Leads from the contact form go into our database (`contact_messages` table) and are read manually in the Supabase dashboard. No HubSpot or Pipedrive sync.
- **No social login.** Customers and business owners sign in with email + password only.

---

## 6. How the platform fits together

Here's the data flow when a customer books an appointment:

```
┌──────────────────────────────────────────────────────────────────┐
│ Customer's browser                                               │
│   ↓                                                              │
│ Vercel (CDN + SSL + serverless functions)                        │
│   ↓                                                              │
│ Next.js app                                                      │
│   • Middleware checks: is the user logged in? what domain are    │
│     they on (rigify.ge vs admin.rigify.ge)? refresh session.     │
│   • Server-rendered page or server action runs                   │
│   • Calls Supabase to read available time slots                  │
│   ↓                                                              │
│ Supabase                                                         │
│   • PostgreSQL checks Row-Level Security policies — confirms     │
│     this user is allowed to read this data                       │
│   • Returns business / service / staff / availability            │
│   ↓                                                              │
│ Next.js renders the booking dialog                               │
│                                                                  │
│ Customer picks a slot, clicks Confirm                            │
│   ↓                                                              │
│ Server action runs:                                              │
│   • Re-checks availability (no one snuck in)                     │
│   • Writes the booking row to Supabase                           │
│   • Calls Resend to send 2 emails (customer + business)          │
│   ↓                                                              │
│ Customer sees confirmation page                                  │
└──────────────────────────────────────────────────────────────────┘
```

A few load-bearing concepts worth understanding:

- **Server vs browser.** A lot of our code runs on the server (inside a Vercel serverless function) and the browser just receives finished HTML. This is faster for the user, better for search engines, and lets us hide secrets like the Supabase service-role key. Some interactive bits (the calendar picker, the toast notifications) run in the browser.

- **Row-Level Security (RLS).** Postgres enforces who can see what at the database level, not just the application level. A customer can't see another customer's bookings even if our application code has a bug, because Postgres itself refuses. Every table we have has RLS policies.

- **Server actions.** A modern Next.js pattern that lets a form on the website call a server function directly without us writing a manual API endpoint. We use server actions for almost every form submission (register, edit profile, create appointment).

- **Middleware.** A small piece of code that runs on **every** request before the page does. We use it for two things: refresh the user's login session so it doesn't expire mid-session, and route the admin subdomain (`admin.rigify.ge`) to a different part of the app.

### The admin subdomain
The super admin panel lives on `admin.rigify.ge` — a separate subdomain — but it's the same codebase. Middleware detects the subdomain and routes everything to `/admin/*` routes. Customer-facing requests on `rigify.ge` are blocked from those routes. This isolation means an admin link can never accidentally show up on the customer marketplace and vice versa.

### Production vs staging
Everything has a staging twin:
- **rigify.ge** (production) ↔ **staging.rigify.ge**
- Production Supabase project ↔ Staging Supabase project (separate database, separate users)
- Two long-lived git branches: `master` deploys to production, `staging` deploys to staging.

### How a change gets to production
1. Engineer creates a `feature/...` branch locally and makes the change.
2. They open a pull request into `staging`. Code review + the test suite run.
3. Merged into `staging` → deploys automatically to `staging.rigify.ge`. The team verifies it works on staging.
4. A second pull request promotes `staging` → `master`. Once merged, production deploys.

This two-step gate means production never gets a change that hasn't been seen working on staging first.

---

## 7. Key files & directories

The 30 most important files / directories in the project. Grouped by purpose, not by directory tree.

### Product surface (pages the user sees)
- **`app/page.tsx`** — the homepage at `rigify.ge`
- **`app/businesses/page.tsx`** — the directory / search page (`/businesses`)
- **`app/businesses/[slug]/page.tsx`** — a business's public profile page
- **`app/booking/confirmed/page.tsx`** — the post-booking confirmation page
- **`app/customer/dashboard/page.tsx`** — the logged-in customer's "my bookings" view
- **`app/dashboard/page.tsx`** — the business owner's main dashboard
- **`app/staff-dashboard/page.tsx`** — the staff member's personal schedule
- **`app/admin/(auth-required)/page.tsx`** — the super admin's platform overview
- **`app/for-businesses/page.tsx`** — the "pitch" page for prospective business owners

### Authentication & request routing
- **`middleware.ts`** — runs on every request; detects the admin subdomain and routes accordingly
- **`lib/supabase/middleware.ts`** — refreshes the login session on every page load
- **`lib/supabase/server.ts`** — Supabase clients used by server-side code (one normal, one admin)
- **`lib/supabase/client.ts`** — the Supabase client used in the browser

### Business logic (the load-bearing utilities)
- **`lib/utils/availability.ts`** — the overlap-detection function that prevents double bookings. This is the heart of booking correctness.
- **`lib/utils/datetime.ts`** — Tbilisi-timezone formatting helpers (everything is stored in UTC, shown in UTC+4)
- **`lib/bookings/get-confirmation.ts`** — fetches the booking confirmation details

### Email
- **`lib/emails/resend.ts`** — the Resend API wrapper
- **`lib/emails/send.ts`** — the actual send-an-email helper
- **`lib/emails/templates/`** — the four email templates: customer confirmation, business confirmation, cancellation, reschedule

### API endpoints (called by the browser or future external systems)
- **`app/api/availability/route.ts`** — returns the open time slots for a staff member on a given day
- **`app/api/bookings/route.ts`** — creates / cancels bookings
- **`app/api/contact/route.ts`** — accepts contact-form submissions, rate-limited via Vercel KV
- **`app/api/services/[id]/route.ts`** — returns the details of a single service
- **`app/api/admin/verify-password/route.ts`** — admin password verification
- **`app/api/admin/logout/route.ts`** — admin logout

### Database
- **`supabase/migrations/`** — every change to the database schema, ever. 52 migration files as of 2026-06-28. This is the source of truth for what tables and columns exist.
- **`supabase/reset-data.sql`** — the destructive utility to wipe all data except super-admin users. Has three safety guards (a confirm flag, a database-name check, and a refusal to run if no super admin exists).

### Configuration
- **`next.config.mjs`** — Next.js configuration
- **`tailwind.config.ts`** — Tailwind CSS theme (colors, spacing, z-index scale)
- **`.env.local`** — local development environment variables (not in git)
- **`.env.staging.example`** — the template that documents which environment variables the staging deployment needs

### Documentation
- **`CLAUDE.md`** — the engineer-facing operations doc (rules, conventions, gotchas)
- **`UI_GUIDE.md`** — the design system (colors, components, accessibility)
- **`TESTING.md`** — how to write and run the Playwright tests
- **`STAGING.md`** — how staging is set up and how to keep it healthy
- **`ADMIN_SETUP.md`** — how the admin subdomain is configured
- **`RESEND_SETUP.md`** — the email setup walk-through
- **`LATEST_SESSION.md`** — the always-current status of what's built and what's next
- **`SESSION_HISTORY.md`** — the chronological log of every development session

### Test infrastructure
- **`tests/e2e/`** — Playwright tests, grouped by feature (auth, booking, business, dashboard, admin)
- **`tests/setup/seed-test-data.ts`** — creates the predictable test data before tests run
- **`tests/utils/`** — test helpers (login flows, unique-phone generator, DB cleanup)

---

## 8. What's built vs what's planned

This is a snapshot at **2026-06-28**. For the always-current state, read `LATEST_SESSION.md`.

### Built and live

**Marketplace**
- Public homepage with hero, six category tiles, Tbilisi / Batumi / Kutaisi regional rollout
- Directory page with list view, map view, and split view (all three persisted between visits)
- Filters by city, category, rating
- "Near Me" geolocation sort
- Business profile page (description, services, staff, reviews, location map)
- Booking dialog (pick staff, date, time → confirm)
- Confirmation page

**Customer experience**
- Customer registration and login
- Customer dashboard with upcoming / past bookings
- View, reschedule, and cancel a booking
- One-time free emergency cancel within 24h of an appointment
- Profile edit (name, phone, email, avatar)
- Email confirmations / reschedules / cancellations via Resend (live since 2026-06-18)

**Business owner experience**
- Business owner login + dashboard
- Today's schedule with stats
- Appointments list (filterable, with manual create and reschedule)
- Service management (create, edit, deactivate)
- Staff directory with invite flow (auto-creates staff login)
- Business settings (name, address, hours, cover image, logo)
- Salome status page (placeholder — backend not built)

**Staff experience**
- Personal schedule and stats dashboard

**Super admin experience**
- Platform-wide KPI dashboard
- Onboard-new-business wizard (creates business + owner + optional staff in one flow)
- Browse / edit every business
- Browse / edit every customer
- Browse / edit / reschedule / cancel / create every booking (with advanced filters by status, source, business, date)
- Audit log of admin actions

**Marketing pages**
- About, For Businesses, Contact (form rate-limited via Vercel KV), Help, Terms of Service, Privacy Policy

**Infrastructure**
- Production and staging environments (separate Supabase projects, separate Vercel deployments)
- Row-Level Security on all database tables, with grants to the right roles
- Playwright end-to-end test suite covering critical flows, running on every push
- Realtime customer-channel updates (the database can push customer-row changes to a connected browser — wired but not deeply used in the UI yet)

**Polish**
- Error boundaries on all major routes
- Loading skeletons on data-heavy pages
- Custom 404 page
- Password-strength meter on signup
- Reusable accessible Modal, ConfirmDialog, and Toast components
- Favicons and a basic PWA manifest
- Georgian / English language toggle (persists in browser)
- WCAG AA-compliant color contrast across the site

### Built but rough / partly polished
- **Mobile bottom nav on dashboards** — needs to be extracted into a shared component
- **Inline field validation** — most forms validate on submit; the goal is to validate on field blur with inline error messages (one form has this; the rest don't)
- **Edge-to-edge mobile** — viewport safe-area insets were attempted and rolled back; needs a proper pass
- **Admin subdomain DNS** — `admin.rigify.ge` is supported in code but the actual DNS record / Vercel domain may still need to be added

### Planned, not built
- **Salome AI voice receptionist** — Vapi integration, per-business agent provisioning, API endpoints for availability and booking creation
- **Instagram & Facebook DM bots** — same conversational booking experience, but through social DMs
- **Recurring appointments** — weekly / monthly bookings
- **Service packages** — bundle multiple services with a single price
- **Gift cards** — purchase and redeem
- **Analytics dashboard** for business owners — booking trends, revenue charts, customer insights
- **Payment processor** — Stripe or a local Georgian provider, for deposits, full prepayment, or subscription billing
- **OAuth login** — Google and Apple sign-in for customers

### Pre-launch checklist
- Promote the most recent `staging` → `master` (this is the standard deploy step; we did several in late June 2026)
- Remove the `SITE_PASSWORD` gate before opening the site to the public (it was added to keep staging private; it would lock real visitors out of production if left on)

---

## A few last notes

**Where to find the always-current truth**

| Question | Where to look |
|---|---|
| What was done in the last session? | `LATEST_SESSION.md` |
| What's the full history of changes? | `SESSION_HISTORY.md` or `git log` |
| What does table X look like in the database? | `supabase/migrations/` (newest file wins) |
| What environment variables does staging need? | `.env.staging.example` |
| What are the engineering rules? | `CLAUDE.md` |
| How do I set up production email? | `RESEND_SETUP.md` |

**The cost picture (high level)**

We have paid plans on Vercel and Supabase. Everything else is on free tiers comfortably. The next major cost addition will be **whichever AI voice plan we land on for Salome** — that's per-call and scales with adoption. Email and maps will only start costing real money at significantly higher booking volume than we have today.

**Two things worth knowing as a non-engineer**

1. We **cannot lose customer data without effort.** Supabase takes automatic backups; the destructive reset-data script has three layers of safety guards; staging and production are isolated databases that don't share rows.

2. We can **roll back a bad production deploy in seconds.** Vercel keeps every prior deployment alive — if a release breaks production, we promote the previous deployment back to production from the Vercel dashboard. No database changes are reverted by this — but the code-related "the site is broken" kind of incident is fixable immediately.
