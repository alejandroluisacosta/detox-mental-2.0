export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/**
 * Detects the real image type from the file signature (magic bytes),
 * so we don't trust a client-supplied MIME type when building the data URL.
 * @param { Buffer } buffer
 * @returns { 'image/jpeg' | 'image/png' | 'image/webp' | null }
 */
const detectImageType = (buffer) => {
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

/**
 * Validates an uploaded image before it is sent to the vision model.
 * Returns a discriminated result with a Spanish message on failure and the
 * signature-detected MIME type on success.
 * @param { { buffer?: Buffer, mimetype?: string } | undefined } file
 * @returns { { valid: true, mimeType: string } | { valid: false, message: string } }
 */
export const validateTranscriptionInput = (file) => {
  if (!file || !file.buffer || file.buffer.length === 0) {
    return { valid: false, message: 'No se recibió ninguna imagen.' };
  }
  if (file.buffer.length > MAX_IMAGE_BYTES) {
    return { valid: false, message: 'La imagen es demasiado grande (máximo 3 MB).' };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { valid: false, message: 'Formato de imagen no admitido. Usa JPG, PNG o WebP.' };
  }
  const mimeType = detectImageType(file.buffer);
  if (!mimeType) {
    return { valid: false, message: 'El archivo no parece ser una imagen válida.' };
  }
  return { valid: true, mimeType };
};
