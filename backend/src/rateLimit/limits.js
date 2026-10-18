import { consumeRateLimit } from './rateLimit.service.js';
import { hashToken } from '../auth/token.js';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const LOGIN_EMAIL_LIMITS = [
  { max: 3, windowMs: 15 * MINUTE_MS },
  { max: 5, windowMs: DAY_MS },
];
export const LOGIN_IP_LIMITS = [{ max: 10, windowMs: HOUR_MS }];
// Stays below the Resend free tier (100 emails/day).
export const LOGIN_GLOBAL_LIMITS = [{ max: 90, windowMs: DAY_MS }];

// Counted per Hugging Face call; one onboarding uses two (50 onboardings = 100).
export const CHAT_IP_LIMITS = [
  { max: 6, windowMs: HOUR_MS },
  { max: 10, windowMs: DAY_MS },
];
export const CHAT_GLOBAL_LIMITS = [{ max: 100, windowMs: DAY_MS }];

/**
 * Checks IP, then email, then the global cap, stopping at the first denial so
 * a blocked IP or email never spends the global budget. Database errors
 * propagate so the caller fails closed (the login controller sends nothing and
 * returns its generic 200).
 */
export async function allowLoginEmail({ email, ip, now = new Date(), db }) {
  const checks = [
    { bucket: 'login_ip', subject: hashToken(ip), limits: LOGIN_IP_LIMITS },
    { bucket: 'login_email', subject: hashToken(email), limits: LOGIN_EMAIL_LIMITS },
    { bucket: 'login_global', subject: '*', limits: LOGIN_GLOBAL_LIMITS },
  ];

  for (const check of checks) {
    if (!(await consumeRateLimit({ ...check, now, db }))) return false;
  }
  return true;
}

/**
 * Checks the IP, then the global cap, stopping at the first denial. Database
 * errors propagate; the onboarding controller treats them as a denial.
 */
export async function allowChatLlmCall({ ip, now = new Date(), db }) {
  const checks = [
    { bucket: 'chat_ip', subject: hashToken(ip), limits: CHAT_IP_LIMITS },
    { bucket: 'chat_global', subject: '*', limits: CHAT_GLOBAL_LIMITS },
  ];

  for (const check of checks) {
    if (!(await consumeRateLimit({ ...check, now, db }))) return false;
  }
  return true;
}
