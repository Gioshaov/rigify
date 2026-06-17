-- Fix the RLS policy for super admins to use correct JWT path
-- The previous migration used auth.jwt()->>'is_super_admin' which is wrong
-- Should be auth.jwt() -> 'app_metadata' ->> 'is_super_admin'

drop policy if exists "customers_super_admin_select" on public.customers;
create policy "customers_super_admin_select"
  on public.customers for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
  );
