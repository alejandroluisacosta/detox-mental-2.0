-- =====================================================
-- Detox Mental Database Schema Migration
-- Version: 001 - Initial Schema
-- Description: Creates all core tables for authentication,
--              course management, and user cognitive data
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users
-- Purpose: Store user account information
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_role_check CHECK (role IN ('free', 'paid', 'admin'))
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- TABLE: magic_link_tokens
-- Purpose: Store hashed magic link tokens for passwordless auth
-- Security: Only token hashes are stored, never raw tokens
-- =====================================================
CREATE TABLE magic_link_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_magic_link_tokens_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Ensure tokens can only be used once
    CONSTRAINT magic_link_tokens_used_before_expiry
        CHECK (used_at IS NULL OR used_at <= expires_at)
);

-- Indexes for magic_link_tokens table
CREATE INDEX idx_magic_link_tokens_token_hash ON magic_link_tokens(token_hash);
CREATE INDEX idx_magic_link_tokens_user_id ON magic_link_tokens(user_id);
CREATE INDEX idx_magic_link_tokens_expires_at ON magic_link_tokens(expires_at);

-- =====================================================
-- TABLE: course_sessions
-- Purpose: Store the 15 course sessions
-- Note: This table will be seeded with initial data
-- =====================================================
CREATE TABLE course_sessions (
    session_id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,

    -- Constraints
    CONSTRAINT course_sessions_session_id_positive CHECK (session_id > 0)
);

-- =====================================================
-- TABLE: user_unblocked_sessions
-- Purpose: Track which sessions users have unblocked via codes
-- =====================================================
CREATE TABLE user_unblocked_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_id INTEGER NOT NULL,
    unblocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_user_unblocked_sessions_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_unblocked_sessions_session_id
        FOREIGN KEY (session_id)
        REFERENCES course_sessions(session_id)
        ON DELETE CASCADE,

    -- Prevent duplicate unlocks
    CONSTRAINT user_unblocked_sessions_unique_user_session
        UNIQUE (user_id, session_id)
);

-- Indexes for user_unblocked_sessions table
CREATE INDEX idx_user_unblocked_sessions_user_id ON user_unblocked_sessions(user_id);
CREATE INDEX idx_unblocks_session ON user_unblocked_sessions(session_id);
CREATE INDEX idx_user_unblocked_sessions_unblocked_at ON user_unblocked_sessions(unblocked_at);

-- =====================================================
-- TABLE: thoughts
-- Purpose: Store user cognitive entries
-- =====================================================
CREATE TABLE thoughts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_thoughts_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT thoughts_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Indexes for thoughts table
CREATE INDEX idx_thoughts_user_id ON thoughts(user_id);
CREATE INDEX idx_thoughts_created_at ON thoughts(created_at DESC);

-- =====================================================
-- TABLE: classifications
-- Purpose: Store classification of cognitive distortions
-- =====================================================
CREATE TABLE classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thought_id UUID NOT NULL,
    distortion_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_classifications_thought_id
        FOREIGN KEY (thought_id)
        REFERENCES thoughts(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT classifications_distortion_type_not_empty
        CHECK (LENGTH(TRIM(distortion_type)) > 0)
);

-- Indexes for classifications table
CREATE INDEX idx_classifications_thought_id ON classifications(thought_id);
CREATE INDEX idx_classifications_distortion_type ON classifications(distortion_type);

-- =====================================================
-- TABLE: plans
-- Purpose: Store behavioral plans for addressing thoughts
-- =====================================================
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thought_id UUID NOT NULL,
    plan_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_plans_thought_id
        FOREIGN KEY (thought_id)
        REFERENCES thoughts(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT plans_plan_text_not_empty CHECK (LENGTH(TRIM(plan_text)) > 0)
);

-- Indexes for plans table
CREATE INDEX idx_plans_thought_id ON plans(thought_id);
CREATE INDEX idx_plans_created_at ON plans(created_at DESC);

-- =====================================================
-- FUNCTION: Update updated_at timestamp automatically
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update updated_at for users table
-- =====================================================
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF MIGRATION
-- =====================================================
