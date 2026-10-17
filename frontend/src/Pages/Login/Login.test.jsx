import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Login from './Login.jsx';
import { apiFetch } from '../../api/client.js';

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

const submit = async (email) => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  fireEvent.change(document.getElementById('login-email'), { target: { value: email } });
  fireEvent.submit(document.querySelector('form'));
};

describe('Login rate limiting', () => {
  beforeEach(() => apiFetch.mockReset());
  afterEach(cleanup);

  test('shows the "too many links / server busy" message on a 429', async () => {
    apiFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ code: 'login_rate_limited', message: 'Too many login links requested.' }),
    });

    await submit('a@example.com');

    expect(
      await screen.findByText(/Has pedido demasiados enlaces o nuestro servidor está ocupado/),
    ).toBeTruthy();
    expect(screen.queryByText(/Too many login links requested/)).toBeNull();
  });
});
