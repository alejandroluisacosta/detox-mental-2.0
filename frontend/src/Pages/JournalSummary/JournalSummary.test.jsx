import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalSummary from './JournalSummary.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';

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
vi.mock(
  '../../Components/JournalSummaryLoadingScreen/JournalSummaryLoadingScreen.jsx',
  async () => {
    const { useEffect } = await import('react');
    return {
      default: function MockLoadingScreen({ ready, attempt, onDone }) {
        useEffect(() => {
          if (ready) onDone?.();
        }, [onDone, ready]);
        return <div>loading-attempt-{attempt}</div>;
      },
    };
  },
);

const renderSummary = (locale = 'en') => {
  writeStoredLocale(locale);
  return render(
    <LocaleProvider>
      <JournalSummary />
    </LocaleProvider>,
  );
};

const quota = (used, remaining = 2 - used) => ({
  timezone: 'Europe/Madrid',
  limit: 2,
  used,
  remaining,
  resetsAt: '2026-08-02T22:00:00.000Z',
});

describe('JournalSummary page states', () => {
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

  test('prompts guests to log in', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderSummary();
    expect(
      screen.getByText(/Sign in to view or create your weekly summary/i),
    ).toBeTruthy();
  });

  test('shows create CTA when there is quota left and there is no summary', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-23',
        weekEnd: '2026-07-29',
        quota: quota(0),
        entryCount: 3,
        minEntries: 2,
        summary: null,
      }),
    });

    renderSummary();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREATE SUMMARY/i }),
      ).toBeTruthy();
    });
    expect(screen.getByText(/2 of 2 summaries left this week/i)).toBeTruthy();
    expect(screen.getByText(/July 23.*July 29/i)).toBeTruthy();
  });

  test('renders stored summary sections and regenerate button when quota remains', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        quota: quota(1),
        entryCount: 3,
        minEntries: 2,
        summary: {
          summaryText: 'You wrote about work and doubt.',
          mainTopics: ['Trabajo'],
          bestQuote: 'Never enough',
          socraticText: 'What proof do you have of that?',
          machiavelliText:
            'What position do you expect to gain if you keep avoiding conflict?',
          createdAt: '2026-08-02T11:00:00.000Z',
          locale: 'en',
        },
      }),
    });

    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/You wrote about work/i)).toBeTruthy();
      expect(screen.getByText(/Never enough/i)).toBeTruthy();
      expect(screen.getByText(/What proof do you have/i)).toBeTruthy();
      expect(screen.getByRole('heading', { name: /Socrates' question/i })).toBeTruthy();
      expect(
        screen.getByText(/What position do you expect to gain if you keep avoiding/i),
      ).toBeTruthy();
      expect(
        screen.getByRole('heading', { name: /Machiavelli's challenge/i }),
      ).toBeTruthy();
      const avatar = screen.getByAltText('Socrates');
      expect(avatar.getAttribute('src')).toBe('/images/socrates.webp');
      const machiavelliAvatar = screen.getByAltText('Machiavelli');
      expect(machiavelliAvatar.getAttribute('src')).toBe(
        '/images/machiavelli.webp',
      );
      expect(
        screen.getByRole('button', { name: /REGENERATE SUMMARY/i }),
      ).toBeTruthy();
      expect(screen.getByText(/1 of 2 summaries left this week/i)).toBeTruthy();
    });
  });

  test('hides regenerate and shows the exhausted copy when quota is spent', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        quota: quota(2),
        entryCount: 3,
        minEntries: 2,
        summary: {
          summaryText: 'You wrote about work and doubt.',
          mainTopics: ['Trabajo'],
          bestQuote: 'Never enough',
          socraticText: 'What proof do you have of that?',
          createdAt: '2026-08-02T11:00:00.000Z',
          locale: 'en',
          generationCount: 2,
        },
      }),
    });

    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/You wrote about work/i)).toBeTruthy();
    });
    expect(
      screen.queryByRole('button', { name: /REGENERATE SUMMARY/i }),
    ).toBeNull();
    expect(
      screen.getByText(/You have used both summaries this week/i),
    ).toBeTruthy();
  });

  test('hides the Machiavelli section for summaries created before it existed', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        quota: quota(1),
        entryCount: 3,
        minEntries: 2,
        summary: {
          summaryText: 'You wrote about work and doubt.',
          mainTopics: ['Trabajo'],
          bestQuote: 'Never enough',
          socraticText: 'What proof do you have of that?',
          createdAt: '2026-08-02T11:00:00.000Z',
        },
      }),
    });

    renderSummary();

    await waitFor(() => {
      expect(screen.getByText(/You wrote about work/i)).toBeTruthy();
    });
    expect(
      screen.queryByRole('heading', { name: /Machiavelli's challenge/i }),
    ).toBeNull();
  });

  test('renders demo summary immediately when demo mode is active', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    renderSummary();

    expect(
      screen.getByText(/turn the need for control into a virtue/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Maybe I don't need a better plan/i),
    ).toBeTruthy();
    expect(apiFetch).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: /REGENERATE SUMMARY/i }),
    ).toBeNull();
  });

  test('shows a spinner above the auth loading copy', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'loading' });
    renderSummary();
    expect(screen.getByText('Loading…')).toBeTruthy();
    expect(document.querySelector('.loading-status__spinner')).toBeTruthy();
  });

  test('shows a spinner above the summary loading copy', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockReturnValue(new Promise(() => {}));
    renderSummary();
    expect(screen.getByText('Loading summary…')).toBeTruthy();
    expect(document.querySelector('.loading-status__spinner')).toBeTruthy();
  });

  test('replaces the history text link with a footer WRITE button', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderSummary();
    expect(screen.getByText('WRITE')).toBeTruthy();
    expect(screen.queryByText('View history')).toBeNull();
  });

  const emptyCurrent = {
    weekStart: '2026-07-23',
    weekEnd: '2026-07-29',
    quota: quota(0),
    entryCount: 3,
    minEntries: 2,
    summary: null,
  };

  const mockGetThenPosts = (postImpl) => {
    apiFetch.mockImplementation((_path, options = {}) => {
      if (options.method === 'POST') return postImpl();
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => emptyCurrent,
      });
    });
  };

  test('retries generate timeouts then shows try later', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    const abortErr = Object.assign(new Error('aborted'), { name: 'AbortError' });
    mockGetThenPosts(() => Promise.reject(abortErr));

    renderSummary();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREATE SUMMARY/i }),
      ).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /CREATE SUMMARY/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please try later/i)).toBeTruthy();
    });
    const posts = apiFetch.mock.calls.filter(
      ([, options]) => options?.method === 'POST',
    );
    expect(posts).toHaveLength(3);
  });

  test('does not retry a 422 generate failure', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    mockGetThenPosts(() =>
      Promise.resolve({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Need more entries' }),
      }),
    );

    renderSummary();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREATE SUMMARY/i }),
      ).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /CREATE SUMMARY/i }));

    await waitFor(() => {
      expect(emitToast).toHaveBeenCalled();
    });
    const posts = apiFetch.mock.calls.filter(
      ([, options]) => options?.method === 'POST',
    );
    expect(posts).toHaveLength(1);
    expect(screen.queryByText(/Please try later/i)).toBeNull();
  });

  test('retries a 502 then shows the summary', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    let posts = 0;
    mockGetThenPosts(() => {
      posts += 1;
      if (posts === 1) {
        return Promise.resolve({
          ok: false,
          status: 502,
          json: async () => ({ message: 'generate failed' }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 201,
        json: async () => ({
          weekStart: '2026-07-23',
          weekEnd: '2026-07-29',
          summary: {
            summaryText: 'You wrote about work and doubt.',
            mainTopics: ['Work'],
            bestQuote: 'Never enough',
            socraticText: 'What proof do you have of that?',
            generationCount: 1,
          },
        }),
      });
    });

    renderSummary();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREATE SUMMARY/i }),
      ).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /CREATE SUMMARY/i }));

    await waitFor(() => {
      expect(screen.getByText(/You wrote about work/i)).toBeTruthy();
    });
    expect(posts).toBe(2);
  });

  test('shows try later immediately when generate is rate limited', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    mockGetThenPosts(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        json: async () => ({
          code: 'summary_rate_limited',
          message: 'Please try later.',
        }),
      }),
    );

    renderSummary();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREATE SUMMARY/i }),
      ).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /CREATE SUMMARY/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please try later/i)).toBeTruthy();
    });
    const posts = apiFetch.mock.calls.filter(
      ([, options]) => options?.method === 'POST',
    );
    expect(posts).toHaveLength(1);
  });
});
