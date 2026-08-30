-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 007 - Journal Topic Slugs
-- Description: Rewrite journal_entries.topics from Spanish identifiers to English slugs
-- =====================================================

UPDATE journal_entries AS e
SET topics = COALESCE((
    SELECT array_agg(COALESCE(m.new_id, t.topic) ORDER BY t.ord)
    FROM unnest(e.topics) WITH ORDINALITY AS t(topic, ord)
    LEFT JOIN (VALUES
        ('Trabajo',        'work'),
        ('Interpersonal',  'interpersonal'),
        ('Reflexión',      'reflection'),
        ('Sabiduría',      'wisdom'),
        ('Preocupaciones', 'worries'),
        ('Meditaciones',   'meditations'),
        ('Privado',        'private')
    ) AS m(old_id, new_id) ON m.old_id = t.topic
), '{}')
WHERE e.topics && ARRAY[
    'Trabajo',
    'Interpersonal',
    'Reflexión',
    'Sabiduría',
    'Preocupaciones',
    'Meditaciones',
    'Privado'
]::text[];

-- =====================================================
-- END OF MIGRATION
-- =====================================================
