-- Add composite index for "Any Staff" availability queries
-- The booking API queries: SELECT id FROM staff WHERE business_id = ? AND is_active = true
-- This index optimizes that query

create index if not exists idx_staff_business_active
  on public.staff(business_id, is_active)
  where is_active = true;
