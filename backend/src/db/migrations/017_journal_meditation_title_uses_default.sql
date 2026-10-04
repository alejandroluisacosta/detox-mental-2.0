ALTER TABLE journal_meditation_front_matter
ADD COLUMN IF NOT EXISTS title_uses_default BOOLEAN NOT NULL DEFAULT true;

UPDATE journal_meditation_front_matter
SET title_uses_default = false
WHERE title <> '';
