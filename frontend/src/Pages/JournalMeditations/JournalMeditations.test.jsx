import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalMeditations from './JournalMeditations.jsx';
import { apiFetch } from '../../api/client.js';
import { getDemoEntries } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import { translate } from '../../utils/translate.js';
import { formatPagesRemaining, pagesRemaining } from '../../utils/meditationPages.js';

const MEDITATIONS_TOPIC = 'meditations';

const filterMeditationEntries = (entries) =>
  entries
    .filter((entry) => Array.isArray(entry.topics) && entry.topics.includes(MEDITATIONS_TOPIC))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const word = (n) => Array.from({ length: n }, () => 'word').join(' ');

const mockUseAuth = vi.fn();
const mockUseDemoMode = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../Context/DemoModeContext.jsx', () => ({
  useDemoMode: () => mockUseDemoMode(),
}));

vi.mock('../../Components/Navigation/Navigation.jsx', () => ({
  default: () => null,
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/toastBus.js', () => ({ emitToast: vi.fn() }));

const renderMeditations = (locale = 'en') => {
  writeStoredLocale(locale);
  return render(
    <LocaleProvider>
      <JournalMeditations />
    </LocaleProvider>,
  );
};

const meditationEntry = (overrides) => ({
  topics: ['meditations'],
  createdAt: '2026-08-01T12:00:00.000Z',
  ...overrides,
});

const olderMeditationEntry = meditationEntry({
  id: 'e-old',
  content: 'Older meditation text.',
  createdAt: '2026-08-01T12:00:00.000Z',
});

const newerMeditationEntry = meditationEntry({
  id: 'e-new',
  content: 'Newer meditation text.',
  topics: ['meditations', 'private'],
  createdAt: '2026-08-02T12:00:00.000Z',
});

const removeButtonInSection = (contentText) => {
  const section = screen.getByText(contentText).closest('section');
  return within(section).getByRole('button', { name: 'Remove from meditations' });
};

const assertNoDeleteCalls = () => {
  expect(
    apiFetch.mock.calls.some(([, options]) => options?.method === 'DELETE'),
  ).toBe(false);
};

describe('JournalMeditations page states', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseDemoMode.mockReset();
    apiFetch.mockReset();
    mockUseDemoMode.mockReturnValue({
      demoMode: false,
      toggleDemoMode: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('demo mode shows the meditation demo text and hides other demo entries', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    renderMeditations();

    expect(
      screen.getByText(/Maybe I don't need a better plan/i),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Write' })).toHaveAttribute('href', '/journal');
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/journal/history');
    expect(screen.getByRole('link', { name: 'WRITE' })).toHaveAttribute('href', '/journal');
    expect(
      screen.queryByText(/Every time something stays ambiguous/i),
    ).toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('prompts guests to log in when demo mode is off', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });

    renderMeditations();

    expect(
      screen.getByText(/Sign in to read your meditation entries/i),
    ).toBeTruthy();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('loads meditation entries newest first without topic edit controls', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    const older = {
      id: 'e-old',
      content: 'Older meditation text.',
      topics: ['meditations'],
      createdAt: '2026-08-01T12:00:00.000Z',
    };
    const newer = {
      id: 'e-new',
      content: 'Newer meditation text.',
      topics: ['meditations', 'private'],
      createdAt: '2026-08-02T12:00:00.000Z',
    };

    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [newer, older] }),
    });

    renderMeditations();

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-entries?topic=meditations');
    });

    const body = screen.getByRole('article');
    expect(body.textContent.indexOf('Newer meditation text.')).toBeLessThan(
      body.textContent.indexOf('Older meditation text.'),
    );
    expect(screen.queryByLabelText(/Edit topics/i)).toBeNull();
  });

  test('shows the empty state when there are no meditation entries', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    renderMeditations();

    expect(
      await screen.findByText(/No entries are tagged as Meditations yet/i),
    ).toBeTruthy();
    expect(screen.getByText('in 24.0 pages')).toBeTruthy();
    expect(document.querySelector('.journal-meditations__book-icon')).toBeTruthy();
  });
});

