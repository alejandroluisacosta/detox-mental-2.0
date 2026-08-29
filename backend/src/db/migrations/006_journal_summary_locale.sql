-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 006 - Journal Summary Locale
-- Description: Persist the language used to generate a weekly summary
-- =====================================================

ALTER TABLE journal_weekly_summaries
    ADD COLUMN locale TEXT NOT NULL DEFAULT 'es';

ALTER TABLE journal_weekly_summaries
    ADD CONSTRAINT journal_weekly_summaries_locale_allowed
        CHECK (locale IN ('en', 'es'));

-- =====================================================
-- END OF MIGRATION
-- =====================================================
