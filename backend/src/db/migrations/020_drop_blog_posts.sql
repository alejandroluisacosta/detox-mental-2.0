-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 020 - Drop Blog Posts
-- Description: Remove the blog_posts table created by 014. No application
--              code reads or writes it any more. Dropping the table also
--              drops its indexes, constraints, and updated_at trigger.
-- =====================================================

DROP TABLE IF EXISTS blog_posts;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
