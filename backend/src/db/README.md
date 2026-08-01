# Detox Mental Database Schema Documentation

## Overview

This document describes the PostgreSQL database schema for the Detox Mental backend. The schema supports passwordless authentication, course management, and behavioral therapy data storage.

## Database Technology

- **Database**: PostgreSQL
- **Primary Keys**: UUID (using `uuid-ossp` extension)
- **Timestamps**: All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- **Deployment**: Vercel-compatible PostgreSQL instance

## Schema Design Principles

1. **Security First**: Sensitive data (magic link tokens) are hashed before storage
2. **Data Integrity**: Foreign key constraints ensure referential integrity
3. **Soft Deletion**: Users can be soft-deleted via `deleted_at` timestamp
4. **Performance**: Strategic indexes on frequently queried columns
5. **Scalability**: UUID primary keys support distributed systems

---

## Tables

### 1. `users`

Stores user account and authentication information.

**Columns:**
- `id` (UUID, PK): Unique user identifier
- `email` (VARCHAR(255), UNIQUE): User's email address (normalized: lowercase, trimmed)
- `role` (VARCHAR(50)): User role - `free`, `paid`, or `admin` (default: `free`)
- `stripe_customer_id` (VARCHAR(255)): Stripe customer identifier for payments
- `stripe_payment_intent_id` (VARCHAR(255)): Stripe payment intent reference
- `paid_at` (TIMESTAMP WITH TIME ZONE): When user completed payment
- `last_login_at` (TIMESTAMP WITH TIME ZONE): Last successful login timestamp
- `created_at` (TIMESTAMP WITH TIME ZONE): Account creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE): Last account update timestamp
- `deleted_at` (TIMESTAMP WITH TIME ZONE): Soft deletion timestamp (NULL = active)

**Constraints:**
- Email format validation (regex check)
- Role must be one of: `free`, `paid`, `admin`
- Email must be unique (case-insensitive)

**Indexes:**
- `idx_users_email`: Fast email lookups (excludes soft-deleted users)
- `idx_users_stripe_customer_id`: Fast Stripe customer lookups
- `idx_users_deleted_at`: Efficient soft-delete queries

**Auto-Triggers:**
- `updated_at` automatically updates on row modification

---

### 2. `magic_link_tokens`

Stores hashed magic link tokens for passwordless authentication.

**Security Note**: Raw tokens are NEVER stored in the database. Only SHA-256 hashes are persisted.

**Columns:**
- `id` (UUID, PK): Unique token identifier
- `user_id` (UUID, FK → users.id): Associated user (nullable before first login)
- `token_hash` (VARCHAR(255), UNIQUE): SHA-256 hash of the magic link token
- `expires_at` (TIMESTAMP WITH TIME ZONE): Token expiration time (15 minutes from creation)
- `used_at` (TIMESTAMP WITH TIME ZONE): When token was used (NULL = unused)
- `created_at` (TIMESTAMP WITH TIME ZONE): Token creation timestamp

**Constraints:**
- `user_id` references `users(id)` with CASCADE delete
- `token_hash` must be unique
- `used_at` must be before or equal to `expires_at`

**Indexes:**
- `idx_magic_link_tokens_token_hash`: Fast token verification lookups
- `idx_magic_link_tokens_user_id`: User-based token queries
- `idx_magic_link_tokens_expires_at`: Efficient expiration checks

**Token Lifecycle:**
1. User requests login → token generated and hashed
2. Hash stored in database with 15-minute expiration
3. User clicks magic link → token is hashed and verified
4. On successful verification → `used_at` is set, token cannot be reused

---

### 3. `course_sessions`

Stores the 15 course sessions for the Detox Mental program.

**Columns:**
- `session_id` (INTEGER, PK): Canonical session identifier (1-15)
- `title` (VARCHAR(255)): Session title
- (UI copy/content is kept in the frontend; the DB stores minimal catalog data)

**Constraints:**
- `session_id` must be positive

**Indexes:**
- (No extra indexes needed beyond the primary key)

**Seeding:**
The 15 course sessions are seeded during initial migration via `002_seed_course_sessions.sql`.

---

### 4. `user_unblocked_sessions`

Tracks which course sessions users have unblocked via unblocking codes.

**Columns:**
- `id` (UUID, PK): Unique unblocked record identifier
- `user_id` (UUID, FK → users.id): User who unblocked the session
- `session_id` (INTEGER, FK → course_sessions.session_id): Unblocked session
- `unblocked_at` (TIMESTAMP WITH TIME ZONE): When the session was unblocked

**Constraints:**
- `user_id` references `users(id)` with CASCADE delete
- `session_id` references `course_sessions(session_id)` with CASCADE delete
- `(user_id, session_id)` must be unique (prevents duplicate unblocks)

