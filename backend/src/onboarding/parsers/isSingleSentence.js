export function isSingleSentence(text) {
  const trimmed = text.trim();

  const sentenceEndings = trimmed.match(/[.!?]/g) || [];

  return sentenceEndings.length <= 1 && trimmed.length > 0;
}
