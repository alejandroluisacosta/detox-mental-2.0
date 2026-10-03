import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalMeditations from './JournalMeditations.jsx';
import { apiFetch } from '../../api/client.js';
import { getDemoEntries } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import { translate } from '../../utils/translate.js';
import {
  MEDITATION_GOAL_STORAGE_KEY,
  MEDITATION_GOALS,
  formatPagesRemaining,
  pagesRemaining,
  writeMeditationProgressGoal,
} from '../../utils/meditationPages.js';
import { filterMeditationEntriesNewestFirst } from '../../utils/meditationEntries.js';

const filterMeditationEntries = filterMeditationEntriesNewestFirst;

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

const screenFeed = () => screen.getByRole('article', { name: 'Meditations feed' });

const removeButtonInSection = (contentText) => {
  const section = within(screenFeed()).getByText(contentText).closest('section');
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
      within(screenFeed()).getByText(/Maybe I don't need a better plan/i),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Write' })).toHaveAttribute('href', '/journal');
    expect(screen.queryByRole('link', { name: 'History' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Print / PDF' })).toBeTruthy();
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

    const body = screenFeed();
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
    expect(document.querySelector('.journal-meditations__progress-dropdown-icon')).toBeTruthy();
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
      expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
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
    expect(within(screenFeed()).queryByText('Newer meditation text.')).toBeNull();
    expect(within(screenFeed()).getByText('Older meditation text.')).toBeTruthy();
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
      expect(within(screenFeed()).getByText('Only meditation text.')).toBeTruthy();
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
    expect(screen.queryByRole('article', { name: 'Meditations feed' })).toBeNull();
  });

  test('cancel closes the modal without PATCH and only loads entries once', async () => {
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [newerMeditationEntry, olderMeditationEntry] }),
    });

    renderMeditations();

    await waitFor(() => {
      expect(within(screenFeed()).getByText('Older meditation text.')).toBeTruthy();
    });

    fireEvent.click(removeButtonInSection('Older meditation text.'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(within(screenFeed()).getByText('Older meditation text.')).toBeTruthy();
    expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
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
      expect(within(screenFeed()).getByText('Older meditation text.')).toBeTruthy();
    });

    fireEvent.click(removeButtonInSection('Older meditation text.'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, proceed' }));

    await waitFor(() => {
      expect(emitToast).toHaveBeenCalledWith('Could not update topics.');
    });

    assertNoDeleteCalls();
    expect(within(screenFeed()).getByText('Older meditation text.')).toBeTruthy();
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
    window.localStorage.clear();
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

  test('opens the goal menu and shows the 25 entries indicator', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    renderMeditations();

    expect(await screen.findByText('in 24.0 pages')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Meditation progress goal' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '25 entries' }));

    expect(screen.getByRole('button', { name: 'Meditation progress goal' })).toHaveTextContent(
      '25 entries left toward 25',
    );
    expect(screen.getByRole('status')).toHaveTextContent('25 entries left toward 25');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(window.localStorage.getItem(MEDITATION_GOAL_STORAGE_KEY)).toBe(MEDITATION_GOALS.ENTRIES_25);
    expect(document.querySelector('.journal-meditations__target-icon')).toBeTruthy();
    expect(document.querySelector('.journal-meditations__progress-dropdown-icon')).toBeTruthy();
  });

  test('restores the selected goal from localStorage', async () => {
    writeMeditationProgressGoal(MEDITATION_GOALS.ENTRIES_50);
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    renderMeditations();

    expect(await screen.findByText('50 entries left toward 50')).toBeTruthy();
    expect(document.querySelector('.journal-meditations__book-icon')).toBeNull();
    expect(document.querySelector('.journal-meditations__target-icon')).toBeTruthy();
    expect(document.querySelector('.journal-meditations__progress-dropdown-icon')).toBeTruthy();
  });

  test('hides the dropdown hint while the goal menu is open', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    renderMeditations();
    await screen.findByText('in 24.0 pages');

    expect(document.querySelector('.journal-meditations__progress-dropdown-icon')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Meditation progress goal' }));
    expect(document.querySelector('.journal-meditations__progress-dropdown-icon')).toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.querySelector('.journal-meditations__progress-dropdown-icon')).toBeTruthy();
  });

  test('closes the goal menu on Escape', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    renderMeditations();
    await screen.findByText('in 24.0 pages');

    fireEvent.click(screen.getByRole('button', { name: 'Meditation progress goal' }));
    expect(screen.getByRole('menu')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('JournalMeditations print export', () => {
  const printButtonName = 'Print / PDF';

  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseDemoMode.mockReset();
    apiFetch.mockReset();
    mockUseDemoMode.mockReturnValue({
      demoMode: false,
      toggleDemoMode: vi.fn(),
    });
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.mocked(window.print).mockRestore();
  });

  test('hides print for guests and empty signed-in states', async () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderMeditations();
    expect(screen.queryByRole('button', { name: printButtonName })).toBeNull();

    cleanup();
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });
    renderMeditations();
    await screen.findByText(/No entries are tagged as Meditations yet/i);
    expect(screen.queryByRole('button', { name: printButtonName })).toBeNull();
  });

  test('shows print when signed-in user has meditation entries and triggers window.print', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [newerMeditationEntry, olderMeditationEntry] }),
    });

    renderMeditations();
    await waitFor(() => {
      expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
    });

    const printButton = screen.getByRole('button', { name: printButtonName });
    fireEvent.click(printButton);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  test('orders print-only content oldest first while screen feed stays newest first', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [newerMeditationEntry, olderMeditationEntry] }),
    });

    renderMeditations();
    await waitFor(() => {
      expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
    });

    const feed = screenFeed();
    expect(feed.textContent.indexOf('Newer meditation text.')).toBeLessThan(
      feed.textContent.indexOf('Older meditation text.'),
    );

    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot).toBeTruthy();
    expect(printRoot.style.display).toBe('none');
    const printSections = printRoot.querySelectorAll('.journal-meditations__section');
    expect(printSections[0].textContent).toContain('Older meditation text.');
    expect(printSections[printSections.length - 1].textContent).toContain('Newer meditation text.');
  });

  test('shows print in demo mode when demo meditations are visible', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    renderMeditations();
    expect(screen.getByRole('button', { name: printButtonName })).toBeTruthy();
  });
});
