-- businesses: top-level merchant record
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  slug text unique not null,
  name text not null,
  name_ka text,
  name_ru text,
  description text,
  description_ka text,
  description_ru text,
  category text not null,
  city text not null,
  district text,
  address text not null,
  address_ka text,
  phone text,
  email text,
  website text,
  instagram text,
  cover_image_url text,
  logo_url text,
  hours jsonb,
  is_active boolean default true,
  salome_enabled boolean default false,
  salome_phone text,
  vapi_agent_id text,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();
