import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export async function cleanupTestBookings(customerPhone: string) {
  await adminClient
    .from('bookings')
    .delete()
    .eq('customer_phone', customerPhone);
}

export async function getTestBusiness() {
  const { data } = await adminClient
    .from('businesses')
    .select('id, slug, name')
    .eq('is_test', true) // Only get test businesses
    .eq('is_active', true)
    .limit(1)
    .single();
  return data;
}

export async function getTestService(businessId: string) {
  const { data } = await adminClient
    .from('services')
    .select('id, name, duration_minutes, price_min')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .limit(1)
    .single();
  return data;
}
