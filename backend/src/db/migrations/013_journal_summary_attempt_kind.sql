-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 013 - Journal Summary Attempt Kind
-- Description: Separate generate and revise retry budgets
-- =====================================================

ALTER TABLE journal_summary_generate_attempts
    ADD COLUMN kind TEXT NOT NULL DEFAULT 'generate';

ALTER TABLE journal_summary_generate_attempts
    ADD CONSTRAINT journal_summary_generate_attempts_kind_allowed
        CHECK (kind IN ('generate', 'revise'));

CREATE INDEX idx_journal_summary_generate_attempts_user_kind_created
    ON journal_summary_generate_attempts (user_id, kind, created_at DESC);

DROP INDEX idx_journal_summary_generate_attempts_user_created;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
