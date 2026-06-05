-- Fix overly permissive booking INSERT policy
-- Previous: with check (true) allowed anyone to insert with any business_id, status, customer_id
-- Fix: Restrict to pending status only, validate customer_id ownership

drop policy if exists "bookings_insert_public" on public.bookings;
create policy "bookings_insert_public"
  on public.bookings for insert
  to anon, authenticated
  with check (
    -- Must be pending status (confirmed bookings go through admin API)
    status = 'pending'
    -- If authenticated, customer_id must be own auth.uid() or null
    and (
      auth.role() = 'anon'
      or customer_id = auth.uid()
      or customer_id is null
    )
  );
