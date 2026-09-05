import { InferenceClient } from '@huggingface/inference';
import { buildSummaryMessages } from './prompts.js';
import {
  findBestQuoteEntryId,
  parseSummaryOutput,
} from './parseSummaryOutput.js';

const DEFAULT_SUMMARY_MODEL = 'moonshotai/Kimi-K2-Instruct-0905:novita';

export const SUMMARY_GENERATE_TIMEOUT_MS = 45_000;

export const getSummaryModelId = () =>
  process.env.HF_JOURNAL_SUMMARY_MODEL || DEFAULT_SUMMARY_MODEL;

const isAbortError = (err) =>
  err?.name === 'AbortError' || err?.code === 'ABORT_ERR';

const combinedSignal = (signal) => {
  const timeout = AbortSignal.timeout(SUMMARY_GENERATE_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
};

/**
 * Call HF and return normalized summary fields + quote entry match.
 * @throws Error with code-like message prefixes for controller mapping
 */
export const generateWeeklySummaryContent = async ({
  entries,
  weekStart,
  weekEnd,
  locale = 'en',
  signal,
}) => {
  if (!process.env.HF_TOKEN) {
    const err = new Error('missing_hf_token');
    err.code = 'missing_hf_token';
    throw err;
  }

  const modelId = getSummaryModelId();
  const client = new InferenceClient(process.env.HF_TOKEN);
  const messages = buildSummaryMessages({ entries, weekStart, weekEnd, locale });
  const abortSignal = combinedSignal(signal);

  let response;
  try {
    // 400–600 word reflections plus quote / topics / socratic / machiavelli.
    const completion = client.chatCompletion(
      {
        model: modelId,
        messages,
        max_tokens: 1800,
        temperature: 0.5,
      },
      { signal: abortSignal },
    );
    const timeout = new Promise((_, reject) => {
      const fail = () => {
        const timeoutErr = new Error('summary_timeout');
        timeoutErr.code = 'summary_timeout';
        reject(timeoutErr);
      };
      if (abortSignal.aborted) fail();
      else abortSignal.addEventListener('abort', fail, { once: true });
    });
    response = await Promise.race([completion, timeout]);
  } catch (err) {
    if (err?.code === 'summary_timeout' || abortSignal.aborted || isAbortError(err)) {
      const timeoutErr = new Error('summary_timeout');
      timeoutErr.code = 'summary_timeout';
      throw timeoutErr;
    }
    throw err;
  }

  const raw = response.choices?.[0]?.message?.content ?? '';
  const parsed = parseSummaryOutput(raw);
  if (!parsed.ok) {
    const err = new Error(parsed.error);
    err.code = 'invalid_model_output';
    throw err;
  }

  const bestQuoteEntryId = findBestQuoteEntryId(
    parsed.value.bestQuote,
    entries,
  );

  return {
    ...parsed.value,
    bestQuoteEntryId,
    modelId,
  };
};
