-- Add email column to staff table
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'staff'
    and column_name = 'email'
  ) then
    alter table public.staff add column email text;
  end if;
end $$;

comment on column public.staff.email is 'Staff member email address (synced with auth.users)';
