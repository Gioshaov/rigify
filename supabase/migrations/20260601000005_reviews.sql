-- reviews left by customers for businesses
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  booking_id uuid references public.bookings(id),
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- keep businesses.rating + review_count in sync
create or replace function public.recompute_business_rating() returns trigger as $$
declare
  target_business uuid;
begin
  target_business := coalesce(new.business_id, old.business_id);
  update public.businesses
     set rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where business_id = target_business), 0),
         review_count = (select count(*) from public.reviews where business_id = target_business)
   where id = target_business;
  return null;
end;
$$ language plpgsql;

drop trigger if exists reviews_recompute_rating on public.reviews;
create trigger reviews_recompute_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_business_rating();
