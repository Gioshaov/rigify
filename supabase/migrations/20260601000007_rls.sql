-- Row Level Security: enforce ownership at the database layer (spec §Notes)
alter table public.businesses    enable row level security;
alter table public.services      enable row level security;
alter table public.staff         enable row level security;
alter table public.bookings      enable row level security;
alter table public.reviews       enable row level security;
alter table public.subscriptions enable row level security;

-- businesses: public read of active businesses; owner-only writes
drop policy if exists "businesses_public_select" on public.businesses;
create policy "businesses_public_select"
  on public.businesses for select
  using (is_active = true or owner_id = auth.uid());

drop policy if exists "businesses_owner_insert" on public.businesses;
create policy "businesses_owner_insert"
  on public.businesses for insert
  with check (owner_id = auth.uid());

drop policy if exists "businesses_owner_update" on public.businesses;
create policy "businesses_owner_update"
  on public.businesses for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "businesses_owner_delete" on public.businesses;
create policy "businesses_owner_delete"
  on public.businesses for delete
  using (owner_id = auth.uid());

-- services: public read; owner of parent business writes
drop policy if exists "services_public_select" on public.services;
create policy "services_public_select"
  on public.services for select
  using (
    is_active = true
    or exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid())
  );

drop policy if exists "services_owner_write" on public.services;
create policy "services_owner_write"
  on public.services for all
  using (exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid()));

-- staff: public read; owner of parent business writes
drop policy if exists "staff_public_select" on public.staff;
create policy "staff_public_select"
  on public.staff for select
  using (
    is_active = true
    or exists (select 1 from public.businesses b where b.id = staff.business_id and b.owner_id = auth.uid())
  );

drop policy if exists "staff_owner_write" on public.staff;
create policy "staff_owner_write"
  on public.staff for all
  using (exists (select 1 from public.businesses b where b.id = staff.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = staff.business_id and b.owner_id = auth.uid()));

-- bookings: NO public read (customer privacy). Owner of business_id reads.
-- Inserts go through API routes using the service role (which bypasses RLS).
drop policy if exists "bookings_owner_select" on public.bookings;
create policy "bookings_owner_select"
  on public.bookings for select
  using (exists (select 1 from public.businesses b where b.id = bookings.business_id and b.owner_id = auth.uid()));

drop policy if exists "bookings_owner_update" on public.bookings;
create policy "bookings_owner_update"
  on public.bookings for update
  using (exists (select 1 from public.businesses b where b.id = bookings.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = bookings.business_id and b.owner_id = auth.uid()));

drop policy if exists "bookings_owner_delete" on public.bookings;
create policy "bookings_owner_delete"
  on public.bookings for delete
  using (exists (select 1 from public.businesses b where b.id = bookings.business_id and b.owner_id = auth.uid()));

-- reviews: public read; insert only when the referenced booking is completed for that business
drop policy if exists "reviews_public_select" on public.reviews;
create policy "reviews_public_select"
  on public.reviews for select
  using (true);

drop policy if exists "reviews_authenticated_insert" on public.reviews;
create policy "reviews_authenticated_insert"
  on public.reviews for insert
  with check (
    booking_id is null
    or exists (
      select 1 from public.bookings bk
       where bk.id = reviews.booking_id
         and bk.business_id = reviews.business_id
         and bk.status = 'completed'
    )
  );

-- subscriptions: owner-only read/write
drop policy if exists "subscriptions_owner_all" on public.subscriptions;
create policy "subscriptions_owner_all"
  on public.subscriptions for all
  using (exists (select 1 from public.businesses b where b.id = subscriptions.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = subscriptions.business_id and b.owner_id = auth.uid()));
