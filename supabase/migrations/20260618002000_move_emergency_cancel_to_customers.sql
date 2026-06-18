-- Move emergency cancellation flag from bookings to customers table
-- One emergency cancel per customer (across ALL bookings), not per booking

-- Remove from bookings (was incorrectly placed there)
alter table public.bookings
drop column if exists has_used_emergency_cancel;

-- Add to customers (correct location - one per customer lifetime)
alter table public.customers
add column if not exists has_used_emergency_cancel boolean not null default false;

-- Add comment explaining the column
comment on column public.customers.has_used_emergency_cancel is
'Tracks if customer has used their one-time emergency cancellation within 24h across ALL bookings. Once true, strict 24h policy applies forever.';

-- Create index for fast lookups during cancellation
create index if not exists idx_customers_emergency_cancel
on public.customers(id, has_used_emergency_cancel)
where has_used_emergency_cancel = false;
