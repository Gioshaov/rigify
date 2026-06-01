-- services offered by a business
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  name_ka text,
  name_ru text,
  description text,
  category text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_min numeric(10,2) not null check (price_min >= 0),
  price_max numeric(10,2) check (price_max is null or price_max >= price_min),
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
