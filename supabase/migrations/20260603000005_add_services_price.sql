-- Add price column to services table for simple pricing
-- Keep price_min/price_max for future price range support
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'services'
    and column_name = 'price'
  ) then
    alter table public.services add column price numeric(10,2) check (price >= 0);
  end if;
end $$;

-- Backfill: set price = price_min for existing services
update public.services
set price = price_min
where price is null;

comment on column public.services.price is 'Standard price for the service (used in booking flow)';
