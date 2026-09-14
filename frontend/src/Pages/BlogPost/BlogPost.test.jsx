import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { apiFetch } from '../../api/client.js';
import BlogPost from './BlogPost.jsx';

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: null, status: 'ready' }),
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

const renderPost = (slug) =>
  render(
    <MemoryRouter initialEntries={[`/alejandroluis/blog/${slug}`]}>
      <Routes>
        <Route path="/alejandroluis/blog/:slug" element={<BlogPost />} />
      </Routes>
    </MemoryRouter>,
  );

describe('BlogPost', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    cleanup();
  });

  test('renders a mock article when the API is unavailable', async () => {
    renderPost('la-atencion-es-un-voto');

    expect(await screen.findByRole('heading', { name: 'La atención es un voto' })).toBeTruthy();
    expect(screen.getByText('Personal development')).toBeTruthy();
    expect(screen.getByText(/estás votando/)).toBeTruthy();
  });

  test('shows not found for an unknown slug', async () => {
    renderPost('missing-article');

    expect(await screen.findByRole('heading', { name: 'No encontrado' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Volver al blog' }).getAttribute('href')).toBe(
      '/alejandroluis/blog',
    );
  });
});
