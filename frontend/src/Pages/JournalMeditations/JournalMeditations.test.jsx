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
import { MEDITATION_FRONT_MATTER_STORAGE_KEY } from '../../utils/meditationFrontMatter.js';

const filterMeditationEntries = filterMeditationEntriesNewestFirst;

const EMPTY_FRONT_MATTER = {
  title: '',
  authorName: '',
  introduction: '',
  titleUsesDefault: true,
};

const meditationsApiHandler = ({
  entries = [],
  frontMatter = EMPTY_FRONT_MATTER,
  patchFrontMatter,
} = {}) =>
  async (url, options = {}) => {
    if (url === '/auth/me/journal-entries?topic=meditations') {
      return { ok: true, json: async () => ({ entries }) };
    }
    if (url === '/auth/me/journal-meditation-front-matter') {
      if (options.method === 'PATCH') {
        if (patchFrontMatter) return patchFrontMatter(options);
        const next = {
          title:
            options.body?.title !== undefined ? options.body.title : frontMatter.title,
          authorName:
            options.body?.authorName !== undefined
              ? options.body.authorName
              : frontMatter.authorName,
          introduction:
            options.body?.introduction !== undefined
              ? options.body.introduction
              : frontMatter.introduction,
          titleUsesDefault:
            options.body?.title !== undefined ? false : frontMatter.titleUsesDefault ?? true,
        };
        return { ok: true, json: async () => ({ frontMatter: next }) };
      }
      return { ok: true, json: async () => ({ frontMatter }) };
    }
    return undefined;
  };

const installMeditationsApiMock = (config, extraHandler) => {
  apiFetch.mockImplementation(async (url, options = {}) => {
    if (extraHandler) {
      const extra = await extraHandler(url, options);
      if (extra !== undefined) return extra;
    }
    const base = await meditationsApiHandler(config)(url, options);
    if (base !== undefined) return base;
    throw new Error(`Unexpected apiFetch: ${url} ${options.method || 'GET'}`);
  });
};

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

const bookButtonName = 'Book';

