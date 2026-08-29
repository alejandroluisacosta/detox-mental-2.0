import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
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

vi.mock('../../Components/Navigation/Navigation.jsx', () => ({
  default: () => null,
}));

vi.mock('../../Components/CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

vi.mock('../../Components/JournalSummaryBanner/JournalSummaryBanner.jsx', () => ({
  default: () => null,
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/toastBus.js', () => ({ emitToast: vi.fn() }));

const renderHistory = (locale = 'en') =>
  render(
    <LocaleProvider initialLocale={locale}>
      <JournalHistory />
    </LocaleProvider>,
  );

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
});
