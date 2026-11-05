import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from './db.js';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

// Arbitrary constant shared by every runner so concurrent runs queue up.
const ADVISORY_LOCK_KEY = 727_001;

function listMigrationFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

async function withLock(db, work) {
  const client = await db.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_KEY]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    return await work(client);
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]);
    } finally {
      client.release();
    }
  }
}

async function readApplied(client) {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((row) => row.filename));
}

/**
 * Applies every migration file that is not yet recorded in `schema_migrations`,
 * in filename order. Each file runs in its own transaction together with its
 * tracking row, so a failure leaves that file fully unapplied and stops the run.
 * Returns the filenames applied.
 */
export async function runMigrations({ db = pool, dir = MIGRATIONS_DIR, log = console.log } = {}) {
  return withLock(db, async (client) => {
    const applied = await readApplied(client);
    const pending = listMigrationFiles(dir).filter((name) => !applied.has(name));
    const done = [];

    for (const name of pending) {
      const sql = fs.readFileSync(path.join(dir, name), 'utf8');
      log(`Applying ${name}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [name]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      done.push(name);
    }

    if (done.length === 0) log('No pending migrations');
    return done;
  });
}

/**
 * Records every file numbered up to and including `upTo` (e.g. "021") as
 * applied without executing it. For databases migrated by hand before the
 * runner existed. Refuses to run once the database tracks any migration.
 */
export async function baselineMigrations({ db = pool, dir = MIGRATIONS_DIR, upTo, log = console.log }) {
  return withLock(db, async (client) => {
    const files = listMigrationFiles(dir);
    const cutoff = files.findIndex((name) => name.startsWith(`${upTo}_`));
    if (cutoff === -1) throw new Error(`No migration file numbered ${upTo}`);

    if ((await readApplied(client)).size > 0) {
      throw new Error('schema_migrations already has entries; refusing to baseline');
    }

    const baselined = files.slice(0, cutoff + 1);
    await client.query('BEGIN');
    try {
      for (const name of baselined) {
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [name]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    log(`Baselined ${baselined.length} migrations through ${baselined.at(-1)}`);
    return baselined;
  });
}
