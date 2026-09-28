-- =====================================================
-- Migration 015: Rename blog category personal-development → personal
-- =====================================================

ALTER TABLE blog_posts
    DROP CONSTRAINT blog_posts_category_check;

UPDATE blog_posts
SET category = 'personal'
WHERE category = 'personal-development';

ALTER TABLE blog_posts
    ADD CONSTRAINT blog_posts_category_check
        CHECK (category IN ('personal', 'technology'));

-- =====================================================
-- END OF MIGRATION
-- =====================================================
