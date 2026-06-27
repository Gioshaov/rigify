-- Reset all data except super-admin user(s).
--
-- Super admin = auth.users where raw_app_meta_data ->> 'is_super_admin' = 'true'.
--
-- DESTRUCTIVE. Wraps everything in a single transaction; any failure rolls back.
--
-- Usage:
--   psql "$DATABASE_URL" \
--     -v ON_ERROR_STOP=1 \
--     -v confirm=YES \
--     -v expect_db=postgres \
--     -f supabase/reset-data.sql
--
-- Refuses to run unless:
--   1. -v confirm=YES is passed                (typo / muscle-memory guard)
--   2. -v expect_db matches current_database() (wrong-target guard)
--   3. at least one super-admin user exists    (lockout guard)
--
-- Cascade map this script relies on:
--   auth.users    → businesses (owner_id, CASCADE)
--                 → customers  (id,       CASCADE)
--                 → staff.user_id, audit_logs.admin_user_id (SET NULL)
--   businesses    → services, staff, bookings, reviews, subscriptions,
--                   business_categories                    (all CASCADE)
--   staff         → staff_permissions                      (CASCADE)
--   customers     → bookings.customer_id                   (SET NULL)
--
-- Standalone tables (no FK to businesses/users): leads, contact_messages.

\set ON_ERROR_STOP on

\if :{?confirm}
\else
  \warn 'ABORT: missing -v confirm=YES'
  \warn 'Re-run with: -v confirm=YES -v expect_db=<db_name>'
  \quit
\endif

\if :{?expect_db}
\else
  \warn 'ABORT: missing -v expect_db=<db_name>'
  \quit
\endif

BEGIN;

DO $preflight$
DECLARE
  v_current_db  text := current_database();
  v_expect_db   text := :'expect_db';
  v_confirm     text := :'confirm';
  v_super_count int;
BEGIN
  IF v_confirm <> 'YES' THEN
    RAISE EXCEPTION 'ABORT: confirm flag is %, expected YES', v_confirm;
  END IF;

  IF v_current_db <> v_expect_db THEN
    RAISE EXCEPTION 'ABORT: connected to db %, expected %', v_current_db, v_expect_db;
  END IF;

  SELECT count(*) INTO v_super_count
  FROM auth.users
  WHERE (raw_app_meta_data ->> 'is_super_admin')::boolean IS TRUE;

  IF v_super_count = 0 THEN
    RAISE EXCEPTION 'ABORT: no super-admin user found — refusing to delete all users';
  END IF;

  RAISE NOTICE 'Preflight OK — db=%, super_admins=%', v_current_db, v_super_count;
END
$preflight$;

-- Delete businesses first so cascades clear services/staff/bookings/reviews/
-- subscriptions/business_categories/staff_permissions before we touch users.
DELETE FROM public.businesses;
DELETE FROM public.customers;
DELETE FROM public.leads;
DELETE FROM public.contact_messages;

-- Prune audit_logs from non-super-admin actors. Done before deleting users so
-- we filter on admin_user_id directly rather than relying on the SET NULL
-- cascade and then chasing orphans.
DELETE FROM public.audit_logs
WHERE admin_user_id NOT IN (
  SELECT id FROM auth.users
  WHERE (raw_app_meta_data ->> 'is_super_admin')::boolean IS TRUE
);

DELETE FROM auth.users
WHERE (raw_app_meta_data ->> 'is_super_admin')::boolean IS NOT TRUE;

-- Post-reset verification (super-admin row(s) should be the only auth.users left).
SELECT 'businesses'       AS table_name, count(*) AS remaining FROM public.businesses
UNION ALL SELECT 'customers',        count(*) FROM public.customers
UNION ALL SELECT 'bookings',         count(*) FROM public.bookings
UNION ALL SELECT 'services',         count(*) FROM public.services
UNION ALL SELECT 'staff',            count(*) FROM public.staff
UNION ALL SELECT 'reviews',          count(*) FROM public.reviews
UNION ALL SELECT 'subscriptions',    count(*) FROM public.subscriptions
UNION ALL SELECT 'leads',            count(*) FROM public.leads
UNION ALL SELECT 'contact_messages', count(*) FROM public.contact_messages
UNION ALL SELECT 'audit_logs',       count(*) FROM public.audit_logs
UNION ALL SELECT 'auth.users',       count(*) FROM auth.users
ORDER BY table_name;

COMMIT;
