-- performance_indexes: Add composite indexes for frequently used query patterns
-- Improves performance for customer and business dashboard queries

-- Composite index for customer dashboard queries
-- Supports: WHERE customer_id = X ORDER BY appointment_datetime
create index if not exists idx_bookings_customer_datetime
  on public.bookings (customer_id, appointment_datetime)
  where customer_id is not null;

-- Composite index for business dashboard queries
-- Supports: WHERE business_id = X AND appointment_datetime BETWEEN start AND end
create index if not exists idx_bookings_business_datetime
  on public.bookings (business_id, appointment_datetime);

-- Note: These indexes allow the database to perform index-only scans
-- (filter + sort in one operation) rather than using separate index + sort steps.
