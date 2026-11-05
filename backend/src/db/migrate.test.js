import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runMigrations, baselineMigrations } from './migrate.js';

// Fake Postgres that enforces the rules the runner depends on: the tracking
// table's primary key, transactional rollback of both tracking rows and the
// tables a migration creates, and CREATE TABLE failing when the table already
// exists (so re-running an applied migration fails like it does in production).
// Migration bodies are written as `CREATE TABLE <name>;` and `FAIL;` statements.
function createFakeDb() {
  const state = {
    hasTrackingTable: false,
    applied: new Set(),
    tables: new Set(),
    lockHeld: false,
    openClients: 0,
    executedStatements: [],
  };
  let snapshot = null;

  function query(sql) {
    const text = sql.trim();
    if (/pg_advisory_lock/.test(text)) {
      state.lockHeld = true;
      return { rows: [] };
    }
    if (/pg_advisory_unlock/.test(text)) {
      state.lockHeld = false;
      return { rows: [] };
    }
    if (/^CREATE TABLE IF NOT EXISTS schema_migrations/i.test(text)) {
      state.hasTrackingTable = true;
      return { rows: [] };
    }
    if (/^SELECT filename FROM schema_migrations/i.test(text)) {
      assert.ok(state.hasTrackingTable, 'schema_migrations must exist before it is read');
      return { rows: [...state.applied].map((filename) => ({ filename })) };
    }
    if (/^BEGIN/i.test(text)) {
      snapshot = { applied: new Set(state.applied), tables: new Set(state.tables) };
      return { rows: [] };
    }
    if (/^COMMIT/i.test(text)) {
      snapshot = null;
      return { rows: [] };
    }
    if (/^ROLLBACK/i.test(text)) {
      state.applied = snapshot.applied;
      state.tables = snapshot.tables;
      snapshot = null;
      return { rows: [] };
    }
    throw new Error(`unexpected statement: ${text}`);
  }

  function runStatement(statement, params) {
    if (/^INSERT INTO schema_migrations/i.test(statement)) {
      const [filename] = params;
      if (state.applied.has(filename)) {
        throw new Error('duplicate key value violates unique constraint');
      }
      state.applied.add(filename);
      return { rows: [] };
    }
    return null;
  }

  const client = {
    async query(sql, params) {
      const text = sql.trim();
      const handled = runStatement(text, params);
      if (handled) return handled;
      const migrationStatements = text
        .split(';')
        .map((s) => s.trim())
        .filter((s) => /^(CREATE TABLE \w+|FAIL)$/i.test(s));
      if (migrationStatements.length > 0) {
        assert.ok(snapshot, 'migration SQL must run inside a transaction');
        for (const statement of migrationStatements) {
          state.executedStatements.push(statement);
          if (/^FAIL$/i.test(statement)) throw new Error('migration failed');
          const table = statement.split(/\s+/)[2];
          if (state.tables.has(table)) throw new Error(`relation "${table}" already exists`);
          state.tables.add(table);
        }
        return { rows: [] };
      }
      return query(sql);
    },
    release() {
      state.openClients -= 1;
    },
  };

  const db = {
    async connect() {
      state.openClients += 1;
      return client;
    },
  };

  return { db, state };
}

function writeMigrations(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrations-'));
  for (const [name, sql] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), sql);
  }
  return dir;
}

const silent = () => {};

test('applies pending migrations in filename order and records them', async () => {
  const dir = writeMigrations({
    '002_b.sql': 'CREATE TABLE b;',
    '001_a.sql': 'CREATE TABLE a;',
    '003_c.sql': 'CREATE TABLE c;',
  });
  const { db, state } = createFakeDb();

  const applied = await runMigrations({ db, dir, log: silent });

  assert.deepEqual(applied, ['001_a.sql', '002_b.sql', '003_c.sql']);
  assert.deepEqual(state.executedStatements, ['CREATE TABLE a', 'CREATE TABLE b', 'CREATE TABLE c']);
  assert.deepEqual([...state.applied].sort(), applied);
});

