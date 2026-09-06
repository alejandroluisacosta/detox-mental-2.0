export const SUMMARY_RITUAL_MS = 30000;
export const SUMMARY_QUOTE_MS = 10000;
export const SUMMARY_OVERTIME_MS = 15000;
export const SUMMARY_ATTEMPT_MS = 45000;
export const SUMMARY_MAX_ATTEMPTS = 3;
export const SUMMARY_REVEAL_MS = 300;

export const isAbortError = (err) =>
  err?.name === 'AbortError' || err?.code === 'ABORT_ERR';

export const shouldRetryGenerate = (status, err) => {
  if (isAbortError(err)) return true;
  return status === 502 || status === 504;
};

export const isGenerateRateLimited = (status, data) =>
  status === 429 && data?.code === 'summary_rate_limited';
