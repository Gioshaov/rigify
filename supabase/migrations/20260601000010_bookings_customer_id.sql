-- Add customer_id to bookings to support authenticated customer bookings
-- customer_id is nullable - null means guest booking (existing behavior)
-- When customer_id is set, the booking is linked to a customer account

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'bookings'
    and column_name = 'customer_id'
  ) then
    alter table public.bookings
      add column customer_id uuid references public.customers(id) on delete set null;

    create index if not exists idx_bookings_customer on public.bookings (customer_id);
  end if;
end $$;
