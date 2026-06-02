-- Migration: Add missing grants for staff table
-- Date: 2026-06-02
-- Purpose: Fix staff creation issue - service role needs explicit grants

-- Grant permissions on staff table
grant select, insert, update, delete on public.staff to authenticated;
grant select on public.staff to anon;
grant all privileges on public.staff to service_role;

comment on table public.staff is 'Staff members of businesses - requires explicit grants for all operations';
