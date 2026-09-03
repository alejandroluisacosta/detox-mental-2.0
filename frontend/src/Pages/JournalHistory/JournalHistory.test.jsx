import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalHistory from './JournalHistory.jsx';
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

vi.mock('../../Context/JournalTopicsContext.jsx', () => ({
  useJournalTopics: () => ({
    customTopics: [],
    allTopics: [
      'work',
      'interpersonal',
      'reflection',
      'wisdom',
      'worries',
      'meditations',
      'private',
    ],
    status: 'ready',
    createTopic: vi.fn(),
    renameTopic: vi.fn(),
  }),
}));

vi.mock('../../Components/Navigation/Navigation.jsx', () => ({
  default: () => null,
}));

vi.mock('../../Components/CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/toastBus.js', () => ({ emitToast: vi.fn() }));

const renderHistory = (locale = 'en') => {
  writeStoredLocale(locale);
  return render(
    <LocaleProvider>
      <JournalHistory />
    </LocaleProvider>,
  );
};

describe('JournalHistory page states', () => {
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

  test('prompts guests to log in when demo mode is off', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });

    renderHistory();

    expect(
      screen.getByText(/Sign in to see the entries saved in your journal/i),
    ).toBeTruthy();
  });

  test('renders demo entries for guests when demo mode is active', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    renderHistory();

    expect(
      screen.getByText(/Every time something stays ambiguous/i),
    ).toBeTruthy();
    expect(screen.queryByLabelText(/Delete entry/i)).toBeNull();
    expect(screen.queryByLabelText(/Edit topics/i)).toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('shows a spinner above the auth loading copy', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'loading' });
    renderHistory();
    expect(screen.getByText('Loading…')).toBeTruthy();
    expect(document.querySelector('.loading-status__spinner')).toBeTruthy();
  });

  test('shows a spinner above the entries loading copy', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockReturnValue(new Promise(() => {}));
    renderHistory();
    expect(screen.getByText('Loading entries…')).toBeTruthy();
    expect(document.querySelector('.loading-status__spinner')).toBeTruthy();
  });

  test('opens the topics modal and saves a PATCH that updates the chips', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    const entry = {
      id: 'e1',
      content: 'A short entry.',
      topics: ['work'],
      createdAt: '2026-08-01T12:00:00.000Z',
    };

    apiFetch.mockImplementation((path, options = {}) => {
      if (options.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            entry: { ...entry, topics: ['work', 'reflection'] },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ entries: [entry] }),
      });
    });

    renderHistory();

    fireEvent.click(await screen.findByLabelText(/Edit topics/i));
    fireEvent.click(screen.getByRole('button', { name: 'Reflection' }));
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/me/journal-entries/e1', {
        method: 'PATCH',
        body: { topics: ['work', 'reflection'] },
      });
    });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('Reflection')).toBeTruthy();
  });
});
