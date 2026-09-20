import { getApiBase } from '../api/client.js';

export const BLOG_IMAGE_PATH_PREFIX = '/blog/images/';

export const resolveBlogImageSrc = (src) => {
  if (typeof src !== 'string' || !src.startsWith(BLOG_IMAGE_PATH_PREFIX)) {
    return src;
  }
  return `${String(getApiBase()).replace(/\/$/, '')}${src}`;
};
