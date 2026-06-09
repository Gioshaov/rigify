-- Add 'dashboard' to allowed booking_source values
-- Cannot modify existing constraint in-place, must drop and recreate

alter table public.bookings
  drop constraint bookings_booking_source_check;

alter table public.bookings
  add constraint bookings_booking_source_check
    check (booking_source in ('web', 'voice', 'instagram', 'facebook', 'dashboard'));
