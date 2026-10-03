import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import MeditationFrontMatter from './MeditationFrontMatter.jsx';

const renderPrint = (introduction) => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <MeditationFrontMatter introduction={introduction} />
    </LocaleProvider>,
  );
};

describe('MeditationFrontMatter', () => {
  afterEach(() => {
    cleanup();
  });

  test('print variant renders heading and paragraphs', () => {
    renderPrint('One.\n\nTwo.');
    expect(
      screen.getByRole('heading', { name: 'Introduction', level: 1, hidden: true }),
    ).toBeTruthy();
    const section = document.querySelector('.meditation-front-matter--print');
    expect(section).toBeTruthy();
    const paragraphs = section.querySelectorAll('.meditation-front-matter__paragraph');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].textContent).toBe('One.');
    expect(paragraphs[1].textContent).toBe('Two.');
  });

  test('print variant with blank introduction renders nothing', () => {
    renderPrint('   ');
    expect(screen.queryByRole('heading', { name: 'Introduction' })).toBeNull();
    expect(document.querySelector('.meditation-front-matter--print')).toBeNull();
  });
});
