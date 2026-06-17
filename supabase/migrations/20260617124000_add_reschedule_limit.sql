-- Migration: Add reschedule limit tracking
-- Date: 2026-06-17
-- Purpose: Track number of times a booking has been rescheduled (limit: 3)

-- Add reschedule_count column to bookings
alter table public.bookings
  add column if not exists reschedule_count integer default 0 check (reschedule_count >= 0);

-- Create index for reschedule count queries
create index if not exists bookings_reschedule_count_idx on public.bookings(reschedule_count);

-- Comment explaining the limit
comment on column public.bookings.reschedule_count is 'Number of times this booking has been rescheduled. Maximum allowed: 3';