describe('JournalMeditations remove from meditations', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseDemoMode.mockReset();
    apiFetch.mockReset();
    vi.mocked(emitToast).mockReset();
    mockUseDemoMode.mockReturnValue({
      demoMode: false,
      toggleDemoMode: vi.fn(),
    });
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
  });

  afterEach(() => {
    cleanup();
  });

  test('removes the meditations topic and keeps other topics via PATCH', async () => {
    apiFetch.mockImplementation(async (url, options = {}) => {
      if (url === '/auth/me/journal-entries?topic=meditations') {
        return {
          ok: true,
          json: async () => ({ entries: [newerMeditationEntry, olderMeditationEntry] }),
        };
      }
      if (url === '/auth/me/journal-entries/e-new' && options.method === 'PATCH') {
        expect(options.body).toEqual({ topics: ['private'] });
        return {
          ok: true,
          json: async () => ({
            entry: { ...newerMeditationEntry, topics: ['private'] },
          }),
        };
      }
      throw new Error(`Unexpected apiFetch: ${url} ${options.method || 'GET'}`);
    });

    renderMeditations();

    await waitFor(() => {
      expect(screen.getByText('Newer meditation text.')).toBeTruthy();
    });

    fireEvent.click(removeButtonInSection('Newer meditation text.'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, proceed' }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-entries/e-new', {
        method: 'PATCH',
        body: { topics: ['private'] },
      });
    });

    assertNoDeleteCalls();
    expect(screen.queryByText('Newer meditation text.')).toBeNull();
    expect(screen.getByText('Older meditation text.')).toBeTruthy();
  });

  test('PATCHes an empty topics list for meditations-only entries and shows empty state', async () => {
    const onlyEntry = meditationEntry({
      id: 'e-only',
      content: 'Only meditation text.',
    });

    apiFetch.mockImplementation(async (url, options = {}) => {
      if (url === '/auth/me/journal-entries?topic=meditations') {
        return { ok: true, json: async () => ({ entries: [onlyEntry] }) };
      }
      if (url === '/auth/me/journal-entries/e-only' && options.method === 'PATCH') {
        expect(options.body).toEqual({ topics: [] });
        return {
          ok: true,
          json: async () => ({ entry: { ...onlyEntry, topics: [] } }),
        };
      }
      throw new Error(`Unexpected apiFetch: ${url} ${options.method || 'GET'}`);
    });

    renderMeditations();

    await waitFor(() => {
      expect(screen.getByText('Only meditation text.')).toBeTruthy();
    });

    fireEvent.click(removeButtonInSection('Only meditation text.'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, proceed' }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-entries/e-only', {
        method: 'PATCH',
        body: { topics: [] },
      });
    });

    assertNoDeleteCalls();
    expect(
      await screen.findByText(/No entries are tagged as Meditations yet/i),
    ).toBeTruthy();
    expect(screen.queryByText('Only meditation text.')).toBeNull();
  });

  test('cancel closes the modal without PATCH and only loads entries once', async () => {
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [newerMeditationEntry, olderMeditationEntry] }),
    });

    renderMeditations();

    await waitFor(() => {
      expect(screen.getByText('Older meditation text.')).toBeTruthy();
    });

    fireEvent.click(removeButtonInSection('Older meditation text.'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Older meditation text.')).toBeTruthy();
    expect(screen.getByText('Newer meditation text.')).toBeTruthy();
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-entries?topic=meditations');
    assertNoDeleteCalls();
  });

  test('shows a toast and keeps the entry when PATCH fails', async () => {
    apiFetch.mockImplementation(async (url, options = {}) => {
      if (url === '/auth/me/journal-entries?topic=meditations') {
        return {
          ok: true,
          json: async () => ({ entries: [newerMeditationEntry, olderMeditationEntry] }),
        };
      }
      if (url === '/auth/me/journal-entries/e-old' && options.method === 'PATCH') {
        return {
          ok: false,
          json: async () => ({ message: 'Could not update topics.' }),
        };
      }
      throw new Error(`Unexpected apiFetch: ${url} ${options.method || 'GET'}`);
    });

    renderMeditations();

    await waitFor(() => {
      expect(screen.getByText('Older meditation text.')).toBeTruthy();
    });

    fireEvent.click(removeButtonInSection('Older meditation text.'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, proceed' }));

    await waitFor(() => {
      expect(emitToast).toHaveBeenCalledWith('Could not update topics.');
    });

    assertNoDeleteCalls();
    expect(screen.getByText('Older meditation text.')).toBeTruthy();
  });

  test('does not show remove controls or call the API in demo mode', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    renderMeditations();

    expect(screen.queryByRole('button', { name: 'Remove from meditations' })).toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('does not show remove controls or call the API for guests', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });

    renderMeditations();

    expect(screen.queryByRole('button', { name: 'Remove from meditations' })).toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
  });
});

describe('JournalMeditations pages-left countdown', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseDemoMode.mockReset();
    apiFetch.mockReset();
    mockUseDemoMode.mockReturnValue({
      demoMode: false,
      toggleDemoMode: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('shows pages left for a signed-in reader with 250 words of entries', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        entries: [
          {
            id: 'e-250',
            content: word(250),
            topics: ['meditations'],
            createdAt: '2026-08-01T12:00:00.000Z',
          },
        ],
      }),
    });

    renderMeditations();

    expect(await screen.findByText('in 23.0 pages')).toBeTruthy();
  });

  test('hides the countdown for guests', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });

    renderMeditations();

    expect(screen.queryByText(/in \d/i)).toBeNull();
    expect(document.querySelector('.journal-meditations__book-icon')).toBeNull();
  });

  test('hides the countdown until the entries request resolves', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    let resolveFetch;
    apiFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    renderMeditations();

    expect(screen.getByText(/Loading entries/i)).toBeTruthy();
    expect(screen.queryByText(/in \d/i)).toBeNull();
    expect(document.querySelector('.journal-meditations__book-icon')).toBeNull();

    resolveFetch({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    expect(await screen.findByText('in 24.0 pages')).toBeTruthy();
  });

  test('formats pages left in Spanish', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        entries: [
          {
            id: 'e-250',
            content: word(250),
            topics: ['meditations'],
            createdAt: '2026-08-01T12:00:00.000Z',
          },
        ],
      }),
    });

    renderMeditations('es');

    expect(await screen.findByText('en 23,0 páginas')).toBeTruthy();
  });

  test('shows a countdown in demo mode from demo meditation entries', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    const locale = 'en';
    const demoEntries = filterMeditationEntries(getDemoEntries(locale));
    const expected = translate(locale, 'meditations.pagesLeft', {
      pages: formatPagesRemaining(pagesRemaining(demoEntries), locale),
    });

    renderMeditations(locale);

    expect(screen.getByText(expected)).toBeTruthy();
  });
});
