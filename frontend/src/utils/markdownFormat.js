const clampIndex = (value, length) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(length, Math.trunc(value)));
};

const normalizeRange = (text, start, end) => {
  const length = text.length;
  const from = clampIndex(start, length);
  const to = clampIndex(end, length);
  return from <= to ? [from, to] : [to, from];
};

const replaceRange = (text, start, end, insertion) =>
  `${text.slice(0, start)}${insertion}${text.slice(end)}`;

export const wrapMarkdownEmphasis = (text, start, end, marker) => {
  const value = typeof text === 'string' ? text : '';
  const token = typeof marker === 'string' ? marker : '';
  const [lo, hi] = normalizeRange(value, start, end);
  const selected = value.slice(lo, hi);
  const placeholder = 'text';

  if (!token) {
    return { value, selectionStart: lo, selectionEnd: hi };
  }

  const before = value.slice(Math.max(0, lo - token.length), lo);
  const after = value.slice(hi, hi + token.length);
  if (selected && before === token && after === token) {
    return {
      value: replaceRange(value, lo - token.length, hi + token.length, selected),
      selectionStart: lo - token.length,
      selectionEnd: hi - token.length,
    };
  }

  if (
    selected.startsWith(token) &&
    selected.endsWith(token) &&
    selected.length > token.length * 2
  ) {
    const inner = selected.slice(token.length, selected.length - token.length);
    return {
      value: replaceRange(value, lo, hi, inner),
      selectionStart: lo,
      selectionEnd: lo + inner.length,
    };
  }

  const inner = selected || placeholder;
  const insertion = `${token}${inner}${token}`;
  return {
    value: replaceRange(value, lo, hi, insertion),
    selectionStart: lo + token.length,
    selectionEnd: lo + token.length + inner.length,
  };
};

export const wrapMarkdownLink = (text, start, end, url = 'https://') => {
  const value = typeof text === 'string' ? text : '';
  const href = typeof url === 'string' && url ? url : 'https://';
  const [lo, hi] = normalizeRange(value, start, end);
  const selected = value.slice(lo, hi);
  const label = selected || 'link text';
  const insertion = `[${label}](${href})`;
  const next = replaceRange(value, lo, hi, insertion);

  if (selected) {
    const urlStart = lo + label.length + 3;
    return {
      value: next,
      selectionStart: urlStart,
      selectionEnd: urlStart + href.length,
    };
  }

  return {
    value: next,
    selectionStart: lo + 1,
    selectionEnd: lo + 1 + label.length,
  };
};
