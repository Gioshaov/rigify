-- Add emergency cancellation flag to bookings table
-- Allows ONE cancellation within 24h of appointment as grace period

alter table public.bookings
add column if not exists has_used_emergency_cancel boolean not null default false;

-- Add comment explaining the column
comment on column public.bookings.has_used_emergency_cancel is
'Tracks if customer has used their one-time emergency cancellation within 24h. Once true, strict 24h policy applies.';
