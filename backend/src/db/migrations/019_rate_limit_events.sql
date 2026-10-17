-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 019 - Rate Limit Events
-- Description: Shared Postgres-backed rate limiting counters
-- =====================================================

CREATE TABLE rate_limit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket TEXT NOT NULL,
    subject TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_events_bucket_subject_created
    ON rate_limit_events (bucket, subject, created_at DESC);

CREATE INDEX idx_rate_limit_events_created
    ON rate_limit_events (created_at);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
