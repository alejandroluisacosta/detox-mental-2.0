/** Split a weekly reflection into clickable paragraphs on blank lines. */
export const splitSummaryParagraphs = (text) => {
  if (typeof text !== 'string') return [];
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
};

export const truncateSummaryQuote = (text, max = 96) => {
  const normalized = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(max - 1, 1))}…`;
};
