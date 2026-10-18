import { isSingleSentence } from "./isSingleSentence.js";

export const MAX_PQA_SENTENCE_LENGTH = 300;

/**
 * Validates the user's thought before it is sent to the LLM. The same rule
 * applies to typed input and to a client-supplied (possibly forged) session.
 */
export function isValidPqaSentence(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= MAX_PQA_SENTENCE_LENGTH &&
    isSingleSentence(trimmed)
  );
}
