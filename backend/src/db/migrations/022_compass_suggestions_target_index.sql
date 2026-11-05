-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 022 - Compass suggestions target index
-- Description: Index the foreign key to compass_items so deleting an
--              item does not scan every suggestion.
-- =====================================================

CREATE INDEX idx_compass_suggestions_target_item
    ON compass_suggestions (target_item_id);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
