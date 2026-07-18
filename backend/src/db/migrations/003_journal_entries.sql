-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 003 - Journal Entries
-- Description: Free-form journaling repository per user
-- =====================================================

-- =====================================================
-- TABLE: journal_entries
-- Purpose: Store user journal texts for later review
-- =====================================================
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_journal_entries_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT journal_entries_content_not_empty
        CHECK (LENGTH(TRIM(content)) > 0)
);

CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_topics ON journal_entries USING GIN (topics);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