test('a second run applies nothing and does not re-execute applied files', async () => {
  const dir = writeMigrations({ '001_a.sql': 'CREATE TABLE a;' });
  const { db, state } = createFakeDb();
  await runMigrations({ db, dir, log: silent });

  const applied = await runMigrations({ db, dir, log: silent });

  assert.deepEqual(applied, []);
  assert.equal(state.executedStatements.length, 1);
});

test('only files added since the last run are executed', async () => {
  const dir = writeMigrations({ '001_a.sql': 'CREATE TABLE a;' });
  const { db } = createFakeDb();
  await runMigrations({ db, dir, log: silent });
  fs.writeFileSync(path.join(dir, '002_b.sql'), 'CREATE TABLE b;');

  const applied = await runMigrations({ db, dir, log: silent });

  assert.deepEqual(applied, ['002_b.sql']);
});

test('a failing migration rolls back, stops the run, and releases the lock', async () => {
  const dir = writeMigrations({
    '001_a.sql': 'CREATE TABLE a;',
    '002_bad.sql': 'CREATE TABLE half_done; FAIL;',
    '003_c.sql': 'CREATE TABLE c;',
  });
  const { db, state } = createFakeDb();

  await assert.rejects(runMigrations({ db, dir, log: silent }), /migration failed/);

  assert.deepEqual([...state.applied], ['001_a.sql']);
  assert.ok(state.tables.has('a'));
  assert.ok(!state.tables.has('half_done'), 'partial changes must be rolled back');
  assert.ok(!state.tables.has('c'), 'later migrations must not run');
  assert.equal(state.lockHeld, false);
  assert.equal(state.openClients, 0);
});

test('after a failure is fixed, the next run resumes at the failed file', async () => {
  const dir = writeMigrations({
    '001_a.sql': 'CREATE TABLE a;',
    '002_bad.sql': 'FAIL;',
  });
  const { db } = createFakeDb();
  await assert.rejects(runMigrations({ db, dir, log: silent }));
  fs.writeFileSync(path.join(dir, '002_bad.sql'), 'CREATE TABLE b;');

  const applied = await runMigrations({ db, dir, log: silent });

  assert.deepEqual(applied, ['002_bad.sql']);
});

test('baseline records files up to the given number without executing them', async () => {
  const dir = writeMigrations({
    '001_a.sql': 'CREATE TABLE a;',
    '002_b.sql': 'CREATE TABLE b;',
    '003_c.sql': 'CREATE TABLE c;',
  });
  const { db, state } = createFakeDb();

  const baselined = await baselineMigrations({ db, dir, upTo: '002', log: silent });

  assert.deepEqual(baselined, ['001_a.sql', '002_b.sql']);
  assert.equal(state.executedStatements.length, 0);
  assert.equal(state.lockHeld, false);
  assert.equal(state.openClients, 0);

  const applied = await runMigrations({ db, dir, log: silent });
  assert.deepEqual(applied, ['003_c.sql']);
});

test('baseline refuses to run on a database that already tracks migrations', async () => {
  const dir = writeMigrations({
    '001_a.sql': 'CREATE TABLE a;',
    '002_b.sql': 'CREATE TABLE b;',
  });
  const { db, state } = createFakeDb();
  await runMigrations({ db, dir, log: silent });

  await assert.rejects(baselineMigrations({ db, dir, upTo: '002', log: silent }), /already/i);
  assert.equal(state.lockHeld, false);
});

test('baseline rejects a number that matches no migration file', async () => {
  const dir = writeMigrations({ '001_a.sql': 'CREATE TABLE a;' });
  const { db, state } = createFakeDb();

  await assert.rejects(baselineMigrations({ db, dir, upTo: '999', log: silent }), /999/);
  assert.equal(state.applied.size, 0);
});
