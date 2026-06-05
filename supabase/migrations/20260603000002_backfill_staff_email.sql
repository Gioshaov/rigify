-- Backfill email for existing staff members from auth.users
update public.staff s
set email = u.email
from auth.users u
where s.user_id = u.id
and s.email is null;

comment on column public.staff.email is 'Staff member email address (synced with auth.users)';
