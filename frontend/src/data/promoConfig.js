export const PROMO_ACTIVE = true;
export const PROMO_FORM_URL = 'https://forms.gle/PLACEHOLDER';
export const PROMO_DEADLINE = '2026-07-25';
export const PROMO_DEADLINE_LABEL = '25 de julio 2026';

export function isPromoEnabled() {
  if (!PROMO_ACTIVE) return false;
  const deadline = new Date(PROMO_DEADLINE);
  deadline.setHours(23, 59, 59, 999);
  return Date.now() <= deadline.getTime();
}
