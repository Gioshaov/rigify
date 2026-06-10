import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkBusinesses() {
  const { data: allBusinesses } = await adminClient
    .from('businesses')
    .select('id, name, is_test, latitude, longitude')
    .order('name');

  console.log('\n📊 All Businesses:\n');
  console.log(`Total: ${allBusinesses?.length || 0}\n`);

  allBusinesses?.forEach((b, i) => {
    const hasCoords = b.latitude && b.longitude;
    const testFlag = b.is_test ? '[TEST]' : '';
    const coordStatus = hasCoords ? `✓ (${b.latitude}, ${b.longitude})` : '✗ No coords';
    console.log(`${i + 1}. ${b.name} ${testFlag}\n   ${coordStatus}`);
  });
}

checkBusinesses().then(() => process.exit(0));
