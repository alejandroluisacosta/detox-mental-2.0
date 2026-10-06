const combiningMarks = /\p{M}/gu;

export const normalizeAnswer = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(combiningMarks, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

export const toAnswerList = (accepted) => {
  if (Array.isArray(accepted)) {
    return accepted.filter((value) => value != null && String(value).trim() !== '');
  }
  if (accepted == null || String(accepted).trim() === '') return [];
  return [accepted];
};

export const answersMatch = (accepted, input) => {
  const normalizedInput = normalizeAnswer(input);
  if (!normalizedInput) return false;
  return toAnswerList(accepted).some((value) => normalizeAnswer(value) === normalizedInput);
};
