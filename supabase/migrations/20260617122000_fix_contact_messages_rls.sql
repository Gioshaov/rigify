-- Migration: Fix contact_messages RLS - add missing insert policy
-- Date: 2026-06-17
-- Purpose: Allow submissions from both anonymous and authenticated users

-- Add insert policy for anonymous users
drop policy if exists "contact_messages_anon_insert" on public.contact_messages;
create policy "contact_messages_anon_insert"
  on public.contact_messages
  for insert
  to anon
  with check (true);

-- Add insert policy for authenticated users (customers/admins can also use contact form)
drop policy if exists "contact_messages_authenticated_insert" on public.contact_messages;
create policy "contact_messages_authenticated_insert"
  on public.contact_messages
  for insert
  to authenticated
  with check (true);
