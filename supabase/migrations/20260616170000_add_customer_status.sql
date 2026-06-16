-- Add status column to customers table
alter table public.customers
add column if not exists status text default 'active' check (status in ('active', 'suspended'));

-- Create index for filtering by status
create index if not exists customers_status_idx on public.customers(status);

-- Update existing customers to have 'active' status
update public.customers set status = 'active' where status is null;
