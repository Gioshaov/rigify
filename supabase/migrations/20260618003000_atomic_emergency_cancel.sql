-- Atomic emergency cancellation function
-- Prevents double-spend: ensures only ONE booking can use emergency cancel per customer
--
-- LOCK ORDER: customers first, then bookings
-- All functions touching both tables MUST follow this order to prevent deadlocks

-- Create function that performs atomic emergency cancel check + booking update + flag set
create or replace function public.cancel_booking_with_emergency_check(
  p_booking_id uuid,
  p_customer_id uuid
)
returns table(
  success boolean,
  error_code text,
  error_message text
)
language plpgsql
security definer -- Run with elevated privileges to bypass RLS
as $$
declare
  v_booking record;
  v_customer record;
  v_hours_until_appointment numeric;
  v_is_within_24h boolean;
begin
  -- Lock the customer row to prevent concurrent modifications (LOCK ORDER: customers first)
  select has_used_emergency_cancel
  into v_customer
  from public.customers
  where id = p_customer_id
  for update; -- Row-level lock on customer row

  if not found then
    return query select false, 'CUSTOMER_NOT_FOUND'::text, 'Customer profile not found'::text;
    return;
  end if;

  -- Fetch and lock the booking (LOCK ORDER: after customers)
  select id, customer_id, appointment_datetime, status
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update; -- Row-level lock on booking row

  if not found then
    return query select false, 'BOOKING_NOT_FOUND'::text, 'Booking not found'::text;
    return;
  end if;

  -- Verify ownership
  if v_booking.customer_id != p_customer_id then
    return query select false, 'UNAUTHORIZED'::text, 'Unauthorized'::text;
    return;
  end if;

  -- Check if already cancelled
  if v_booking.status = 'cancelled' then
    return query select false, 'ALREADY_CANCELLED'::text, 'Booking already cancelled'::text;
    return;
  end if;

  -- Check if booking is in the past
  if v_booking.appointment_datetime < now() then
    return query select false, 'PAST_BOOKING'::text, 'Cannot cancel past bookings'::text;
    return;
  end if;

  -- Calculate hours until appointment
  v_hours_until_appointment := extract(epoch from (v_booking.appointment_datetime - now())) / 3600;
  v_is_within_24h := v_hours_until_appointment < 24;

  -- If within 24h, check emergency cancel flag (atomic with locks held)
  if v_is_within_24h then
    if v_customer.has_used_emergency_cancel then
      return query select
        false,
        'EMERGENCY_USED'::text,
        'Cannot cancel within 24 hours of appointment. You have already used your one-time emergency cancellation. Please contact the business directly if you need to cancel.'::text;
      return;
    end if;
  end if;

  -- All checks passed: cancel the booking
  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id;

  -- If within 24h, mark emergency cancel as used (atomic within same transaction)
  if v_is_within_24h then
    update public.customers
    set has_used_emergency_cancel = true
    where id = p_customer_id;
  end if;

  -- Return success
  return query select true, null::text, null::text;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.cancel_booking_with_emergency_check(uuid, uuid) to authenticated;

-- Add comment explaining the function
comment on function public.cancel_booking_with_emergency_check(uuid, uuid) is
'Atomically cancels a booking with emergency cancellation policy enforcement. Uses row locks to prevent race conditions.';
