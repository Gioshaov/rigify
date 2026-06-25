import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load env (SUPABASE_ACCESS_TOKEN). Prefer .env.staging.local, fall back to .env.local.
config({ path: resolve(__dirname, '../.env.staging.local') });
config({ path: resolve(__dirname, '../.env.local') });

/**
 * Applies supabase/staging-seed.sql to the STAGING Supabase project via the
 * Management API query endpoint.
 *
 * Safety: refuses to run against the production project ref. Override the
 * target with STAGING_SUPABASE_PROJECT_REF if the staging project changes.
 *
 * Requires: SUPABASE_ACCESS_TOKEN (personal token from
 *   https://supabase.com/dashboard/account/tokens)
 */

const STAGING_REF = process.env.STAGING_SUPABASE_PROJECT_REF || 'ccjteappgctnlwrmzokp';
const PRODUCTION_REF = 'zipxmghbougztwdtzftn';
const SEED_FILE = resolve(__dirname, '../supabase/staging-seed.sql');

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN. Add it to .env.local or .env.staging.local.');
    console.error('Get one at https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  if (STAGING_REF === PRODUCTION_REF) {
    console.error(`Refusing to seed: target ref ${STAGING_REF} is the PRODUCTION project.`);
    console.error('This seed deletes and re-inserts mock rows and must never touch production.');
    process.exit(1);
  }

  const query = readFileSync(SEED_FILE, 'utf8');
  console.log(`Seeding staging project ${STAGING_REF} (${query.length} chars of SQL)...`);

  const res = await fetch(`https://api.supabase.com/v1/projects/${STAGING_REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    console.error(`Seed failed: HTTP ${res.status}`);
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log('Seed applied. Row counts:');
  if (Array.isArray(body)) {
    for (const row of body) console.log(`  ${row.t}: ${row.count}`);
  }
}

main();
