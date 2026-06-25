-- Fix: "permission denied for table reviews" (and subscriptions)
--
-- These two tables had RLS policies but never received table-level GRANTs.
-- PostgreSQL checks GRANT permissions BEFORE evaluating RLS, so any query
-- touching them (e.g. the customer bookings query joins `reviews!left(id)`)
-- fails with "permission denied for table reviews" even though the
-- reviews_public_select policy would allow the read.
--
-- This mirrors the explicit-grant pattern already applied to businesses,
-- services, staff, bookings, customers and business_categories.

-- reviews: public read (matches reviews_public_select USING (true));
-- authenticated customers can insert (matches reviews_authenticated_insert).
grant select on public.reviews to anon;
grant select, insert on public.reviews to authenticated;
grant all privileges on public.reviews to service_role;

-- subscriptions: owner-only, no anon access (matches subscriptions_owner_all).
grant select, insert, update, delete on public.subscriptions to authenticated;
grant all privileges on public.subscriptions to service_role;
