-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 009 - Journal Summary Generation Count
-- Description: Track how many times a weekly summary has been generated
-- =====================================================

ALTER TABLE journal_weekly_summaries
    ADD COLUMN generation_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE journal_weekly_summaries
    ADD CONSTRAINT journal_weekly_summaries_generation_count_positive
        CHECK (generation_count >= 1);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
