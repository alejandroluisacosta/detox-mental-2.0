-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 005 - Journal Summary Machiavelli Challenge
-- Description: Add the optional Machiavelli challenge to weekly summaries
-- =====================================================

ALTER TABLE journal_weekly_summaries
    ADD COLUMN machiavelli_text TEXT;

ALTER TABLE journal_weekly_summaries
    ADD CONSTRAINT journal_weekly_summaries_machiavelli_not_empty
        CHECK (
            machiavelli_text IS NULL
            OR LENGTH(TRIM(machiavelli_text)) > 0
        );

-- =====================================================
-- END OF MIGRATION
-- =====================================================
