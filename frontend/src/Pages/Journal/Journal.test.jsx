import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import { JOURNAL_TOPIC_IDS } from '../../data/journalTopics.js';
import { emitToast } from '../../lib/toastBus.js';
import Journal from './Journal.jsx';

const mockUseAuth = vi.fn();
const mockUseDemoMode = vi.fn();
const mockUseJournalTopics = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../Context/DemoModeContext.jsx', () => ({
  useDemoMode: () => mockUseDemoMode(),
}));

vi.mock('../../Context/JournalTopicsContext.jsx', () => ({
  useJournalTopics: () => mockUseJournalTopics(),
}));

vi.mock('../../Components/Navigation/Navigation.jsx', () => ({
  default: () => null,
}));

vi.mock('../../Components/CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

vi.mock('../../Components/JournalTopicNameModal/JournalTopicNameModal.jsx', () => ({
  default: ({ title, initialName }) => (
    <div role="dialog" aria-label={title}>
      <span>{initialName}</span>
    </div>
  ),
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/toastBus.js', () => ({ emitToast: vi.fn() }));

const defaultTopicsValue = {
  customTopics: [],
  allTopics: JOURNAL_TOPIC_IDS,
  status: 'ready',
  createTopic: vi.fn(),
  renameTopic: vi.fn(),
};

const renderJournal = (locale = 'en') => {
  writeStoredLocale(locale);
  return render(
    <LocaleProvider>
      <Journal />
    </LocaleProvider>,
  );
};

const mockScrollMetrics = (el, { scrollLeft, clientWidth, scrollWidth }) => {
  Object.defineProperty(el, 'scrollLeft', {
    configurable: true,
    get: () => scrollLeft,
  });
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get: () => clientWidth,
  });
  Object.defineProperty(el, 'scrollWidth', {
    configurable: true,
    get: () => scrollWidth,
  });
};

describe('Journal handwriting capture gating', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseDemoMode.mockReset();
    mockUseJournalTopics.mockReset();
    emitToast.mockReset();
    mockUseDemoMode.mockReturnValue({ demoMode: false, toggleDemoMode: vi.fn() });
    mockUseJournalTopics.mockReturnValue(defaultTopicsValue);
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });

  afterEach(() => {
    cleanup();
  });

  test('hides the scan control for guests', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderJournal();
    expect(screen.queryByRole('button', { name: /Scan handwriting/i })).toBeNull();
  });

  test('shows the scan control for signed-in users', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    renderJournal();
    expect(screen.getByRole('button', { name: /Scan handwriting/i })).toBeTruthy();
  });

  test('hides the scan control while auth is still loading', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'loading' });
    renderJournal();
    expect(screen.queryByRole('button', { name: /Scan handwriting/i })).toBeNull();
  });

  test('renders history as an accent icon link', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderJournal();
    const link = screen.getByRole('link', { name: 'View history' });
    expect(link.getAttribute('href')).toBe('/journal/history');
    expect(screen.queryByText('View history')).toBeNull();
    expect(screen.getByText('History')).toBeTruthy();
    expect(link.querySelector('.journal-page__history-icon')).toBeTruthy();
  });

  test('shows the Spanish history label next to the icon', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderJournal('es');
    const link = screen.getByRole('link', { name: 'Ver historial' });
    expect(link.getAttribute('href')).toBe('/journal/history');
    expect(screen.getByText('Historial')).toBeTruthy();
  });

  test('shows localized topic labels while keeping topic slugs selected', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderJournal();
    expect(screen.getByRole('button', { name: 'Work' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));
    expect(screen.getByRole('button', { name: 'Work' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });
});

describe('Journal custom topics', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseDemoMode.mockReset();
    mockUseJournalTopics.mockReset();
    emitToast.mockReset();
    mockUseDemoMode.mockReturnValue({ demoMode: false, toggleDemoMode: vi.fn() });
    mockUseJournalTopics.mockReturnValue(defaultTopicsValue);
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('hides the add-topic button for guests', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderJournal();
    expect(screen.queryByRole('button', { name: 'Add topic' })).toBeNull();
  });

  test('opens the create modal from the add-topic button', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    renderJournal();

    fireEvent.click(screen.getByRole('button', { name: 'Add topic' }));

    expect(screen.getByRole('dialog', { name: 'New topic' })).toBeTruthy();
  });

  test('shows the add-topic button for signed-in users when demo mode is on', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    mockUseDemoMode.mockReturnValue({ demoMode: true, toggleDemoMode: vi.fn() });
    renderJournal();

    fireEvent.click(screen.getByRole('button', { name: 'Add topic' }));

    expect(screen.getByRole('dialog', { name: 'New topic' })).toBeTruthy();
  });

  test('opens rename with the current name after a long-press on a custom chip', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    mockUseJournalTopics.mockReturnValue({
      ...defaultTopicsValue,
      customTopics: [{ id: 't1', name: 'Family' }],
      allTopics: [...JOURNAL_TOPIC_IDS, 'Family'],
    });
    renderJournal();

    act(() => {
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Family' }));
      vi.advanceTimersByTime(500);
    });

    const dialog = screen.getByRole('dialog', { name: 'Rename topic' });
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain('Family');
  });

  test('toasts instead of renaming a built-in topic on long-press', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    renderJournal();

    act(() => {
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Work' }));
      vi.advanceTimersByTime(500);
    });

    expect(emitToast).toHaveBeenCalledWith('Built-in topics cannot be renamed.');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Journal topic edge fade', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({ demoMode: false, toggleDemoMode: vi.fn() });
    mockUseJournalTopics.mockReturnValue(defaultTopicsValue);
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });

  afterEach(() => {
    cleanup();
  });

  test('toggles fade classes from scroll overflow', () => {
    renderJournal();
    const topics = screen.getByRole('group', { name: 'Journal topics' });

    mockScrollMetrics(topics, {
      scrollLeft: 0,
      clientWidth: 320,
      scrollWidth: 480,
    });
    fireEvent.scroll(topics);
    expect(topics.className).toContain('journal-page__topics--fade-right');
    expect(topics.className).not.toContain('journal-page__topics--fade-left');

    mockScrollMetrics(topics, {
      scrollLeft: 80,
      clientWidth: 320,
      scrollWidth: 480,
    });
    fireEvent.scroll(topics);
    expect(topics.className).toContain('journal-page__topics--fade-left');
    expect(topics.className).toContain('journal-page__topics--fade-right');

    mockScrollMetrics(topics, {
      scrollLeft: 160,
      clientWidth: 320,
      scrollWidth: 480,
    });
    fireEvent.scroll(topics);
    expect(topics.className).toContain('journal-page__topics--fade-left');
    expect(topics.className).not.toContain('journal-page__topics--fade-right');
  });
});
