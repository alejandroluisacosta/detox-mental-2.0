import pool from '../db/db.js';

const mapRow = (row) => ({
  title: row.title ?? '',
  authorName: row.author_name ?? '',
  introduction: row.introduction ?? '',
});

const EMPTY_FRONT_MATTER = {
  title: '',
  authorName: '',
  introduction: '',
};

export const getMeditationFrontMatterForUser = async (userId, db = pool) => {
  const result = await db.query(
    `SELECT title, author_name, introduction
     FROM journal_meditation_front_matter
     WHERE user_id = $1`,
    [userId],
  );

  if (result.rows.length === 0) {
    return { ...EMPTY_FRONT_MATTER };
  }

  return mapRow(result.rows[0]);
};

export const patchMeditationFrontMatterForUser = async (userId, patch, db = pool) => {
  const {
    title,
    authorName,
    introduction,
    setTitle,
    setAuthorName,
    setIntroduction,
  } = patch;

  const result = await db.query(
    `INSERT INTO journal_meditation_front_matter (
        user_id, title, author_name, introduction, updated_at
    ) VALUES (
        $1,
        CASE WHEN $2::boolean THEN $3 ELSE '' END,
        CASE WHEN $4::boolean THEN $5 ELSE '' END,
        CASE WHEN $6::boolean THEN $7 ELSE '' END,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        title = CASE
            WHEN $2::boolean THEN EXCLUDED.title
            ELSE journal_meditation_front_matter.title
        END,
        author_name = CASE
            WHEN $4::boolean THEN EXCLUDED.author_name
            ELSE journal_meditation_front_matter.author_name
        END,
        introduction = CASE
            WHEN $6::boolean THEN EXCLUDED.introduction
            ELSE journal_meditation_front_matter.introduction
        END,
        updated_at = NOW()
    RETURNING title, author_name, introduction`,
    [
      userId,
      setTitle,
      title,
      setAuthorName,
      authorName,
      setIntroduction,
      introduction,
    ],
  );

  return mapRow(result.rows[0]);
};
