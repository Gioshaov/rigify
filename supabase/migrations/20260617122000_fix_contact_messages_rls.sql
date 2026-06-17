-- Migration: Fix contact_messages RLS - add missing insert policy
-- Date: 2026-06-17
-- Purpose: Allow anonymous submissions (RLS was blocking all inserts)

-- Add insert policy for anonymous users
drop policy if exists "contact_messages_anon_insert" on public.contact_messages;
create policy "contact_messages_anon_insert"
  on public.contact_messages
  for insert
  to anon
  with check (true);
