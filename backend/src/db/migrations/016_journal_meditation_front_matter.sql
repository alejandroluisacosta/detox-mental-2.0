CREATE TABLE journal_meditation_front_matter (
    user_id UUID PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    author_name TEXT NOT NULL DEFAULT '',
    introduction TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_journal_meditation_front_matter_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
