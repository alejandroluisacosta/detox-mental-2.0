-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 011 - Drop Unused Thought Tables
-- Description: Remove unused CBT tables from migration 001.
--              No application queries read or write these tables.
-- =====================================================

DROP TABLE IF EXISTS classifications;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS thoughts;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
