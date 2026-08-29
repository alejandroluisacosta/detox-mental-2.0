import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider, useLocale } from './LocaleContext.jsx';

const Probe = () => {
  const { locale, setLocale, t } = useLocale();
  return (
    <div>
      <p>{t('journal.prompt')}</p>
      <p data-testid="locale">{locale}</p>
      <button type="button" onClick={() => setLocale('es')}>
        to-es
      </button>
    </div>
  );
};

describe('LocaleProvider', () => {
  afterEach(() => {
    cleanup();
  });

  test('defaults to English and updates document language', () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    expect(screen.getByText("What's on your mind?")).toBeTruthy();
    expect(document.documentElement.lang).toBe('en');
  });

  test('persists a language change', () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'to-es' }));
    expect(screen.getByText('¿Qué tienes en mente?')).toBeTruthy();
    expect(document.documentElement.lang).toBe('es');
    expect(window.localStorage.getItem('appLocale')).toBe('es');
  });
});
