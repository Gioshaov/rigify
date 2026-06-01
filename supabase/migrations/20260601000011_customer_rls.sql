-- RLS policies for customers table
alter table public.customers enable row level security;

-- customers: users can read and update their own profile only
drop policy if exists "customers_own_select" on public.customers;
create policy "customers_own_select"
  on public.customers for select
  using (id = auth.uid());

drop policy if exists "customers_own_update" on public.customers;
create policy "customers_own_update"
  on public.customers for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- customers_own_insert: allow authenticated users to create their profile
-- (used during registration)
drop policy if exists "customers_own_insert" on public.customers;
create policy "customers_own_insert"
  on public.customers for insert
  with check (id = auth.uid());

-- Update bookings RLS to allow customers to see their own bookings
-- Customers can read bookings where:
-- 1. customer_id matches their auth.uid() (authenticated booking)
-- 2. OR customer_email matches their email in customers table (guest booking they made before registering)
drop policy if exists "bookings_customer_select" on public.bookings;
create policy "bookings_customer_select"
  on public.bookings for select
  using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.customers c
      where c.id = auth.uid()
      and bookings.customer_email = c.email
    )
  );

-- Customers can update their own bookings (e.g., cancel)
drop policy if exists "bookings_customer_update" on public.bookings;
create policy "bookings_customer_update"
  on public.bookings for update
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
