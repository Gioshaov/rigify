-- Add RLS policy for super admins to read all customers
-- Super admins need to view all customer data in the admin panel

drop policy if exists "customers_super_admin_select" on public.customers;
create policy "customers_super_admin_select"
  on public.customers for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
  );
