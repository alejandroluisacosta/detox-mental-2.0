import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import Journal from './Journal.jsx';

const mockUseAuth = vi.fn();

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

vi.mock('../../Components/Navigation/Navigation.jsx', () => ({
  default: () => null,
}));

vi.mock('../../Components/CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/toastBus.js', () => ({ emitToast: vi.fn() }));

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
    expect(link.querySelector('.journal-page__history-icon')).toBeTruthy();
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

describe('Journal topic edge fade', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
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
