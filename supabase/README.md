# Supabase setup

Two paths — pick one.

## Path A — Hosted Supabase + SQL Editor (fastest)

1. Create a project at https://supabase.com/dashboard.
2. Copy the URL + anon key + service-role key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Open the SQL Editor and run each file in `supabase/migrations/` **in numerical order**:
   - `20260601000001_businesses.sql`
   - `20260601000002_services.sql`
   - `20260601000003_staff.sql`
   - `20260601000004_bookings.sql`
   - `20260601000005_reviews.sql`
   - `20260601000006_subscriptions.sql`
   - `20260601000007_rls.sql`
   - `20260601000008_indexes.sql`
4. Run `supabase/seed.sql` to insert the Mitte Beauty demo business.
5. Register at `/register`, then claim Mitte with the UPDATE statement at the bottom of `seed.sql`.

## Path B — Local Supabase CLI

```bash
npm install -g supabase
supabase init
supabase start
supabase db reset  # applies migrations + seed.sql automatically
```

The local Studio is at http://localhost:54323. Keys come from `supabase status`.

## Schema notes

- All datetimes are stored in UTC. Display in Asia/Tbilisi via `date-fns-tz`.
- `bookings.end_datetime` is filled automatically by the `bookings_compute_end` trigger — do **not** set it from application code.
- `businesses.rating` and `review_count` are kept in sync by the `reviews_recompute_rating` trigger.
- RLS is enforced at the database level. Voice/web booking creation uses the service-role key to bypass RLS (the endpoint validates `business_id` itself).
