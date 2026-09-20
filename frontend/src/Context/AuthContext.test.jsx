import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { apiFetch } from '../api/client.js';

vi.mock('../api/client.js', () => ({ apiFetch: vi.fn() }));

const Probe = () => {
  const { status, user, logout } = useAuth();
  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="email">{user?.email ?? ''}</p>
      <button type="button" onClick={() => { void logout().catch(() => {}); }}>
        logout
      </button>
    </div>
  );
};

const renderAuth = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe('AuthProvider', () => {
  afterEach(() => {
    cleanup();
    apiFetch.mockReset();
  });

  test('status is loading then ready, and a 200 sets the user', async () => {
    let resolveMe;
    apiFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMe = resolve;
        }),
    );

    renderAuth();
    expect(screen.getByTestId('status').textContent).toBe('loading');

    resolveMe({
      ok: true,
      json: async () => ({ email: 'a@b.com' }),
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('ready');
    });
    expect(screen.getByTestId('email').textContent).toBe('a@b.com');
  });

  test('a non-ok response leaves the user null with status ready', async () => {
    apiFetch.mockResolvedValue({ ok: false, json: async () => ({}) });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('ready');
    });
    expect(screen.getByTestId('email').textContent).toBe('');
  });

  test('a thrown apiFetch settles at ready with a null user', async () => {
    apiFetch.mockRejectedValue(new Error('offline'));

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('ready');
    });
    expect(screen.getByTestId('email').textContent).toBe('');
  });

  test('logout clears the user even when the POST rejects', async () => {
    apiFetch.mockImplementation(async (path) => {
      if (String(path).includes('/auth/logout')) {
        throw new Error('offline');
      }
      return { ok: true, json: async () => ({ email: 'a@b.com' }) };
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('a@b.com');
    });

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('');
    });
    expect(screen.getByTestId('status').textContent).toBe('ready');
  });
});