const openBookModal = async () => {
  const bookButton = await screen.findByRole('button', { name: bookButtonName });
  fireEvent.click(bookButton);
  return screen.findByRole('dialog');
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
    expect(screen.getByRole('button', { name: bookButtonName })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Print / PDF' })).toBeNull();
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

    installMeditationsApiMock({ entries: [newer, older] });

    renderMeditations();

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-entries?topic=meditations');
      expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-meditation-front-matter');
    });

    const body = screenFeed();
    expect(body.textContent.indexOf('Newer meditation text.')).toBeLessThan(
      body.textContent.indexOf('Older meditation text.'),
    );
    expect(screen.queryByLabelText(/Edit topics/i)).toBeNull();
  });

  test('shows the empty state when there are no meditation entries', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [] });

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
    installMeditationsApiMock(
      { entries: [newerMeditationEntry, olderMeditationEntry] },
      async (url, options = {}) => {
        if (url === '/auth/me/journal-entries/e-new' && options.method === 'PATCH') {
          expect(options.body).toEqual({ topics: ['private'] });
          return {
            ok: true,
            json: async () => ({
              entry: { ...newerMeditationEntry, topics: ['private'] },
            }),
          };
        }
        return undefined;
      },
    );

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

    installMeditationsApiMock({ entries: [onlyEntry] }, async (url, options = {}) => {
      if (url === '/auth/me/journal-entries/e-only' && options.method === 'PATCH') {
        expect(options.body).toEqual({ topics: [] });
        return {
          ok: true,
          json: async () => ({ entry: { ...onlyEntry, topics: [] } }),
        };
      }
      return undefined;
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
    installMeditationsApiMock({ entries: [newerMeditationEntry, olderMeditationEntry] });

    renderMeditations();

    await waitFor(() => {
      expect(within(screenFeed()).getByText('Older meditation text.')).toBeTruthy();
    });

    fireEvent.click(removeButtonInSection('Older meditation text.'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(within(screenFeed()).getByText('Older meditation text.')).toBeTruthy();
    expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-entries?topic=meditations');
    expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-meditation-front-matter');
    assertNoDeleteCalls();
  });

  test('shows a toast and keeps the entry when PATCH fails', async () => {
    installMeditationsApiMock(
      { entries: [newerMeditationEntry, olderMeditationEntry] },
      async (url, options = {}) => {
        if (url === '/auth/me/journal-entries/e-old' && options.method === 'PATCH') {
          return {
            ok: false,
            json: async () => ({ message: 'Could not update topics.' }),
          };
        }
        return undefined;
      },
    );

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
    installMeditationsApiMock({
      entries: [
        {
          id: 'e-250',
          content: word(250),
          topics: ['meditations'],
          createdAt: '2026-08-01T12:00:00.000Z',
        },
      ],
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
    apiFetch.mockImplementation((url) => {
      if (url === '/auth/me/journal-entries?topic=meditations') {
        return new Promise((resolve) => {
          resolveFetch = resolve;
        });
      }
      return meditationsApiHandler()(
        url,
        {},
      );
    });

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
    installMeditationsApiMock({
      entries: [
        {
          id: 'e-250',
          content: word(250),
          topics: ['meditations'],
          createdAt: '2026-08-01T12:00:00.000Z',
        },
      ],
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
    installMeditationsApiMock({ entries: [] });

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
    installMeditationsApiMock({ entries: [] });

    renderMeditations();

    expect(await screen.findByText('50 entries left toward 50')).toBeTruthy();
    expect(document.querySelector('.journal-meditations__book-icon')).toBeNull();
    expect(document.querySelector('.journal-meditations__target-icon')).toBeTruthy();
    expect(document.querySelector('.journal-meditations__progress-dropdown-icon')).toBeTruthy();
  });

  test('hides the dropdown hint while the goal menu is open', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [] });

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
    installMeditationsApiMock({ entries: [] });

    renderMeditations();
    await screen.findByText('in 24.0 pages');

    fireEvent.click(screen.getByRole('button', { name: 'Meditation progress goal' }));
    expect(screen.getByRole('menu')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('JournalMeditations print export', () => {
  const pdfButtonName = 'PDF';

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

  test('hides Book for guests and empty signed-in states', async () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderMeditations();
    expect(screen.queryByRole('button', { name: bookButtonName })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Print / PDF' })).toBeNull();

    cleanup();
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [] });
    renderMeditations();
    await screen.findByText(/No entries are tagged as Meditations yet/i);
    expect(screen.queryByRole('button', { name: bookButtonName })).toBeNull();
  });

  test('PDF in the Book modal triggers window.print without saving', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [newerMeditationEntry, olderMeditationEntry] });

    renderMeditations();
    await waitFor(() => {
      expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
    });

    await openBookModal();
    fireEvent.click(screen.getByRole('button', { name: pdfButtonName }));
    expect(window.print).toHaveBeenCalledTimes(1);
    expect(apiFetch.mock.calls.filter(([, options]) => options?.method === 'PATCH')).toHaveLength(
      0,
    );
  });

  test('orders print-only content oldest first while screen feed stays newest first', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [newerMeditationEntry, olderMeditationEntry] });

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

  test('shows Book in demo mode when demo meditations are visible', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    renderMeditations();
    expect(screen.getByRole('button', { name: bookButtonName })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Print / PDF' })).toBeNull();
  });

  test('prints a cover with localized title, saved author, and year span', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'writer@example.com' },
      status: 'ready',
    });
    installMeditationsApiMock({
      entries: [
        meditationEntry({
          id: 'e-new',
          content: 'Newer meditation text.',
          createdAt: '2026-06-15T12:00:00.000Z',
        }),
        meditationEntry({
          id: 'e-old',
          content: 'Older meditation text.',
          createdAt: '2024-06-15T12:00:00.000Z',
        }),
      ],
      frontMatter: {
        title: '',
        authorName: 'Ada Lovelace',
        introduction: '',
        titleUsesDefault: true,
      },
    });

    renderMeditations();
    await waitFor(() => {
      expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
    });

    const printRoot = document.querySelector('.journal-meditations__print-root');
    await waitFor(() => {
      expect(printRoot.querySelector('.meditation-print-cover__author')?.textContent).toBe(
        'Ada Lovelace',
      );
    });
    const coverTitle = printRoot.querySelector('.meditation-print-cover__title');
    expect(coverTitle.textContent).toBe('Meditations');
    expect(printRoot.querySelector('.meditation-print-cover__years').textContent).toBe(
      '2024 – 2026',
    );
    expect(printRoot.textContent).not.toContain('writer@example.com');
    expect(printRoot.querySelector('.journal-meditations__print-subtitle')).toBeNull();
    expect(printRoot.textContent).not.toMatch(/\bwords\b ·/i);
    expect(printRoot.textContent).not.toContain('palabras ·');

    const children = Array.from(printRoot.children);
    expect(children[0].classList.contains('meditation-print-cover')).toBe(true);
    expect(children[1].getAttribute('data-slot')).toBe('meditation-print-introduction');
    expect(children[2].classList.contains('journal-meditations__compilation--print')).toBe(
      true,
    );
  });

  test('uses Meditaciones on the print cover in Spanish when title is blank', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({
      entries: [olderMeditationEntry],
      frontMatter: EMPTY_FRONT_MATTER,
    });

    renderMeditations('es');
    await waitFor(() => {
      expect(
        screen.getByRole('article', { name: 'Feed de meditaciones' }).textContent,
      ).toContain('Older meditation text.');
    });

    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot.querySelector('.meditation-print-cover__title').textContent).toBe(
      'Meditaciones',
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Meditaciones' })).toBeTruthy();
  });

  test('updates the print cover after Save and PDF in the Book modal', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [newerMeditationEntry] });

    renderMeditations();
    await screen.findByRole('article', { name: 'Meditations feed' });

    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot.querySelector('.meditation-print-cover__title').textContent).toBe(
      'Meditations',
    );

    await openBookModal();
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Quiet Book' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Author' }), {
      target: { value: 'Writer' },
    });
    fireEvent.blur(screen.getByRole('textbox', { name: 'Title' }));
    expect(printRoot.querySelector('.meditation-print-cover__title').textContent).toBe(
      'Meditations',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save and PDF' }));
    await waitFor(() => {
      expect(printRoot.querySelector('.meditation-print-cover__title').textContent).toBe(
        'Quiet Book',
      );
      expect(printRoot.querySelector('.meditation-print-cover__author').textContent).toBe(
        'Writer',
      );
    });
    expect(window.print).toHaveBeenCalled();
  });

  test('demo mode prints cover year without calling front-matter API', async () => {
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });

    renderMeditations();
    expect(screen.getByRole('button', { name: bookButtonName })).toBeTruthy();

    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot.querySelector('.meditation-print-cover__years').textContent).toBe('2026');
    expect(printRoot.querySelector('.meditation-print-cover__author')).toBeNull();
    expect(
      apiFetch.mock.calls.some(([url]) => url.includes('journal-meditation-front-matter')),
    ).toBe(false);
  });

  test('prints localized title while titleUsesDefault is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({
      entries: [newerMeditationEntry],
      frontMatter: { ...EMPTY_FRONT_MATTER },
    });

    renderMeditations();
    await screen.findByRole('article', { name: 'Meditations feed' });
    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot.querySelector('.meditation-print-cover__title').textContent).toBe(
      'Meditations',
    );
  });

  test('collapses cover years to a single year', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({
      entries: [
        meditationEntry({
          id: 'a',
          content: 'A',
          createdAt: '2026-08-01T12:00:00.000Z',
        }),
        meditationEntry({
          id: 'b',
          content: 'B',
          createdAt: '2026-06-15T12:00:00.000Z',
        }),
      ],
    });

    renderMeditations();
    await screen.findByRole('article', { name: 'Meditations feed' });
    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot.querySelector('.meditation-print-cover__years').textContent).toBe('2026');
    expect(printRoot.textContent).not.toContain('2026 – 2026');
  });

  test('omits the cover title after the user saves an empty title', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({
      entries: [newerMeditationEntry],
      frontMatter: { title: '', authorName: '', introduction: '', titleUsesDefault: false },
    });

    renderMeditations();
    await screen.findByRole('article', { name: 'Meditations feed' });
    const printRoot = document.querySelector('.journal-meditations__print-root');
    await waitFor(() => {
      expect(printRoot.querySelector('.meditation-print-cover__title')).toBeNull();
    });
  });
});

