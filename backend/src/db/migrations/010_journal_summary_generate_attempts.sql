-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 010 - Journal Summary Generate Attempts
-- Description: Rolling window of generate POSTs to cap retries
-- =====================================================

CREATE TABLE journal_summary_generate_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_journal_summary_generate_attempts_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_journal_summary_generate_attempts_user_created
    ON journal_summary_generate_attempts (user_id, created_at DESC);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
