-- Enable Supabase Realtime for customers table
-- Required for useEmergencyCancelFlag hook to receive real-time updates
-- Prevents multi-tab race condition where user could use emergency cancel multiple times

-- Enable row-level replication identity (required for postgres_changes filters)
alter table public.customers replica identity full;

-- Add customers table to supabase_realtime publication
-- This allows client-side subscriptions to receive UPDATE events
alter publication supabase_realtime add table public.customers;

-- Add comment explaining the purpose
comment on table public.customers is
'Customer profiles. Realtime enabled for emergency cancel flag synchronization across browser tabs.';
