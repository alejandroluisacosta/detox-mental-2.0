-- =====================================================
-- Migration 015: Blog post images
-- Stores uploaded article images for markdown bodies.
-- =====================================================

CREATE TABLE blog_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID,
    mime_type VARCHAR(32) NOT NULL,
    bytes BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_blog_images_author_id
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT blog_images_mime_type_check CHECK (
        mime_type IN ('image/jpeg', 'image/png', 'image/webp')
    ),
    CONSTRAINT blog_images_bytes_not_empty CHECK (octet_length(bytes) > 0),
    CONSTRAINT blog_images_bytes_max CHECK (octet_length(bytes) <= 5242880)
);
