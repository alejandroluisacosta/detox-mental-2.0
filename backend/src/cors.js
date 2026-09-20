const FRONTEND_PREVIEW_HOST = 'detox-mental-2-0.vercel.app';
const FRONTEND_PREVIEW_PREFIX = 'detox-mental-2-0-';

export const isAllowedCorsOrigin = (
  origin,
  frontendOrigin = process.env.FRONTEND_ORIGIN,
) => {
  if (!origin) return true;
  if (frontendOrigin && origin === frontendOrigin) return true;

  let hostname;
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'https:') return false;
    hostname = parsed.hostname;
  } catch {
    return false;
  }

  if (hostname === FRONTEND_PREVIEW_HOST) return true;
  return hostname.startsWith(FRONTEND_PREVIEW_PREFIX) && hostname.endsWith('.vercel.app');
};
