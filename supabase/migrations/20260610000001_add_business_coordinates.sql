-- Add latitude and longitude to businesses table
alter table public.businesses
  add column if not exists latitude numeric(10, 8),
  add column if not exists longitude numeric(11, 8);

-- Index for spatial queries (optional, for future optimization)
create index if not exists idx_businesses_coordinates
  on public.businesses (latitude, longitude)
  where latitude is not null and longitude is not null;

-- Documentation
comment on column public.businesses.latitude is 'Latitude (-90 to 90, required for new businesses)';
comment on column public.businesses.longitude is 'Longitude (-180 to 180, required for new businesses)';
