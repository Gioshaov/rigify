-- Add grants and RLS policies for bookings table

-- Enable RLS
alter table public.bookings enable row level security;

-- Grant permissions
grant select, insert, update, delete on public.bookings to authenticated;
grant select, insert on public.bookings to anon;
grant all privileges on public.bookings to service_role;

-- RLS Policies

-- Anyone (including guests) can create bookings
drop policy if exists "bookings_insert_public" on public.bookings;
create policy "bookings_insert_public"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

-- Authenticated users can view their own bookings (if customer_id is set)
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select
  to authenticated
  using (customer_id = auth.uid());

-- Business owners can view bookings for their business
drop policy if exists "bookings_select_business" on public.bookings;
create policy "bookings_select_business"
  on public.bookings for select
  to authenticated
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- Business owners can update bookings for their business
drop policy if exists "bookings_update_business" on public.bookings;
create policy "bookings_update_business"
  on public.bookings for update
  to authenticated
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- Customers can cancel their own bookings
drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own"
  on public.bookings for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
