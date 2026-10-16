/**
 * Best-effort client IP. On Vercel the edge sets x-real-ip / x-forwarded-for
 * itself, so they can be trusted there; elsewhere they are spoofable, so only
 * the socket address is used. Falls back to a shared 'unknown' subject, which
 * fails closed.
 */
export function clientIp(req) {
  if (process.env.VERCEL) {
    const realIp = req.headers?.['x-real-ip'];
    if (realIp) return String(realIp).trim();
    const forwarded = req.headers?.['x-forwarded-for'];
    const first = forwarded ? String(forwarded).split(',')[0].trim() : '';
    if (first) return first;
    return 'unknown';
  }
  return req.socket?.remoteAddress || 'unknown';
}
