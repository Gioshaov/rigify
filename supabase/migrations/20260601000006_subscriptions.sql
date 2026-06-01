-- subscriptions: a business's plan + add-on state
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  plan text not null check (plan in ('starter', 'growth', 'clinic')),
  status text default 'trial' check (status in ('trial', 'active', 'cancelled', 'expired')),
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  salome_enabled boolean default false,
  salome_plan text check (salome_plan is null or salome_plan in ('basic', 'standard')),
  languages text[] default array['ka']::text[],
  monthly_call_limit integer,
  calls_this_month integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