**Indexes:**
- `idx_user_unblocked_sessions_user_id`: Fast user access checks
- `idx_unlocks_session`: Session-based queries
- `idx_user_unblocked_sessions_unblocked_at`: Timeline queries

**Usage:**
When a user enters a valid unblocking code, a record is inserted here to grant access to a specific course session.

---

### 5. `thoughts`

Stores user cognitive entries (automatic thoughts) for CBT exercises.

**Columns:**
- `id` (UUID, PK): Unique thought identifier
- `user_id` (UUID, FK → users.id): User who recorded the thought
- `content` (TEXT): The thought content
- `created_at` (TIMESTAMP WITH TIME ZONE): When thought was recorded

**Constraints:**
- `user_id` references `users(id)` with CASCADE delete
- `content` cannot be empty (trimmed length > 0)

**Indexes:**
- `idx_thoughts_user_id`: Fast user thought retrieval
- `idx_thoughts_created_at`: Chronological ordering (DESC for recent-first)

**Relationships:**
- One thought can have multiple classifications (1:N)
- One thought can have multiple plans (1:N)

---

### 5b. `journal_entries`

Stores free-form journal entries for the user diary (`/journal`). Separate from CBT `thoughts`.

**Columns:**
- `id` (UUID, PK): Unique entry identifier
- `user_id` (UUID, FK → users.id): Author
- `content` (TEXT): Journal text
- `topics` (TEXT[]): Optional topic tags (default empty; UI later)
- `created_at` (TIMESTAMP WITH TIME ZONE): When the entry was saved

**Constraints:**
- `user_id` references `users(id)` with CASCADE delete
- `content` cannot be empty (trimmed length > 0)

**Indexes:**
- `idx_journal_entries_user_id`: User-scoped retrieval
- `idx_journal_entries_created_at`: Chronological ordering (DESC)
- `idx_journal_entries_topics`: GIN index for future topic filters

---

### 5c. `journal_weekly_summaries`

Stores the once-per-week AI reflection generated from `journal_entries` (`/journal/summary`).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `week_start` / `week_end` (DATE): Monday–Sunday of the ISO week in Europe/Madrid
- `period_start` / `period_end` (TIMESTAMPTZ): UTC range used to select entries
- `summary_text` (TEXT): Plain weekly overview
- `main_topics` (TEXT[]): Model-derived topic labels
- `best_quote` (TEXT): Highlighted sentence from the user’s writing
- `best_quote_entry_id` (UUID, FK → journal_entries.id, nullable, ON DELETE SET NULL)
- `socratic_text` (TEXT): Challenging Socratic question/prompt
- `entry_count` (INTEGER): How many entries were included
- `model_id` (TEXT, nullable): HF model that produced the row
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- `UNIQUE (user_id, week_start)` — one summary per user per week
- Non-empty checks on summary / quote / socratic text

**Indexes:**
- `idx_journal_weekly_summaries_user_created`: User history ordering

---

### 6. `classifications`

Stores cognitive distortion classifications for thoughts.

**Columns:**
- `id` (UUID, PK): Unique classification identifier
- `thought_id` (UUID, FK → thoughts.id): Associated thought
- `distortion_type` (VARCHAR(100)): Type of cognitive distortion identified
- `created_at` (TIMESTAMP WITH TIME ZONE): Classification timestamp

**Constraints:**
- `thought_id` references `thoughts(id)` with CASCADE delete
- `distortion_type` cannot be empty

**Indexes:**
- `idx_classifications_thought_id`: Fast thought-based queries
- `idx_classifications_distortion_type`: Analytics on distortion patterns

**Common Distortion Types:**
- All-or-nothing thinking
- Overgeneralization
- Mental filter
- Jumping to conclusions
- Catastrophizing
- Emotional reasoning
- Should statements
- Labeling
- Personalization

---

### 7. `plans`

Stores behavioral action plans to address cognitive distortions.

**Columns:**
- `id` (UUID, PK): Unique plan identifier
- `thought_id` (UUID, FK → thoughts.id): Associated thought
- `plan_text` (TEXT): The action plan description
- `created_at` (TIMESTAMP WITH TIME ZONE): Plan creation timestamp

**Constraints:**
- `thought_id` references `thoughts(id)` with CASCADE delete
- `plan_text` cannot be empty

**Indexes:**
- `idx_plans_thought_id`: Fast thought-based queries
- `idx_plans_created_at`: Chronological ordering (DESC)

**Usage:**
After identifying cognitive distortions, users create actionable plans to reframe or respond to the thought constructively.

---

## Relationships Diagram

```
users (1) ──────< (N) magic_link_tokens
  │
  ├──────< (N) user_unblocked_sessions >────── (1) course_sessions
  │
  └──────< (N) thoughts
              │
              ├──────< (N) classifications
              │
              └──────< (N) plans
```

---

## Key Design Decisions

