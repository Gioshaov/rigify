-- Migration: Add RPC function for operating cities count
-- Date: 2026-06-17
-- Purpose: Efficient count of distinct cities where businesses operate

create or replace function public.get_operating_cities_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct city)
  from public.businesses
  where status = 'active';
$$;

-- Grant execute permission
grant execute on function public.get_operating_cities_count() to authenticated, service_role;
