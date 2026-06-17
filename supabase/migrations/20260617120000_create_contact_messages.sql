-- Migration: Create contact_messages table for general inquiries
-- Date: 2026-06-17
-- Purpose: Store messages from /contact page (different from business leads)

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger for updated_at
drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

-- Index for status filtering
create index if not exists contact_messages_status_idx on public.contact_messages(status);
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

-- RLS: Only super admins can read messages
alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_admin_only" on public.contact_messages;
create policy "contact_messages_admin_only"
  on public.contact_messages
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true);

-- Grants
grant insert on public.contact_messages to anon;  -- Allow anonymous submission
grant all on public.contact_messages to service_role;  -- Service role full access
