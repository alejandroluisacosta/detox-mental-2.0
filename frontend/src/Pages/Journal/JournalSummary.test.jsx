import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import JournalSummary from './JournalSummary.jsx';
import { apiFetch } from '../../api/client.js';

const mockUseAuth = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../Components/Navigation/Navigation.jsx', () => ({
  default: () => null,
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/toastBus.js', () => ({ emitToast: vi.fn() }));

describe('JournalSummary page states', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    apiFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  test('prompts guests to log in', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    render(<JournalSummary />);
    expect(
      screen.getByText(/Inicia sesión para ver o crear tu resumen semanal/i),
    ).toBeTruthy();
  });

  test('shows create CTA when canCreate is true', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        window: { open: true, enforced: false },
        entryCount: 3,
        minEntries: 2,
        canCreate: true,
        summary: null,
      }),
    });

    render(<JournalSummary />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREAR RESUMEN/i }),
      ).toBeTruthy();
    });
  });

  test('renders stored summary sections', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        weekStart: '2026-07-27',
        weekEnd: '2026-08-02',
        window: { open: true, enforced: false },
        entryCount: 3,
        minEntries: 2,
        canCreate: false,
        summary: {
          summaryText: 'Escribiste sobre el trabajo y la duda.',
          mainTopics: ['Trabajo'],
          bestQuote: 'Nunca es suficiente',
          socraticText: '¿Qué prueba tienes de eso?',
        },
      }),
    });

    render(<JournalSummary />);
    await waitFor(() => {
      expect(screen.getByText(/Escribiste sobre el trabajo/i)).toBeTruthy();
      expect(screen.getByText(/Nunca es suficiente/i)).toBeTruthy();
      expect(screen.getByText(/Qué prueba tienes/i)).toBeTruthy();
    });
  });
});
