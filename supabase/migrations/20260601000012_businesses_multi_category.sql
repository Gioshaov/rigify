-- businesses_multi_category: Support multiple categories per business
-- Creates a junction table for many-to-many relationship between businesses and categories

create table if not exists public.business_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  category_id text not null check (category_id in ('hair', 'nails', 'skin', 'massage', 'brows', 'makeup', 'barber')),
  created_at timestamptz default now(),
  unique(business_id, category_id)
);

create index if not exists idx_business_categories_business on public.business_categories(business_id);
create index if not exists idx_business_categories_category on public.business_categories(category_id);

-- Grants
grant select, insert, delete on public.business_categories to authenticated;
grant select on public.business_categories to anon;
grant all privileges on public.business_categories to service_role;

-- RLS
alter table public.business_categories enable row level security;

-- Public can read business categories
drop policy if exists "business_categories_public_select" on public.business_categories;
create policy "business_categories_public_select"
  on public.business_categories for select
  using (true);

-- Business owners can manage their own business categories
drop policy if exists "business_categories_owner_write" on public.business_categories;
create policy "business_categories_owner_write"
  on public.business_categories for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_categories.business_id
      and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_categories.business_id
      and b.owner_id = auth.uid()
    )
  );

-- Make phone required in businesses table
do $$
begin
  -- Check if phone column exists and is nullable
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'businesses'
    and column_name = 'phone'
    and is_nullable = 'YES'
  ) then
    -- We can't make it NOT NULL yet because existing rows might have null values
    -- This will be enforced in the application layer for new registrations
    null;
  end if;
end $$;

comment on table public.business_categories is 'Junction table for business-category many-to-many relationship';
comment on column public.businesses.phone is 'Phone number - required for new registrations';
