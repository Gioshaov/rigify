-- Indexes tuned for the marketplace's query patterns
create index if not exists idx_businesses_city_category on public.businesses (city, category) where is_active = true;
create index if not exists idx_businesses_owner on public.businesses (owner_id);
create index if not exists idx_businesses_slug on public.businesses (slug);

create index if not exists idx_services_business on public.services (business_id) where is_active = true;

create index if not exists idx_staff_business on public.staff (business_id) where is_active = true;

create index if not exists idx_bookings_business_staff_dt on public.bookings (business_id, staff_id, appointment_datetime);
create index if not exists idx_bookings_end_dt on public.bookings (end_datetime);
create index if not exists idx_bookings_status on public.bookings (business_id, status);

create index if not exists idx_reviews_business on public.reviews (business_id);
