-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 020 - Drop Blog Posts
-- Description: The personal blog moved to its own site (alejandroluis.com,
--              Markdown files in the alejandroluisacosta/blog repo). No
--              application code reads or writes blog_posts any more.
--              Dropping the table also drops its indexes, constraints, and
--              updated_at trigger. Back up the table before applying.
-- =====================================================

DROP TABLE IF EXISTS blog_posts;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
