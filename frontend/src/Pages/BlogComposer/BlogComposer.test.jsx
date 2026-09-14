import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import BlogComposer from './BlogComposer.jsx';

const mockUseAuth = vi.fn();

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderComposer = () =>
  render(
    <MemoryRouter initialEntries={['/alejandroluis/blog/new']}>
      <Routes>
        <Route path="/alejandroluis/blog/new" element={<BlogComposer />} />
      </Routes>
    </MemoryRouter>,
  );

describe('BlogComposer', () => {
  afterEach(() => {
    cleanup();
  });

  test('looks like not found when the visitor is not an admin', async () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderComposer();

    expect(await screen.findByRole('heading', { name: 'No encontrado' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Guardar' })).toBeNull();
  });

  test('shows the write form for an admin', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: 'admin' },
      status: 'ready',
    });
    renderComposer();

    expect(await screen.findByRole('heading', { name: 'Nuevo artículo' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeTruthy();
    expect(screen.getByLabelText('Categoría')).toBeTruthy();
  });
});
