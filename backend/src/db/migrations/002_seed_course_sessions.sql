-- =====================================================
-- Detox Mental Course Sessions Seed Data
-- Version: 002 - Seed Data
-- Description: Inserts minimal session records (session_id + title)
--              for referential integrity and developer readability
-- =====================================================

-- Insert 15 course sessions
INSERT INTO course_sessions (session_id, title) VALUES
(1, 'Session 1'),
(2, 'Session 2'),
(3, 'Session 3'),
(4, 'Session 4'),
(5, 'Session 5'),
(6, 'Session 6'),
(7, 'Session 7'),
(8, 'Session 8'),
(9, 'Session 9'),
(10, 'Session 10'),
(11, 'Session 11'),
(12, 'Session 12'),
(13, 'Session 13'),
(14, 'Session 14'),
(15, 'Session 15');

-- =====================================================
-- Verify the seed data
-- =====================================================
-- This query can be used to verify all sessions were inserted correctly
-- SELECT session_id, title FROM course_sessions ORDER BY session_id;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
