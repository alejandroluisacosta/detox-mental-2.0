import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const group = () => screen.getByRole('group');

describe('LanguageSwitcher', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  test('the sliding highlight follows the selected language', () => {
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>,
    );
    expect(group().style.getPropertyValue('--language-index')).toBe('0');

    fireEvent.click(screen.getByRole('button', { name: 'Spanish' }));
    expect(group().style.getPropertyValue('--language-index')).toBe('1');

    fireEvent.click(screen.getByRole('button', { name: 'Inglés' }));
    expect(group().style.getPropertyValue('--language-index')).toBe('0');
  });
});
