import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../../.env.local') });

import { adminClient } from '../utils/db-helpers';
import { TEST_USERS } from '../e2e/fixtures/test-users';

/**
 * Seeds test data for Playwright tests
 * Idempotent - safe to run multiple times
 */
export async function seedTestData() {
  console.log('🌱 Seeding test data...');

  // 1. Create test business owner (idempotent check)
  let ownerId: string;
  const { data: existingOwner } = await adminClient.auth.admin.listUsers({ perPage: 1000, page: 1 });
  const ownerUser = existingOwner.users.find(u => u.email === TEST_USERS.businessOwner.email);

  if (ownerUser) {
    console.log('  ✓ Business owner already exists');
    ownerId = ownerUser.id;
  } else {
    const { data: ownerAuth, error } = await adminClient.auth.admin.createUser({
      email: TEST_USERS.businessOwner.email,
      password: TEST_USERS.businessOwner.password,
      email_confirm: true,
    });

    if (error) throw new Error(`Failed to create owner: ${error.message}`);
    ownerId = ownerAuth.user!.id;
    console.log('  ✓ Created business owner');
  }

  // 2. Create test business (idempotent)
  // First, check if there are any duplicates and clean them up
  const { data: existingBusinesses } = await adminClient
    .from('businesses')
    .select('id')
    .eq('slug', 'playwright-test-salon');

  if (existingBusinesses && existingBusinesses.length > 1) {
    // Keep only the first one, delete the rest
    const idsToDelete = existingBusinesses.slice(1).map(b => b.id);
    await adminClient.from('businesses').delete().in('id', idsToDelete);
    console.log(`  🧹 Cleaned up ${idsToDelete.length} duplicate test businesses`);
  }

  const { data: existingBusiness } = await adminClient
    .from('businesses')
    .select('id')
    .eq('slug', 'playwright-test-salon')
    .limit(1)
    .maybeSingle();

  if (!existingBusiness) {
    const { data: newBusiness, error: insertError } = await adminClient
      .from('businesses')
      .insert({
        owner_id: ownerId,
        name: 'Playwright Test Salon',
        slug: 'playwright-test-salon',
        category: 'hair',
        city: 'tbilisi',
        district: 'vake',
        address: '123 Test Street',
        phone: '599000000',
        is_active: true,
        is_test: true, // CRITICAL: Mark as test business
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create test business: ${insertError.message}`);
    }
    console.log('  ✓ Created test business');
  } else {
    console.log('  ✓ Test business already exists');
  }

  // 3. Create test service
  // Get the business again (should be unique now after cleanup)
  const { data: allBusinesses } = await adminClient
    .from('businesses')
    .select('id')
    .eq('slug', 'playwright-test-salon');

  if (!allBusinesses || allBusinesses.length === 0) {
    throw new Error('Failed to find test business after creation');
  }

  const business = allBusinesses[0];

  const { data: existingService } = await adminClient
    .from('services')
    .select('id')
    .eq('business_id', business.id)
    .eq('name', 'Test Haircut Service')
    .maybeSingle();

  if (!existingService) {
    await adminClient.from('services').insert({
      business_id: business.id,
      name: 'Test Haircut Service',
      description: 'A test service for E2E testing',
      category: 'hair',
      duration_minutes: 45,
      price_min: 50,
      price_max: 50,
      is_active: true,
    });
    console.log('  ✓ Created test service');
  } else {
    console.log('  ✓ Test service already exists');
  }

  // 4. Create test customer (idempotent)
  const customerUser = existingOwner?.users.find(u => u.email === TEST_USERS.customer.email);
  let customerId: string;

  if (customerUser) {
    console.log('  ✓ Customer already exists');
    customerId = customerUser.id;
  } else {
    const { data: customerAuth, error } = await adminClient.auth.admin.createUser({
      email: TEST_USERS.customer.email,
      password: TEST_USERS.customer.password,
      email_confirm: true,
    });

    if (error) throw new Error(`Failed to create customer: ${error.message}`);
    customerId = customerAuth.user!.id;
    console.log('  ✓ Created customer user');
  }

  // Create customer profile
  const { data: existingCustomerProfile } = await adminClient
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .maybeSingle();

  if (!existingCustomerProfile) {
    await adminClient.from('customers').insert({
      id: customerId,
      name: 'Playwright Test Customer',
      phone: '599111111',
      email: TEST_USERS.customer.email,
    });
    console.log('  ✓ Created customer profile');
  } else {
    console.log('  ✓ Customer profile already exists');
  }

  console.log('✅ Test data seeding complete\n');
}

/**
 * Cleanup old test bookings (keeps database clean)
 */
export async function cleanupOldTestBookings() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: testBusiness } = await adminClient
    .from('businesses')
    .select('id')
    .eq('is_test', true)
    .single();

  if (testBusiness) {
    const { count } = await adminClient
      .from('bookings')
      .delete()
      .eq('business_id', testBusiness.id)
      .lt('created_at', threeDaysAgo.toISOString());

    console.log(`🧹 Cleaned up ${count || 0} old test bookings`);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData()
    .then(() => cleanupOldTestBookings())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
