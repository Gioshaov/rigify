-- Migration: Sync is_active with status field for existing businesses
-- Date: 2026-06-02
-- Purpose: Fix businesses that have status='inactive' but is_active=true

-- Update all businesses to sync is_active with status
UPDATE businesses
SET is_active = (status = 'active')
WHERE is_active != (status = 'active');

-- Log the changes
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Synced is_active for % businesses', updated_count;
END $$;

comment on column businesses.is_active is 'Boolean flag synced with status field. Updated automatically by admin edit action.';
