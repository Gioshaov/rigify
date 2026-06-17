-- Migration: Prevent overlapping bookings with database constraint
-- Date: 2026-06-17
-- Purpose: Fix race condition in reschedule - enforce non-overlapping bookings at DB level

-- Enable btree_gist extension (required for exclusion constraints with timestamp ranges)
create extension if not exists btree_gist;

-- Add exclusion constraint to prevent overlapping bookings for same staff
-- Uses GiST index with range overlap operator (&&)
-- Excludes cancelled bookings from the constraint
alter table public.bookings
  drop constraint if exists bookings_no_staff_overlap;

alter table public.bookings
  add constraint bookings_no_staff_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(appointment_datetime, end_datetime) with &&
  )
  where (status != 'cancelled');

-- Note: This constraint prevents the race condition in rescheduleBooking()
-- Two concurrent requests cannot both insert/update to create overlapping bookings
-- PostgreSQL will reject the second transaction with a constraint violation error