describe('JournalMeditations introduction', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseDemoMode.mockReset();
    apiFetch.mockReset();
    vi.mocked(emitToast).mockReset();
    window.localStorage.clear();
    mockUseDemoMode.mockReturnValue({
      demoMode: false,
      toggleDemoMode: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('loads front matter for signed-in users and shows introduction in the Book modal', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [newerMeditationEntry, olderMeditationEntry] });

    renderMeditations();
    await screen.findByRole('article', { name: 'Meditations feed' });
    expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-meditation-front-matter');

    await openBookModal();
    expect(screen.getByRole('textbox', { name: 'Introduction' })).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Introduction' }).closest('article')).toBeNull();
  });

  test('guests do not see the Book button or call front matter', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderMeditations();
    expect(screen.queryByRole('button', { name: bookButtonName })).toBeNull();
    expect(
      apiFetch.mock.calls.some(([url]) => url.includes('journal-meditation-front-matter')),
    ).toBe(false);
  });

  test('signed-in user with no entries does not see the Book button', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [] });
    renderMeditations();
    await screen.findByText(/No entries are tagged as Meditations yet/i);
    expect(screen.queryByRole('button', { name: bookButtonName })).toBeNull();
  });

  test('demo mode shows Book modal without calling the front-matter API', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });
    renderMeditations();
    await openBookModal();
    expect(screen.getByRole('textbox', { name: 'Introduction' })).toBeTruthy();
    expect(
      apiFetch.mock.calls.some(([url]) => url.includes('journal-meditation-front-matter')),
    ).toBe(false);
  });

  test('prints saved introduction before entries in oldest-first order', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({
      entries: [newerMeditationEntry, olderMeditationEntry],
      frontMatter: { ...EMPTY_FRONT_MATTER, introduction: 'One.\n\nTwo.' },
    });

    renderMeditations();
    await waitFor(() => {
      expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
    });

    const printRoot = document.querySelector('.journal-meditations__print-root');
    await waitFor(() => {
      expect(printRoot.querySelectorAll('.meditation-front-matter__paragraph')).toHaveLength(2);
    });
    expect(printRoot.textContent.indexOf('Introduction')).toBeLessThan(
      printRoot.textContent.indexOf('Older meditation text.'),
    );

    const feed = screenFeed();
    expect(feed.textContent.indexOf('Newer meditation text.')).toBeLessThan(
      feed.textContent.indexOf('Older meditation text.'),
    );
  });

  test('omits print introduction when saved text is blank', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({
      entries: [newerMeditationEntry, olderMeditationEntry],
      frontMatter: { ...EMPTY_FRONT_MATTER, introduction: '   ' },
    });

    renderMeditations();
    await waitFor(() => {
      expect(within(screenFeed()).getByText('Newer meditation text.')).toBeTruthy();
    });

    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot.querySelector('.meditation-front-matter--print')).toBeNull();
    const printSections = printRoot.querySelectorAll('.journal-meditations__section');
    expect(printSections[0].textContent).toContain('Older meditation text.');
  });

  test('Save introduction PATCHes only introduction', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({ entries: [newerMeditationEntry] });

    renderMeditations();
    await screen.findByRole('article', { name: 'Meditations feed' });
    await openBookModal();
    const textarea = screen.getByRole('textbox', { name: 'Introduction' });
    fireEvent.change(textarea, { target: { value: 'Fresh intro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and PDF' }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-meditation-front-matter', {
        method: 'PATCH',
        body: { introduction: 'Fresh intro' },
      });
    });

    fireEvent.blur(textarea);
    const patchCalls = apiFetch.mock.calls.filter(
      ([, options]) => options?.method === 'PATCH',
    );
    expect(patchCalls).toHaveLength(1);
  });

  test('failed PATCH keeps draft and toasts save failure', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock(
      { entries: [newerMeditationEntry] },
      async (url, options = {}) => {
        if (url === '/auth/me/journal-meditation-front-matter' && options.method === 'PATCH') {
          return {
            ok: false,
            json: async () => ({ message: 'Server said no.' }),
          };
        }
        return undefined;
      },
    );

    renderMeditations();
    await screen.findByRole('article', { name: 'Meditations feed' });
    await openBookModal();
    const textarea = screen.getByRole('textbox', { name: 'Introduction' });
    fireEvent.change(textarea, { target: { value: 'Draft stays' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and PDF' }));

    await waitFor(() => {
      expect(emitToast).toHaveBeenCalledWith('Server said no.');
    });
    expect(textarea).toHaveValue('Draft stays');
  });

  test('demo mode saves introduction to localStorage without apiFetch', async () => {
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });

    renderMeditations();
    await openBookModal();
    const textarea = screen.getByRole('textbox', { name: 'Introduction' });
    fireEvent.change(textarea, { target: { value: 'Demo prose' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and PDF' }));

    await waitFor(() => {
      expect(emitToast).toHaveBeenCalledWith('Introduction saved.');
    });
    expect(apiFetch).not.toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem(MEDITATION_FRONT_MATTER_STORAGE_KEY))).toEqual({
      title: '',
      authorName: '',
      introduction: 'Demo prose',
      titleUsesDefault: true,
    });

    cleanup();
    renderMeditations();
    await openBookModal();
    expect(screen.getByRole('textbox', { name: 'Introduction' })).toHaveValue('Demo prose');
    const printRoot = document.querySelector('.journal-meditations__print-root');
    expect(printRoot.textContent).toContain('Demo prose');
  });

  test('Spanish locale prints Introducción heading when introduction is saved', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    installMeditationsApiMock({
      entries: [olderMeditationEntry],
      frontMatter: { ...EMPTY_FRONT_MATTER, introduction: 'Hola.' },
    });

    renderMeditations('es');
    await waitFor(() => {
      expect(
        screen.getByRole('article', { name: 'Feed de meditaciones' }).textContent,
      ).toContain('Older meditation text.');
    });

    const printRoot = document.querySelector('.journal-meditations__print-root');
    await waitFor(() => {
      expect(printRoot.textContent).toContain('Introducción');
      expect(printRoot.textContent).toContain('Hola.');
    });
  });
});
