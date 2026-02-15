const SURROUNDING_QUOTES = /^["\u201C\u201D]+|["\u201C\u201D]+$/g;

/**
 * Normalizes LLM output: strip surrounding quotes, trim, capitalize first letter.
 * Handles Spanish leading punctuation (e.g. ¿, ¡) so the first alphabetic character is capitalized.
 * @param { string } str - Raw LLM output.
 * @returns { string }
 */
export function normalizeLlmOutput(str) {
  if (typeof str !== "string") return "";
  let s = str.replace(SURROUNDING_QUOTES, "");
  s = s.trim();
  const firstLetterMatch = s.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/);
  if (firstLetterMatch && firstLetterMatch.index !== undefined) {
    const i = firstLetterMatch.index;
    s = s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1);
  }
  return s;
}
