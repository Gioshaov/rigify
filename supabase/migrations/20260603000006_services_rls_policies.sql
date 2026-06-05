-- Enable RLS on services table
alter table public.services enable row level security;

-- Grant permissions
grant select, insert, update, delete on public.services to authenticated;
grant select on public.services to anon;
grant all privileges on public.services to service_role;

-- Business owners can manage their own services
drop policy if exists "services_owner_all" on public.services;
create policy "services_owner_all"
  on public.services for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = services.business_id
      and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = services.business_id
      and b.owner_id = auth.uid()
    )
  );

-- Public can view active services
drop policy if exists "services_public_select" on public.services;
create policy "services_public_select"
  on public.services for select
  using (is_active = true);

comment on table public.services is 'Services offered by businesses';
