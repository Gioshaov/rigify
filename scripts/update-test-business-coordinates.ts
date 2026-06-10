import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Realistic coordinates for different Tbilisi neighborhoods
 * Each coordinate is roughly placed in a different area to spread across the city
 */
const TBILISI_COORDINATES = [
  // Vake (upscale neighborhood, western Tbilisi)
  { latitude: 41.7131, longitude: 44.7686, area: 'Vake' },

  // Saburtalo (university district, northwest)
  { latitude: 41.7233, longitude: 44.7523, area: 'Saburtalo' },

  // Rustaveli Avenue (downtown, central)
  { latitude: 41.6938, longitude: 44.8015, area: 'Rustaveli' },

  // Old Tbilisi (historic center, east)
  { latitude: 41.6919, longitude: 44.8091, area: 'Old Tbilisi' },

  // Vera (central residential area)
  { latitude: 41.7037, longitude: 44.7852, area: 'Vera' },

  // Mtatsminda (hilltop neighborhood)
  { latitude: 41.6963, longitude: 44.7918, area: 'Mtatsminda' },

  // Didube (northern Tbilisi)
  { latitude: 41.7321, longitude: 44.7732, area: 'Didube' },

  // Isani (eastern Tbilisi)
  { latitude: 41.6912, longitude: 44.8321, area: 'Isani' },

  // Gldani (northern suburbs)
  { latitude: 41.7512, longitude: 44.7988, area: 'Gldani' },
];

async function updateTestBusinessCoordinates() {
  console.log('🗺️  Updating test business coordinates...\n');

  // Get all test businesses
  const { data: businesses, error: fetchError } = await adminClient
    .from('businesses')
    .select('id, name, district')
    .eq('is_test', true)
    .order('name');

  if (fetchError) {
    throw new Error(`Failed to fetch test businesses: ${fetchError.message}`);
  }

  if (!businesses || businesses.length === 0) {
    console.log('⚠️  No test businesses found. Run npm run seed:test first.');
    return;
  }

  console.log(`Found ${businesses.length} test business(es)\n`);

  // Update each business with coordinates
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
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

// Run if called directly
if (require.main === module) {
  updateTestBusinessCoordinates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Update failed:', err);
      process.exit(1);
    });
}

export { updateTestBusinessCoordinates };
