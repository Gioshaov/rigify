import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Combines every migration in supabase/migrations/ (in chronological order)
 * into a single SQL file you can paste into the SQL Editor of a fresh
 * Supabase project — e.g. when bootstrapping the schema for staging.
 *
 * All migrations are idempotent (create ... if not exists, drop policy
 * before create, etc.), so running the combined file against an empty
 * project applies the full schema in one shot.
 *
 * Usage:
 *   npm run build:staging-sql
 *
 * Output: supabase/_staging_bootstrap.sql (gitignored)
 * Then: open the staging project's SQL Editor → paste → Run.
 */

const MIGRATIONS_DIR = resolve(__dirname, '../supabase/migrations');
const OUTPUT_FILE = resolve(__dirname, '../supabase/_staging_bootstrap.sql');

function main() {
  let files: string[];
  try {
    files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort(); // timestamp-prefixed → lexicographic sort == chronological
  } catch (err) {
    console.error(`Could not read migrations directory: ${MIGRATIONS_DIR}`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('No .sql migrations found in', MIGRATIONS_DIR);
    process.exit(1);
  }

  const parts: string[] = [
    '-- =====================================================================',
    '-- Rigify staging bootstrap — combined migrations',
    `-- Generated from ${files.length} migration files in supabase/migrations/`,
    '-- Paste this whole file into the staging project SQL Editor and Run.',
    '-- Safe to re-run: every migration is idempotent.',
    '-- =====================================================================',
    '',
  ];

  for (const file of files) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), 'utf8');
    parts.push(
      '',
      `-- ---------------------------------------------------------------------`,
      `-- ${file}`,
      `-- ---------------------------------------------------------------------`,
      sql.trim(),
      ''
    );
  }

  writeFileSync(OUTPUT_FILE, parts.join('\n'), 'utf8');
  console.log(`Combined ${files.length} migrations →`);
  console.log(`  ${OUTPUT_FILE}`);
  console.log('\nNext: open the staging Supabase SQL Editor, paste the file, Run.');
}

main();
