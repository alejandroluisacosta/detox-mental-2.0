import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
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
    render(<JournalSummary />);
    expect(
      screen.getByText(/Inicia sesión para ver o crear tu resumen semanal/i),
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

    render(<JournalSummary />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREAR RESUMEN/i }),
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
          summaryText: 'Resumen de mitad de semana',
          createdAt: '2026-07-29T12:00:00.000Z',
          mainTopics: ['Trabajo'],
          bestQuote: 'Nunca es suficiente',
          socraticText: '¿Qué prueba tienes de eso?',
        },
      }),
    });

    render(<JournalSummary />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /CREAR RESUMEN/i }),
      ).toBeTruthy();
    });
    expect(screen.queryByText(/Resumen de mitad de semana/i)).toBeNull();
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
          summaryText: 'Escribiste sobre el trabajo y la duda.',
          mainTopics: ['Trabajo'],
          bestQuote: 'Nunca es suficiente',
          socraticText: '¿Qué prueba tienes de eso?',
          machiavelliText:
            '¿Qué posición esperas ganar si sigues evitando el conflicto?',
          createdAt: '2026-08-02T11:00:00.000Z',
        },
      }),
    });

    render(<JournalSummary />);
    await waitFor(() => {
      expect(screen.getByText(/Escribiste sobre el trabajo/i)).toBeTruthy();
      expect(screen.getByText(/Nunca es suficiente/i)).toBeTruthy();
      expect(screen.getByText(/Qué prueba tienes/i)).toBeTruthy();
      expect(screen.getByRole('heading', { name: /Pregunta de Sócrates/i })).toBeTruthy();
      expect(
        screen.getByText(/Qué posición esperas ganar si sigues evitando/i),
      ).toBeTruthy();
      expect(
        screen.getByRole('heading', { name: /Desafío Machiavélico/i }),
      ).toBeTruthy();
      const avatar = screen.getByAltText('Sócrates');
      expect(avatar.getAttribute('src')).toBe('/images/socrates.webp');
      const machiavelliAvatar = screen.getByAltText('Machiavelli');
      expect(machiavelliAvatar.getAttribute('src')).toBe(
        '/images/machiavelli.webp',
      );
      expect(
        screen.getByRole('button', { name: /REGENERAR RESUMEN/i }),
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
          summaryText: 'Escribiste sobre el trabajo y la duda.',
          mainTopics: ['Trabajo'],
          bestQuote: 'Nunca es suficiente',
          socraticText: '¿Qué prueba tienes de eso?',
          createdAt: '2026-08-02T11:00:00.000Z',
        },
      }),
    });

    render(<JournalSummary />);

    await waitFor(() => {
      expect(screen.getByText(/Escribiste sobre el trabajo/i)).toBeTruthy();
    });
    expect(
      screen.queryByRole('heading', { name: /Desafío Machiavélico/i }),
    ).toBeNull();
  });

  test('renders demo summary immediately when demo mode is active', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    mockUseDemoMode.mockReturnValue({
      demoMode: true,
      toggleDemoMode: vi.fn(),
    });

    render(<JournalSummary />);

    expect(
      screen.getByText(/conviertes la necesidad de control en una virtud/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Maybe I don't need a better plan/i),
    ).toBeTruthy();
    expect(apiFetch).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: /REGENERAR RESUMEN/i }),
    ).toBeNull();
  });
});
