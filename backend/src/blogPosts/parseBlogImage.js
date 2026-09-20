export const ALLOWED_BLOG_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;
export const BLOG_IMAGE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Detects the real image type from the file signature so we do not trust
 * a client-supplied MIME type when storing or serving the bytes.
 * @param { Buffer } buffer
 * @returns { 'image/jpeg' | 'image/png' | 'image/webp' | null }
 */
export const detectBlogImageType = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return null;
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
};

export const parseBlogImageId = (raw) => {
  const id = typeof raw === 'string' ? raw.trim() : '';
  if (!BLOG_IMAGE_ID_PATTERN.test(id)) {
    return { ok: false };
  }
  return { ok: true, id: id.toLowerCase() };
};

export const parseBlogImageUpload = (file) => {
  if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    return { ok: false, message: 'No image was received.' };
  }
  if (file.buffer.length > MAX_BLOG_IMAGE_BYTES) {
    return { ok: false, message: 'The image is too large (maximum 5 MB).' };
  }
  if (!ALLOWED_BLOG_IMAGE_TYPES.includes(file.mimetype)) {
    return { ok: false, message: 'Unsupported image format. Use JPG, PNG, or WebP.' };
  }
  const mimeType = detectBlogImageType(file.buffer);
  if (!mimeType) {
    return { ok: false, message: 'The file does not appear to be a valid image.' };
  }
  return { ok: true, mimeType, bytes: file.buffer };
};
