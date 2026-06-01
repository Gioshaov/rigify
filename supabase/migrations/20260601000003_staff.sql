-- staff members of a business
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  name_ka text,
  specialty text,
  specialty_ka text,
  bio text,
  avatar_url text,
  calendar_id text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
