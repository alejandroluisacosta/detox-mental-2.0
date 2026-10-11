/**
 * One-off seeder for `session_unlock_codes` (migration 018).
 *
 * Unlike a SQL seed file, this is a script rather than a `.sql` migration
 * because the stored value is HMAC-SHA256(code, MAGIC_LINK_SECRET) — see
 * migration 018's comment for why a plain hash isn't enough for these
 * short codes. That HMAC depends on the secret configured in *this*
 * environment, so a hash baked into a SQL file would only be valid for
 * whichever secret happened to generate it. Run this once per environment
 * (local, then production) using that environment's real `MAGIC_LINK_SECRET`
 * and `DATABASE_URL`:
 *
 *   cd backend && node scripts/seedSessionUnlockCodes.js
 *
 * Safe to re-run: it upserts, so re-running after rotating a code's value
 * below (or after rotating MAGIC_LINK_SECRET) just updates the stored hash.
 */
import dotenv from 'dotenv';
import pool from '../src/db/db.js';
import { hashToken } from '../src/auth/token.js';

dotenv.config();

// The codes that used to ship in frontend/src/data/codes.json. Session 1
// has no code (it's unblocked by default), matching sessions.js.
const CODES_BY_SESSION = {
  2: 'WPSOKL',
  3: 'XQFJMD',
  4: 'XAATZP',
  5: 'TYNNKL',
  6: 'BRQWEM',
  7: 'JLKYTU',
  8: 'ZPHQDA',
  9: 'MVRCON',
  10: 'FEWGJL',
  11: 'TQXUPK',
  12: 'NDHSZO',
  13: 'CWYBRQ',
  14: 'LZTEVM',
  15: 'QJAFKS',
};

async function main() {
  if (!process.env.MAGIC_LINK_SECRET) {
    throw new Error('MAGIC_LINK_SECRET is not set in this environment.');
  }

  for (const [sessionId, code] of Object.entries(CODES_BY_SESSION)) {
    const codeHash = hashToken(code);
    await pool.query(
      `INSERT INTO session_unlock_codes (session_id, code_hash)
       VALUES ($1, $2)
       ON CONFLICT (session_id) DO UPDATE SET code_hash = EXCLUDED.code_hash`,
      [Number(sessionId), codeHash],
    );
    console.log(`Seeded session ${sessionId}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
