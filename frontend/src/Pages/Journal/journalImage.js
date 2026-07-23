export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;

/**
 * Validates a selected file's type before any processing. Size is enforced
 * after downscaling, since raw phone photos are often large but shrink well.
 * @param { File | undefined | null } file
 * @returns { { valid: true } | { valid: false, message: string } }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, message: 'Selecciona una imagen.' };
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, message: 'Formato no admitido. Usa JPG, PNG o WebP.' };
  }
  return { valid: true };
};

/**
 * Downscales a large image on a canvas to keep handwriting legible while
 * staying under the upload limit. Falls back to the original file if the
 * browser cannot process it.
 * @param { File } file
 * @returns { Promise<Blob> }
 */
export const prepareImageForUpload = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/jpeg',
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo procesar la imagen.'));
    };

    img.src = url;
  });