### 1. UUID Primary Keys
- **Why**: Better for distributed systems, no sequential ID leakage
- **Trade-off**: Slightly larger storage than BIGSERIAL, but negligible for this scale

### 2. Soft Deletion for Users
- **Why**: Preserve data integrity for related records, audit trail
- **Implementation**: `deleted_at` timestamp (NULL = active user)
- **Query Pattern**: Always filter `WHERE deleted_at IS NULL` for active users

### 3. Token Hash Storage
- **Why**: Security best practice - raw tokens never persisted
- **Algorithm**: SHA-256 hashing before storage
- **Verification**: Hash incoming token and compare with stored hash

### 4. Cascade Deletes
- **Why**: Automatic cleanup of related data when parent is deleted
- **Applied to**:
  - User deletion → cascades to tokens, thoughts, unblocked sessions
  - Thought deletion → cascades to classifications and plans
  - Session deletion → cascades to unblock records

### 5. Timestamp Best Practices
- **All timestamps** use `TIMESTAMP WITH TIME ZONE`
- **Why**: Proper timezone handling for global users
- **Auto-update**: `users.updated_at` via trigger function

### 6. Index Strategy
- **Email lookups**: Frequent for authentication → indexed
- **Token verification**: Critical path → indexed on `token_hash`
- **User relations**: Common queries → indexed on foreign keys
- **Chronological queries**: `created_at` DESC for recent-first ordering

---

## Running Migrations

### Apply Schema Migration
```sql
-- Run in PostgreSQL
\i backend/src/db/migrations/001_initial_schema.sql
```

### Seed Course Sessions
```sql
-- Run after schema migration
\i backend/src/db/migrations/002_seed_course_sessions.sql
```

### Journal Entries
```sql
-- Run after schema migration
\i backend/src/db/migrations/003_journal_entries.sql
```

### Verify Migration Success
```sql
-- Check all tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify course sessions seeded
SELECT COUNT(*) FROM course_sessions; -- Should return 15

-- Check all indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## Query Examples

### Active Users Only
```sql
SELECT * FROM users WHERE deleted_at IS NULL;
```

### Check User Access to Session
```sql
SELECT EXISTS(
    SELECT 1
    FROM user_unblocked_sessions
    WHERE user_id = $1 AND session_id = $2
);
```

### Get User's Recent Thoughts with Classifications
```sql
SELECT
    t.id,
    t.content,
    t.created_at,
    ARRAY_AGG(c.distortion_type) AS distortions
FROM thoughts t
LEFT JOIN classifications c ON c.thought_id = t.id
WHERE t.user_id = $1
GROUP BY t.id, t.content, t.created_at
ORDER BY t.created_at DESC
LIMIT 10;
```

### Cleanup Expired Tokens (Maintenance Query)
```sql
DELETE FROM magic_link_tokens
WHERE expires_at < NOW() - INTERVAL '1 day';
```

---

## Security Considerations

1. **Token Storage**: Only hashes stored, never plaintext
2. **Email Enumeration Prevention**: Return generic success even if email doesn't exist
3. **Token Expiration**: 15-minute window enforced at database level
4. **One-Time Use**: `used_at` prevents token reuse
5. **Soft Deletion**: Prevents accidental data loss
6. **Foreign Key Cascades**: Automatic cleanup prevents orphaned records

---

## Performance Optimization

### Recommended Indexes (Already Applied)
- All foreign keys are indexed
- Frequently filtered columns (`email`, `token_hash`) are indexed
- Partial indexes exclude irrelevant rows (e.g., `deleted_at IS NULL`)

### Query Optimization Tips
1. Always filter soft-deleted users: `WHERE deleted_at IS NULL`
2. Use prepared statements to prevent SQL injection
3. Limit result sets with `LIMIT` clauses
4. Use `EXISTS` instead of `COUNT(*)` for boolean checks

---

## Future Extensions

Potential schema additions (not yet implemented):

1. **Session Management Table**: Track active JWT sessions for revocation
2. **Unlock Codes Table**: Store and manage unlock codes in database
3. **Audit Log Table**: Track sensitive operations for compliance
4. **User Preferences Table**: Store UI/UX preferences
5. **Session Progress Table**: Track completion status of course sessions

---

## Maintenance Scripts

### Clean Up Expired Tokens (Run Periodically)
```sql
-- Delete tokens older than 24 hours
DELETE FROM magic_link_tokens
WHERE expires_at < NOW() - INTERVAL '1 day';
```

### Database Health Check
```sql
-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Support

For questions or issues related to the database schema, please refer to:
- **Architecture Document**: `AUTH_ARCHITECTURE.md`
- **Project Issues**: GitHub repository issues
- **Database Documentation**: PostgreSQL official docs

---

**Last Updated**: March 2026
**Schema Version**: 001
**Seed Version**: 002
