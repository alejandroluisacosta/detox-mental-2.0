export const ACCEPTED_BLOG_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;

const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 0.88;

export const altTextFromFileName = (name) => {
  if (typeof name !== 'string') return 'image';
  const base = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return base || 'image';
};

export const validateBlogImageFile = (file) => {
  if (!file) {
    return { valid: false, messageKey: 'blog.imageMissing' };
  }
  if (!ACCEPTED_BLOG_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, messageKey: 'blog.imageUnsupported' };
  }
  return { valid: true };
};

export const prepareBlogImageForUpload = (file) => {
  if (file.size <= MAX_BLOG_IMAGE_BYTES) {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
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
      const error = new Error('blog.imageProcessFailed');
      error.messageKey = 'blog.imageProcessFailed';
      reject(error);
    };

    img.src = url;
  });
};
