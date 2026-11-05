-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 021 - Compass
-- Description: User-controlled memories and goals that the weekly
--              summary reads, plus the changes it suggests to them.
-- =====================================================

CREATE TABLE compass_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    kind TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_compass_items_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT compass_items_kind_valid
        CHECK (kind IN ('memory', 'goal')),

    CONSTRAINT compass_items_content_length
        CHECK (LENGTH(TRIM(content)) > 0 AND LENGTH(content) <= 200)
);

CREATE INDEX idx_compass_items_user_kind_created
    ON compass_items (user_id, kind, created_at);

CREATE TABLE compass_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    summary_id UUID NOT NULL,
    action TEXT NOT NULL,
    kind TEXT NOT NULL,
    target_item_id UUID,
    -- Snapshot of the target item when suggested: staleness check and "Replaces:" line.
    target_content TEXT,
    -- NULL for remove suggestions.
    content TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dismissed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_compass_suggestions_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_compass_suggestions_summary_id
        FOREIGN KEY (summary_id)
        REFERENCES journal_weekly_summaries(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_compass_suggestions_target_item_id
        FOREIGN KEY (target_item_id)
        REFERENCES compass_items(id)
        ON DELETE CASCADE,

    CONSTRAINT compass_suggestions_action_valid
        CHECK (action IN ('add', 'update', 'remove')),

    CONSTRAINT compass_suggestions_kind_valid
        CHECK (kind IN ('memory', 'goal')),

    CONSTRAINT compass_suggestions_status_valid
        CHECK (status IN ('pending', 'dismissed')),

    CONSTRAINT compass_suggestions_content_length
        CHECK (content IS NULL OR (LENGTH(TRIM(content)) > 0 AND LENGTH(content) <= 200)),

    CONSTRAINT compass_suggestions_add_has_no_target
        CHECK ((action = 'add') = (target_item_id IS NULL)),

    CONSTRAINT compass_suggestions_remove_has_no_content
        CHECK ((action = 'remove') = (content IS NULL))
);

CREATE INDEX idx_compass_suggestions_summary_status
    ON compass_suggestions (summary_id, status);
CREATE INDEX idx_compass_suggestions_user_status_dismissed
    ON compass_suggestions (user_id, status, dismissed_at DESC);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
