export const SUMMARY_RITUAL_MS = 30000;
export const SUMMARY_QUOTE_MS = 10000;
export const SUMMARY_OVERTIME_MS = 15000;
export const SUMMARY_ATTEMPT_MS = 45000;
export const SUMMARY_MAX_ATTEMPTS = 3;
export const SUMMARY_REVEAL_MS = 300;
export const SUMMARY_TASK_DURATIONS_MS = [15000, 5000, 5000, 5000];

export const getSummaryTaskStatuses = (
  elapsedMs,
  { ready = false, minElapsed = false } = {},
) => {
  const durations = SUMMARY_TASK_DURATIONS_MS;
  const lastIndex = durations.length - 1;
  let startMs = 0;

  return durations.map((duration, index) => {
    const stepStart = startMs;
    const stepEnd = startMs + duration;
    startMs = stepEnd;

    if (index === lastIndex) {
      if (ready && minElapsed) return 'completed';
      if (elapsedMs >= stepStart) return 'active';
      return 'pending';
    }

    if (elapsedMs >= stepEnd) return 'completed';
    if (elapsedMs >= stepStart) return 'active';
    return 'pending';
  });
};

export const isAbortError = (err) =>
  err?.name === 'AbortError' || err?.code === 'ABORT_ERR';

export const shouldRetryGenerate = (status, err) => {
  if (isAbortError(err)) return true;
  return status === 502 || status === 504;
};

export const isGenerateRateLimited = (status, data) =>
  status === 429 && data?.code === 'summary_rate_limited';
