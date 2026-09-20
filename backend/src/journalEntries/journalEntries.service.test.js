import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createJournalEntry,
  deleteJournalEntryForUser,
  listJournalEntriesForUser,
  updateJournalEntryTopicsForUser,
} from './journalEntries.service.js';

const memoryDb = (clock = () => new Date('2026-09-13T12:00:00.000Z')) => {
  const rows = [];
  let nextId = 1;

  return {
    rows,
    async query(sql, params = []) {
      const text = sql.replace(/\s+/g, ' ');

      if (/INSERT INTO journal_entries/.test(text)) {
        const [userId, content, topics] = params;
        const row = {
          id: `entry-${nextId}`,
          user_id: userId,
          content,
          topics,
          created_at: clock(),
        };
        nextId += 1;
        rows.push(row);
        return { rows: [row] };
      }

      if (/DELETE FROM journal_entries/.test(text)) {
        const filtersByUser = /user_id/.test(text);
        const [entryId, userId] = params;
        const index = rows.findIndex((row) => {
          if (row.id !== entryId) return false;
          if (filtersByUser && row.user_id !== userId) return false;
          return true;
        });
        if (index === -1) return { rows: [] };
        const [deleted] = rows.splice(index, 1);
        return { rows: [{ id: deleted.id }] };
      }

      if (/UPDATE journal_entries/.test(text)) {
        const filtersByUser = /user_id/.test(text);
        const [entryId, userId, topics] = params;
        const row = rows.find((candidate) => {
          if (candidate.id !== entryId) return false;
          if (filtersByUser && candidate.user_id !== userId) return false;
          return true;
        });
        if (!row) return { rows: [] };
        row.topics = topics;
        return { rows: [row] };
      }

      if (/SELECT/.test(text)) {
        const filtersByUser = /user_id/.test(text);
        const matched = rows.filter((row) => {
          if (filtersByUser && row.user_id !== params[0]) return false;
          return true;
        });
        if (/ORDER BY created_at DESC/.test(text)) {
          matched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return { rows: matched };
      }

      return { rows: [] };
    },
  };
};

test("user B cannot list user A's journal entry", async () => {
  const db = memoryDb();
  await createJournalEntry('user-a', 'private note', ['work'], db);

  const listed = await listJournalEntriesForUser('user-b', db);
  assert.equal(listed.length, 0);
});

test("user B cannot delete user A's journal entry", async () => {
  const db = memoryDb();
  const entry = await createJournalEntry('user-a', 'private note', ['work'], db);

  const deletedId = await deleteJournalEntryForUser('user-b', entry.id, db);
  assert.equal(deletedId, null);
  assert.equal(db.rows.some((row) => row.id === entry.id), true);
});

test("user B cannot patch topics on user A's journal entry", async () => {
  const db = memoryDb();
  const entry = await createJournalEntry('user-a', 'private note', ['work'], db);

  const patched = await updateJournalEntryTopicsForUser(
    'user-b',
    entry.id,
    ['reflection'],
    db,
  );
  assert.equal(patched, null);
  assert.deepEqual(db.rows[0].topics, ['work']);
});

test('list returns the caller\'s entries newest first', async () => {
  const createdAt = [
    new Date('2026-09-13T12:00:00.000Z'),
    new Date('2026-09-13T12:01:00.000Z'),
  ];
  const db = memoryDb(() => createdAt.shift());
  const older = await createJournalEntry('user-a', 'first', [], db);
  const newer = await createJournalEntry('user-a', 'second', [], db);

  const listed = await listJournalEntriesForUser('user-a', db);
  assert.deepEqual(
    listed.map((entry) => entry.id),
    [newer.id, older.id],
  );
});
