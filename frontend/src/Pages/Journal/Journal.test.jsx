import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Journal from './Journal.jsx';

const mockUseAuth = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
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

describe('Journal handwriting capture gating', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  test('hides the scan control for guests', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    render(<Journal />);
    expect(screen.queryByRole('button', { name: /Escanear/i })).toBeNull();
  });

  test('shows the scan control for signed-in users', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    render(<Journal />);
    expect(screen.getByRole('button', { name: /Escanear/i })).toBeTruthy();
  });

  test('hides the scan control while auth is still loading', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'loading' });
    render(<Journal />);
    expect(screen.queryByRole('button', { name: /Escanear/i })).toBeNull();
  });
});
