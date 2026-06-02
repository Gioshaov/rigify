-- Migration: Remove self-registration, add admin onboarding
-- Date: 2026-06-02
-- Purpose: Add subdomain support, leads table, and admin-gated onboarding

-- Add subdomain support to businesses
alter table public.businesses
  add column if not exists subdomain text unique,
  add column if not exists status text default 'active',
  add column if not exists onboarded_by uuid references auth.users(id);

-- Index for subdomain lookups (middleware hits this on every request)
create index if not exists businesses_subdomain_idx on public.businesses(subdomain);

-- Leads table for contact form submissions from /for-businesses
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text not null,
  phone text not null,
  city text,
  message text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger for updated_at
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- RLS: Super admins can manage businesses
alter table public.businesses enable row level security;

drop policy if exists "businesses_super_admin" on public.businesses;
create policy "businesses_super_admin"
  on public.businesses
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true)
  with check ((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true);

-- RLS: Only super admins can access leads
alter table public.leads enable row level security;

create policy "leads_admin_only"
  on public.leads
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true)
  with check ((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true);

-- Grants
grant all on public.businesses to authenticated, service_role;
grant insert on public.leads to anon;
grant all on public.leads to service_role;
