import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Realistic coordinates for different Tbilisi neighborhoods
 * Spread across the city to avoid clustering
 */
const TBILISI_COORDINATES = [
  { latitude: 41.7131, longitude: 44.7686, area: 'Vake' },
  { latitude: 41.7233, longitude: 44.7523, area: 'Saburtalo' },
  { latitude: 41.6938, longitude: 44.8015, area: 'Rustaveli' },
  { latitude: 41.6919, longitude: 44.8091, area: 'Old Tbilisi' },
  { latitude: 41.7037, longitude: 44.7852, area: 'Vera' },
  { latitude: 41.6963, longitude: 44.7918, area: 'Mtatsminda' },
  { latitude: 41.7321, longitude: 44.7732, area: 'Didube' },
  { latitude: 41.6912, longitude: 44.8321, area: 'Isani' },
  { latitude: 41.7512, longitude: 44.7988, area: 'Gldani' },
];

async function updateAllBusinessCoordinates() {
  console.log('🗺️  Updating all business coordinates...\n');

  // Get all businesses without coordinates (except ones that already have them)
  const { data: businesses, error: fetchError } = await adminClient
    .from('businesses')
    .select('id, name, latitude, longitude')
    .order('name');

  if (fetchError) {
    throw new Error(`Failed to fetch businesses: ${fetchError.message}`);
  }

  if (!businesses || businesses.length === 0) {
    console.log('⚠️  No businesses found.');
    return;
  }

  // Filter businesses without coordinates
  const businessesNeedingCoords = businesses.filter(
    b => b.latitude === null || b.longitude === null
  );

  console.log(`Found ${businesses.length} total businesses`);
  console.log(`${businessesNeedingCoords.length} need coordinates\n`);

  if (businessesNeedingCoords.length === 0) {
    console.log('✅ All businesses already have coordinates!');
    return;
  }

  // Update each business with coordinates
  for (let i = 0; i < businessesNeedingCoords.length; i++) {
    const business = businessesNeedingCoords[i];
    const coords = TBILISI_COORDINATES[i % TBILISI_COORDINATES.length];

    const { error: updateError } = await adminClient
      .from('businesses')
      .update({
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      .eq('id', business.id);

    if (updateError) {
      console.error(`❌ Failed to update ${business.name}: ${updateError.message}`);
    } else {
      console.log(
        `✓ ${business.name}\n` +
        `  → ${coords.area} (${coords.latitude}, ${coords.longitude})`
      );
    }
  }

  console.log('\n✅ Coordinate updates complete');
}

if (require.main === module) {
  updateAllBusinessCoordinates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Update failed:', err);
      process.exit(1);
    });
}

export { updateAllBusinessCoordinates };
