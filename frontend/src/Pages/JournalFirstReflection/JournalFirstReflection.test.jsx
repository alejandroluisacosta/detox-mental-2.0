import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import { FIRST_REFLECTION_STORAGE_KEY } from '../../utils/firstReflection.js';
import JournalFirstReflection from './JournalFirstReflection.jsx';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('../../Components/Navigation/Navigation.jsx', () => ({
  default: () => null,
}));

const DAY_MS = 24 * 60 * 60 * 1000;

const REFLECTION = {
  summaryText: 'You name the avoidance yourself.\n\nThe question is what follows.',
  mainTopics: ['work'],
  bestQuote: 'I keep postponing the conversation',
  socraticText: 'What would it cost to have it this week?',
  machiavelliText: 'Delay protects comfort, not the goal.',
};

const store = (savedAt) => {
  window.localStorage.setItem(
    FIRST_REFLECTION_STORAGE_KEY,
    JSON.stringify({ reflection: REFLECTION, savedAt }),
  );
};

const renderPage = () => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <JournalFirstReflection />
    </LocaleProvider>,
  );
};

describe('JournalFirstReflection', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('shows the stored reflection as a preview with a way to create an account', () => {
    store(new Date().toISOString());
    renderPage();

    expect(screen.getByText('You name the avoidance yourself.')).toBeTruthy();
    expect(screen.getByText('The question is what follows.')).toBeTruthy();
    expect(screen.getByText('What would it cost to have it this week?')).toBeTruthy();
    expect(screen.getByText(/preview of the weekly summary/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'CREATE AN ACCOUNT' }).getAttribute('href')).toBe(
      '/login',
    );
  });

  test('a reflection older than 7 days is gone and removed from the browser', () => {
    store(new Date(Date.now() - 8 * DAY_MS).toISOString());
    renderPage();

    expect(screen.queryByText('You name the avoidance yourself.')).toBeNull();
    expect(screen.getByRole('link', { name: 'Write your first entry' }).getAttribute('href')).toBe(
      '/journal',
    );
    expect(window.localStorage.getItem(FIRST_REFLECTION_STORAGE_KEY)).toBeNull();
  });

  test('corrupted storage shows the empty state instead of crashing', () => {
    window.localStorage.setItem(FIRST_REFLECTION_STORAGE_KEY, '{not json');
    renderPage();

    expect(screen.getByRole('link', { name: 'Write your first entry' })).toBeTruthy();
  });
});
