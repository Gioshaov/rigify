-- Fix RLS policy contradiction
-- Previous: required status = 'pending' but CHECK constraint doesn't allow pending
-- Fix: Remove status restriction since API uses admin client anyway
-- Keep customer_id ownership validation

drop policy if exists "bookings_insert_public" on public.bookings;
create policy "bookings_insert_public"
  on public.bookings for insert
  to anon, authenticated
  with check (
    -- If authenticated, customer_id must match auth.uid() or be null
    auth.role() = 'anon'
    or customer_id = auth.uid()
    or customer_id is null
  );
