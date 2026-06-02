-- Migration: Fix staff RLS policy data leak
-- Date: 2026-06-02
-- Purpose: Remove "is_active = true" arm that leaked all active staff across all businesses

-- The original staff_self_select policy allowed ANY authenticated user to see ALL active staff
-- across ALL businesses. This migration fixes it to only allow:
-- 1. Staff reading their own record (user_id = auth.uid())
-- 2. Business owner reading their staff (via business ownership check)

drop policy if exists "staff_self_select" on public.staff;

create policy "staff_self_select"
  on public.staff for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.businesses b
      where b.id = staff.business_id
      and b.owner_id = auth.uid()
    )
  );

comment on policy "staff_self_select" on public.staff is 'Staff can read their own record; business owners can read their staff only';
