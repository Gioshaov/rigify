-- Migration: Make staff_id NOT NULL in bookings table
-- Date: 2026-06-17
-- Purpose: Prevent NULL staff_id values which bypass the exclusion constraint
--          (PostgreSQL: NULL = NULL evaluates to NULL, not TRUE, so constraint doesn't fire)

-- Step 1: Update existing NULL staff_id bookings to assign a staff member
-- Strategy: For each business, find the first active staff member and assign it
update public.bookings
set staff_id = (
  select s.id
  from public.staff s
  where s.business_id = bookings.business_id
    and s.is_active = true
  order by s.created_at asc
  limit 1
)
where staff_id is null
  and status != 'cancelled'
  and exists (
    select 1
    from public.staff s
    where s.business_id = bookings.business_id
      and s.is_active = true
  );

-- Step 2: For bookings still NULL (businesses with no active staff), try ANY staff member
update public.bookings
set staff_id = (
  select s.id
  from public.staff s
  where s.business_id = bookings.business_id
  order by s.is_active desc, s.created_at asc
  limit 1
)
where staff_id is null
  and exists (
    select 1
    from public.staff s
    where s.business_id = bookings.business_id
  );

-- Step 3: Delete orphaned bookings with NULL staff_id
-- These are invalid bookings (business has no staff at all, or business doesn't exist)
-- Cannot be fulfilled, so safe to delete
delete from public.bookings
where staff_id is null;

-- Step 4: Add NOT NULL constraint
-- All valid bookings now have staff_id assigned
alter table public.bookings
  alter column staff_id set not null;

-- Comment explaining the constraint
comment on column public.bookings.staff_id is 'Staff member assigned to this booking. NOT NULL ensures exclusion constraint (bookings_no_staff_overlap) works correctly - PostgreSQL NULL = NULL returns NULL, not TRUE, so NULL values would bypass overlap prevention.';
