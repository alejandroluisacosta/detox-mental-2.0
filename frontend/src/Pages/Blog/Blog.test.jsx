import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { apiFetch } from '../../api/client.js';
import Blog from './Blog.jsx';

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: null, status: 'ready' }),
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

const renderBlog = (path = '/alejandroluis/blog') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/alejandroluis/blog" element={<Blog />} />
      </Routes>
    </MemoryRouter>,
  );

describe('Blog', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    cleanup();
  });

  test('shows mock articles when the API is unavailable', async () => {
    renderBlog();

    expect(await screen.findByRole('link', { name: /La atención es un voto/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /El teléfono no es el enemigo/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Personal development' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Technology' })).toBeTruthy();
  });

  test('filters the index by category', async () => {
    renderBlog();
    await screen.findByRole('link', { name: /La atención es un voto/ });

    fireEvent.click(screen.getByRole('button', { name: 'Technology' }));

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /La atención es un voto/ })).toBeNull();
    });
    expect(screen.getByRole('link', { name: /El teléfono no es el enemigo/ })).toBeTruthy();
  });

  test('does not link into the journal or education modules', async () => {
    renderBlog();
    await screen.findByRole('heading', { name: 'Blog' });

    const hrefs = [...document.querySelectorAll('a')].map((link) => link.getAttribute('href'));
    expect(hrefs.some((href) => href === '/' || href?.startsWith('/journal') || href?.startsWith('/theory'))).toBe(
      false,
    );
  });
});
