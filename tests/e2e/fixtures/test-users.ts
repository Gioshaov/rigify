// Test user credentials
// IMPORTANT: These users must be created via seed script before tests run
export const TEST_USERS = {
  businessOwner: {
    email: 'playwright-owner@rigify.test',
    password: 'TestPassword123!',
    dashboardPath: '/dashboard'
  },
  customer: {
    email: 'playwright-customer@rigify.test',
    password: 'TestPassword123!',
    dashboardPath: '/customer/dashboard'
  },
  staff: {
    email: 'playwright-staff@rigify.test',
    password: 'TestPassword123!',
    dashboardPath: '/staff-dashboard'
  },
  superAdmin: {
    email: 'admin@rigify.test',
    password: 'AdminPassword123!',
    dashboardPath: '/admin'
  }
};

export const GUEST_CUSTOMER_DATA = {
  name: 'Playwright Test User',
  phone: '599999999', // Will be overridden with unique phone in tests
  email: 'playwright-guest@rigify.test'
};
