-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 018 - Session Unlock Codes
-- Description: Move session-unlock code verification server-side.
--   Codes were previously shipped in the frontend bundle and never
--   checked by the API (any authenticated user could POST any
--   sessionId 1-15 to /auth/me/unblocked-sessions and unlock it
--   without knowing a code). This table lets the backend verify a
--   submitted code against a stored HMAC before granting access.
--
--   code_hash is HMAC-SHA256(code, MAGIC_LINK_SECRET), not a plain
--   hash: these codes are short (6 uppercase letters, ~3*10^8
--   possibilities), so a bare SHA-256 could be brute-forced offline
--   in seconds from a DB leak alone. Keying the hash with a secret
--   that is NOT in the database (same pattern as magic_link_tokens)
--   means a DB leak alone is not enough to recover or forge codes.
-- =====================================================

CREATE TABLE session_unlock_codes (
    session_id INTEGER PRIMARY KEY REFERENCES course_sessions(session_id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL
);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
