-- bookings: appointments scheduled with a business + staff
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  service_id uuid references public.services(id),
  staff_id uuid references public.staff(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  appointment_datetime timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  end_datetime timestamptz not null,
  status text default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed', 'no_show')),
  booking_source text not null check (booking_source in ('web', 'voice', 'instagram', 'facebook')),
  call_id text,
  notes text,
  price numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.bookings_set_end_datetime() returns trigger as $$
begin
  new.end_datetime := new.appointment_datetime + (new.duration_minutes * interval '1 minute');
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists bookings_compute_end on public.bookings;
create trigger bookings_compute_end
  before insert or update on public.bookings
  for each row execute function public.bookings_set_end_datetime();
