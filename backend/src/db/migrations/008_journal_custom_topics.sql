-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 008 - Journal Custom Topics
-- Description: Per-user custom journal topic names
-- =====================================================

CREATE TABLE journal_custom_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_journal_custom_topics_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT journal_custom_topics_name_not_empty
        CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 24)
);

CREATE UNIQUE INDEX idx_journal_custom_topics_user_name
    ON journal_custom_topics (user_id, LOWER(name));
CREATE INDEX idx_journal_custom_topics_user_id
    ON journal_custom_topics (user_id);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
