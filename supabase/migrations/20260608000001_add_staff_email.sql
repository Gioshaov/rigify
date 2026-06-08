-- Add email field to staff table
alter table public.staff
  add column if not exists email text;

-- Add index for email lookups
create index if not exists idx_staff_email on public.staff(email);

-- Add comment
comment on column public.staff.email is 'Staff member email address for contact and notifications';
