-- Fix RLS policy to use correct name and ensure test businesses are excluded
drop policy if exists "businesses_public_read" on public.businesses;
drop policy if exists "businesses_public_select" on public.businesses;

create policy "businesses_public_select"
  on public.businesses for select
  using (
    is_active = true
    and (is_test = false or is_test is null) -- Exclude test businesses from public
  );
