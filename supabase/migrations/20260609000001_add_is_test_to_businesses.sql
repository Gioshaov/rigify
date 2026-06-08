-- Add is_test flag to mark test businesses (prevents them from appearing in production)
alter table public.businesses add column if not exists is_test boolean default false;

-- Index for efficient filtering
create index if not exists businesses_is_test_idx
  on public.businesses(is_test)
  where is_test = true;

-- Update RLS policies to exclude test businesses from public views
drop policy if exists "businesses_public_select" on public.businesses;
drop policy if exists "businesses_public_read" on public.businesses;
create policy "businesses_public_select"
  on public.businesses for select
  using (
    is_active = true
    and (is_test = false or is_test is null) -- Exclude test businesses from public
  );

comment on column public.businesses.is_test is
  'Marks test businesses for E2E testing - never shown in production queries';
