export const MEDITATION_FRONT_MATTER_STORAGE_KEY = 'journalMeditations:frontMatter';

export const EMPTY_MEDITATION_FRONT_MATTER = {
  title: '',
  authorName: '',
  introduction: '',
  titleUsesDefault: true,
};

export const normalizeMeditationFrontMatter = (raw) => ({
  title: typeof raw?.title === 'string' ? raw.title : '',
  authorName: typeof raw?.authorName === 'string' ? raw.authorName : '',
  introduction: typeof raw?.introduction === 'string' ? raw.introduction : '',
  titleUsesDefault: raw?.titleUsesDefault !== false,
});

export const readDemoMeditationFrontMatter = () => {
  try {
    const stored = window.localStorage.getItem(MEDITATION_FRONT_MATTER_STORAGE_KEY);
    if (!stored) return { ...EMPTY_MEDITATION_FRONT_MATTER };
    const parsed = JSON.parse(stored);
    return normalizeMeditationFrontMatter(parsed);
  } catch {
    return { ...EMPTY_MEDITATION_FRONT_MATTER };
  }
};

export const writeDemoMeditationFrontMatter = (partial) => {
  const current = readDemoMeditationFrontMatter();
  const next = normalizeMeditationFrontMatter({
    ...current,
    ...partial,
    ...(Object.prototype.hasOwnProperty.call(partial, 'title')
      ? { titleUsesDefault: false }
      : {}),
  });
  try {
    window.localStorage.setItem(
      MEDITATION_FRONT_MATTER_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // ignore storage errors
  }
  return next;
};

export const isBlankIntroduction = (value) =>
  typeof value !== 'string' || value.trim() === '';

export const introductionParagraphs = (value) => {
  if (isBlankIntroduction(value)) return [];
  return value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
};
