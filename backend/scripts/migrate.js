/**
 * Applies pending SQL migrations to the database in DATABASE_URL.
 *
 *   node scripts/migrate.js                  apply pending migrations
 *   node scripts/migrate.js --baseline 022   mark files through 022 as applied
 *                                            without running them (once per
 *                                            database migrated by hand before)
 */
// Must load before db.js: ES imports are hoisted, and the pool reads
// DATABASE_URL when it is constructed.
import 'dotenv/config';
import pool from '../src/db/db.js';
import { runMigrations, baselineMigrations } from '../src/db/migrate.js';

const args = process.argv.slice(2);
const baselineIndex = args.indexOf('--baseline');

try {
  console.log(`Target database host: ${new URL(process.env.DATABASE_URL).host}`);
  if (baselineIndex === -1) {
    await runMigrations();
  } else {
    const upTo = args[baselineIndex + 1];
    if (!/^\d{3}$/.test(upTo ?? '')) throw new Error('--baseline needs a 3-digit number, e.g. 022');
    await baselineMigrations({ upTo });
  }
} catch (error) {
  console.error(`Migration run failed: ${error.message || error.code || error}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
