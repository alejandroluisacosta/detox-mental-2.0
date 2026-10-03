import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  MEDITATION_FRONT_MATTER_STORAGE_KEY,
  EMPTY_MEDITATION_FRONT_MATTER,
  introductionParagraphs,
  isBlankIntroduction,
  readDemoMeditationFrontMatter,
  writeDemoMeditationFrontMatter,
} from './meditationFrontMatter.js';

describe('meditationFrontMatter helpers', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  test('isBlankIntroduction treats empty, whitespace, and non-string as blank', () => {
    expect(isBlankIntroduction('')).toBe(true);
    expect(isBlankIntroduction('   ')).toBe(true);
    expect(isBlankIntroduction('\n\n')).toBe(true);
    expect(isBlankIntroduction(null)).toBe(true);
    expect(isBlankIntroduction('Hello')).toBe(false);
  });

  test('introductionParagraphs splits on blank lines and skips blank input', () => {
    expect(introductionParagraphs('Line one\nstill the first.\n\nSecond.')).toEqual([
      'Line one\nstill the first.',
      'Second.',
    ]);
    expect(introductionParagraphs('   ')).toEqual([]);
  });

  test('writeDemoMeditationFrontMatter merges without dropping other fields', () => {
    writeDemoMeditationFrontMatter({ title: 'Book', authorName: 'Ada' });
    writeDemoMeditationFrontMatter({ introduction: 'Prose' });
    expect(readDemoMeditationFrontMatter()).toEqual({
      title: 'Book',
      authorName: 'Ada',
      introduction: 'Prose',
    });
  });

  test('corrupt localStorage returns the empty record', () => {
    window.localStorage.setItem(MEDITATION_FRONT_MATTER_STORAGE_KEY, '{not json');
    expect(readDemoMeditationFrontMatter()).toEqual(EMPTY_MEDITATION_FRONT_MATTER);
  });

  test('helpers do not call fetch', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    readDemoMeditationFrontMatter();
    writeDemoMeditationFrontMatter({ introduction: 'x' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
