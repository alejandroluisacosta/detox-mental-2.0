import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import JournalSummary from './JournalSummary.jsx';
import { apiFetch } from '../../api/client.js';

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

const renderSummary = (locale = 'en') =>
  render(
    <LocaleProvider initialLocale={locale}>
      <JournalSummary />
    </LocaleProvider>,
  );

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

  test('shows create CTA when the window is open and there is no summary', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        window: {
          open: true,
          enforced: true,
          opensAt: '2026-08-02T10:00:00.000Z',
          closesAt: '2026-08-02T16:00:00.000Z',
        },
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
  });

  test('shows create CTA when the only summary is stale for this window', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        window: {
          open: true,
          enforced: true,
          opensAt: '2026-08-02T10:00:00.000Z',
          closesAt: '2026-08-02T16:00:00.000Z',
        },
        entryCount: 3,
        minEntries: 2,
        summary: {
          summaryText: 'Midweek summary',
          createdAt: '2026-07-29T12:00:00.000Z',
          mainTopics: ['Trabajo'],
          bestQuote: 'Never enough',
          socraticText: 'What proof do you have of that?',
        },
      }),
    });

    renderSummary();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREATE SUMMARY/i }),
      ).toBeTruthy();
    });
    expect(screen.queryByText(/Midweek summary/i)).toBeNull();
  });

  test('renders stored summary sections and regenerate button', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        window: {
          open: false,
          enforced: true,
          opensAt: '2026-08-02T10:00:00.000Z',
          closesAt: '2026-08-02T16:00:00.000Z',
        },
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
    });
  });

  test('hides the Machiavelli section for summaries created before it existed', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        window: {
          open: false,
          enforced: true,
          opensAt: '2026-08-02T10:00:00.000Z',
          closesAt: '2026-08-02T16:00:00.000Z',
        },
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
});
