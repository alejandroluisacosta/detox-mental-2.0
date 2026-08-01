-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 004 - Journal Weekly Summaries
-- Description: Persist once-per-week AI journal reflections
-- =====================================================

CREATE TABLE journal_weekly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    summary_text TEXT NOT NULL,
    main_topics TEXT[] NOT NULL DEFAULT '{}',
    best_quote TEXT NOT NULL,
    best_quote_entry_id UUID,
    socratic_text TEXT NOT NULL,
    entry_count INTEGER NOT NULL,
    model_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_journal_weekly_summaries_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_journal_weekly_summaries_best_quote_entry_id
        FOREIGN KEY (best_quote_entry_id)
        REFERENCES journal_entries(id)
        ON DELETE SET NULL,

    CONSTRAINT journal_weekly_summaries_entry_count_positive
        CHECK (entry_count >= 0),

    CONSTRAINT journal_weekly_summaries_summary_not_empty
        CHECK (LENGTH(TRIM(summary_text)) > 0),

    CONSTRAINT journal_weekly_summaries_quote_not_empty
        CHECK (LENGTH(TRIM(best_quote)) > 0),

    CONSTRAINT journal_weekly_summaries_socratic_not_empty
        CHECK (LENGTH(TRIM(socratic_text)) > 0),

    CONSTRAINT journal_weekly_summaries_user_week_unique
        UNIQUE (user_id, week_start)
);

CREATE INDEX idx_journal_weekly_summaries_user_created
    ON journal_weekly_summaries (user_id, created_at DESC);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
