-- Audit Logs Table
-- Tracks all admin actions for security and compliance
-- Immutable: admins cannot delete their own logs

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  admin_email text not null,
  action text not null, -- 'create', 'update', 'delete', 'suspend', 'restore', 'login', etc.
  resource_type text not null, -- 'business', 'customer', 'staff', 'booking', 'review', 'admin', etc.
  resource_id uuid,
  resource_name text,
  details jsonb, -- before/after values, additional context
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Indexes for efficient querying
create index if not exists audit_logs_admin_user_id_idx on public.audit_logs(admin_user_id);
create index if not exists audit_logs_resource_idx on public.audit_logs(resource_type, resource_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs(action);

-- Enable Row Level Security
alter table public.audit_logs enable row level security;

-- RLS Policies
-- Super admins can read all logs
create policy "audit_logs_super_admin_read"
  on public.audit_logs for select
  using ((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true);

-- Only service role can insert (via server actions using createAdminClient)
-- This policy blocks direct inserts - only service role bypasses RLS
create policy "audit_logs_service_insert"
  on public.audit_logs for insert
  with check (false);

-- No update or delete policies - logs are immutable
-- Super admins cannot delete audit logs (even their own)

-- Grant permissions
grant select on public.audit_logs to authenticated;
grant all privileges on public.audit_logs to service_role;

-- Add comment
comment on table public.audit_logs is 'Immutable audit trail of all admin actions for security and compliance';
