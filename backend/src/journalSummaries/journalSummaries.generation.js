import { InferenceClient } from '@huggingface/inference';
import { buildSummaryMessages } from './prompts.js';
import {
  findBestQuoteEntryId,
  parseSummaryOutput,
} from './parseSummaryOutput.js';

const DEFAULT_SUMMARY_MODEL = 'meta-llama/Llama-3.1-8B-Instruct:novita';

export const getSummaryModelId = () =>
  process.env.HF_JOURNAL_SUMMARY_MODEL || DEFAULT_SUMMARY_MODEL;

/**
 * Call HF and return normalized summary fields + quote entry match.
 * @throws Error with code-like message prefixes for controller mapping
 */
export const generateWeeklySummaryContent = async ({
  entries,
  weekStart,
  weekEnd,
}) => {
  if (!process.env.HF_TOKEN) {
    const err = new Error('missing_hf_token');
    err.code = 'missing_hf_token';
    throw err;
  }

  const modelId = getSummaryModelId();
  const client = new InferenceClient(process.env.HF_TOKEN);
  const messages = buildSummaryMessages({ entries, weekStart, weekEnd });

  // Long philosophical reflections (~700–1,100 Spanish words) need headroom
  // beyond the JSON fields for quote / topics / socratic.
  const response = await client.chatCompletion({
    model: modelId,
    messages,
    max_tokens: 3200,
    temperature: 0.5,
  });

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
