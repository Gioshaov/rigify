-- staff_users: Add authentication for staff members
-- Allows staff to login and access a permission-based dashboard

-- Add user_id column to staff table for authentication
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'staff'
    and column_name = 'user_id'
  ) then
    alter table public.staff
      add column user_id uuid references auth.users(id) on delete set null,
      add column role text default 'staff' check (role in ('staff', 'manager'));

    alter table public.staff
      add constraint staff_user_id_unique unique(user_id);

    create index if not exists idx_staff_user_id on public.staff(user_id);
  end if;
end $$;

-- Staff permissions table: define what each role can access
create table if not exists public.staff_permissions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.staff(id) on delete cascade not null unique,
  can_view_appointments boolean default true,
  can_edit_appointments boolean default true,
  can_view_customers boolean default true,
  can_view_services boolean default true,
  can_edit_services boolean default false,
  can_view_staff boolean default true,
  can_edit_staff boolean default false,
  can_view_settings boolean default false,
  can_edit_settings boolean default false,
  can_view_salome boolean default false,
  can_edit_salome boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_staff_permissions_staff on public.staff_permissions(staff_id);

-- Default permissions for new staff
create or replace function public.create_default_staff_permissions() returns trigger as $$
begin
  insert into public.staff_permissions (
    staff_id,
    can_view_appointments,
    can_edit_appointments,
    can_view_customers,
    can_view_services
  ) values (
    new.id,
    true,
    true,
    true,
    true
  ) on conflict (staff_id) do nothing;
  return new;
end;
$$ language plpgsql;

drop trigger if exists staff_create_permissions on public.staff;
create trigger staff_create_permissions
  after insert on public.staff
  for each row execute function public.create_default_staff_permissions();

-- Grants
grant select, insert, update, delete on public.staff_permissions to authenticated;
grant select on public.staff_permissions to anon;
grant all privileges on public.staff_permissions to service_role;

-- RLS for staff_permissions
alter table public.staff_permissions enable row level security;

-- Business owners can manage staff permissions
drop policy if exists "staff_permissions_owner" on public.staff_permissions;
create policy "staff_permissions_owner"
  on public.staff_permissions for all
  using (
    exists (
      select 1 from public.staff s
      join public.businesses b on s.business_id = b.id
      where s.id = staff_permissions.staff_id
      and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.staff s
      join public.businesses b on s.business_id = b.id
      where s.id = staff_permissions.staff_id
      and b.owner_id = auth.uid()
    )
  );

-- Staff can read their own permissions
drop policy if exists "staff_permissions_self_read" on public.staff_permissions;
create policy "staff_permissions_self_read"
  on public.staff_permissions for select
  using (
    exists (
      select 1 from public.staff s
      where s.id = staff_permissions.staff_id
      and s.user_id = auth.uid()
    )
  );

-- Update staff RLS policies
-- Staff can read their own staff record
drop policy if exists "staff_self_select" on public.staff;
create policy "staff_self_select"
  on public.staff for select
  using (
    user_id = auth.uid()
    or is_active = true
    or exists (select 1 from public.businesses b where b.id = staff.business_id and b.owner_id = auth.uid())
  );

-- Staff can view bookings for their business
drop policy if exists "bookings_staff_select" on public.bookings;
create policy "bookings_staff_select"
  on public.bookings for select
  using (
    exists (
      select 1 from public.staff s
      where s.business_id = bookings.business_id
      and s.user_id = auth.uid()
      and s.is_active = true
    )
  );

-- Staff can update bookings if they have permission
drop policy if exists "bookings_staff_update" on public.bookings;
create policy "bookings_staff_update"
  on public.bookings for update
  using (
    exists (
      select 1 from public.staff s
      join public.staff_permissions sp on sp.staff_id = s.id
      where s.business_id = bookings.business_id
      and s.user_id = auth.uid()
      and s.is_active = true
      and sp.can_edit_appointments = true
    )
  )
  with check (
    exists (
      select 1 from public.staff s
      join public.staff_permissions sp on sp.staff_id = s.id
      where s.business_id = bookings.business_id
      and s.user_id = auth.uid()
      and s.is_active = true
      and sp.can_edit_appointments = true
    )
  );

comment on table public.staff_permissions is 'Role-based permissions for staff members';
comment on column public.staff.user_id is 'Links staff to auth.users for login functionality';
comment on column public.staff.role is 'Staff role: staff (basic) or manager (elevated permissions)';
