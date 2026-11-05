import { InferenceClient } from '@huggingface/inference';
import {
  buildFirstReflectionMessages,
  buildRevisionMessages,
  buildSummaryMessages,
} from './prompts.js';
import {
  extractJsonObject,
  findBestQuoteEntryId,
  parseSummaryOutput,
} from './parseSummaryOutput.js';
import { parseCompassSuggestions } from '../compass/parseCompassSuggestions.js';

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

/** Default model call: Hugging Face chat completion, returning the raw text. */
const huggingFaceCompletion = async ({ messages, maxTokens, signal, modelId }) => {
  if (!process.env.HF_TOKEN) {
    const err = new Error('missing_hf_token');
    err.code = 'missing_hf_token';
    throw err;
  }

  const client = new InferenceClient(process.env.HF_TOKEN);
  const abortSignal = combinedSignal(signal);

  let response;
  try {
    // Default fits 400–600 word reflections plus quote / topics / socratic / machiavelli / compass.
    const completion = client.chatCompletion(
      {
        model: modelId,
        messages,
        max_tokens: maxTokens,
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

  return response.choices?.[0]?.message?.content ?? '';
};

/** Suggestions never fail the summary: anything unexpected means none. */
const compassSuggestionsFrom = (raw, compass) => {
  if (!compass) return [];
  try {
    return parseCompassSuggestions(extractJsonObject(raw)?.compass, compass);
  } catch (err) {
    console.error('[journal-summaries compass parse]', err);
    return [];
  }
};

/**
 * Call the model and return normalized summary fields + quote entry match,
 * plus Compass suggestions when a Compass context was sent.
 * `complete` replaces the model call (tests); it resolves to the raw text.
 * @throws Error with code-like message prefixes for controller mapping
 */
const completeSummaryFromMessages = async ({
  messages,
  entries,
  signal,
  maxTokens = 2200,
  compass,
  complete = huggingFaceCompletion,
}) => {
  const modelId = getSummaryModelId();
  const raw = await complete({ messages, maxTokens, signal, modelId });
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
    compassSuggestions: compassSuggestionsFrom(raw, compass),
  };
};

export const generateWeeklySummaryContent = async ({
  entries,
  weekStart,
  weekEnd,
  locale = 'en',
  signal,
  compass,
  complete,
}) => {
  const messages = buildSummaryMessages({
    entries,
    weekStart,
    weekEnd,
    locale,
    compass,
  });
  return completeSummaryFromMessages({ messages, entries, signal, compass, complete });
};

export const generateWeeklySummaryRevision = async ({
  entries,
  weekStart,
  weekEnd,
  locale = 'en',
  generationCount,
  previousSummary,
  comments,
  signal,
  compass,
  complete,
}) => {
  const messages = buildRevisionMessages({
    entries,
    weekStart,
    weekEnd,
    locale,
    generationCount,
    previousSummary,
    comments,
    compass,
  });
  return completeSummaryFromMessages({ messages, entries, signal, compass, complete });
};

/** Anonymous preview: one entry, a shorter reflection, a smaller token budget. */
export const generateFirstReflectionContent = async ({
  content,
  locale = 'en',
  signal,
}) => {
  const entries = [{ id: 'first-entry', content, topics: [], createdAt: new Date() }];
  const messages = buildFirstReflectionMessages({ content, locale });
  return completeSummaryFromMessages({ messages, entries, signal, maxTokens: 900 });
};
