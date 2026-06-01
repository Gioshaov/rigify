-- guest_booking_validation: Ensure guest bookings have email or phone
-- Guest bookings (customer_id is null) must provide at least one contact method

-- Add constraint: guest bookings must have email or phone
alter table public.bookings
  drop constraint if exists bookings_guest_contact_required;

alter table public.bookings
  add constraint bookings_guest_contact_required
  check (
    customer_id is not null
    or customer_email is not null
    or customer_phone is not null
  );

comment on constraint bookings_guest_contact_required on public.bookings is
  'Guest bookings (customer_id is null) must provide email or phone number for contact';
