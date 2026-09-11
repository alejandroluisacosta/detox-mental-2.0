-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 012 - Journal Summary Feedback Count
-- Description: Allow one comment revision per displayed weekly summary
-- =====================================================

ALTER TABLE journal_weekly_summaries
    ADD COLUMN feedback_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE journal_weekly_summaries
    ADD CONSTRAINT journal_weekly_summaries_feedback_count_allowed
        CHECK (feedback_count IN (0, 1));

-- =====================================================
-- END OF MIGRATION
-- =====================================================
