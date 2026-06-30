// Persists thought-test answers to localStorage in an LLM-ready shape, so a
// later feature can read the full question/answer list and build a prompt
// without reshaping. One record per test id under `thoughtsTest:<testId>`.

const keyFor = (testId) => `thoughtsTest:${testId}`;

/**
 * Returns the stored record for a test, or null if none exists / it is invalid.
 * Shape: { testId, answers: [{ questionId, prompt, type, value }], updatedAt }
 */
export function getThoughtsTestAnswers(testId) {
  if (!testId) return null;
  try {
    const raw = localStorage.getItem(keyFor(testId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Upserts a single answer for a test. Re-answering the same question replaces
 * the previous value rather than appending a duplicate.
 */
export function saveThoughtsTestAnswer(testId, answer) {
  if (!testId || !answer?.questionId) return;

  const existing = getThoughtsTestAnswers(testId) ?? {
    testId,
    answers: [],
    updatedAt: 0,
  };

  const answers = existing.answers.filter(
    (a) => a.questionId !== answer.questionId
  );
  answers.push({
    questionId: answer.questionId,
    prompt: answer.prompt ?? "",
    type: answer.type ?? "text",
    value: answer.value ?? "",
  });

  const record = { testId, answers, updatedAt: Date.now() };

  try {
    localStorage.setItem(keyFor(testId), JSON.stringify(record));
  } catch {
    // Storage may be unavailable (private mode / quota); answers stay in state.
  }
}
