import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { writeStoredLocale } from '../../utils/locale.js';
import BlogComposer from './BlogComposer.jsx';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComposer = () => {
  writeStoredLocale('en');
  return render(
    <MemoryRouter initialEntries={['/alejandroluis/blog/new']}>
      <LocaleProvider>
        <Routes>
          <Route path="/alejandroluis/blog/new" element={<BlogComposer />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  );
};

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Quiet tools' } });
  fireEvent.change(screen.getByLabelText('Article'), { target: { value: 'A full draft.' } });
};

describe('BlogComposer', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    apiFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  test('looks like not found when the visitor is not an admin', async () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderComposer();

    expect(await screen.findByRole('heading', { name: 'Not found' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  test('shows the write form for an admin', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: 'admin' },
      status: 'ready',
    });
    renderComposer();

    expect(await screen.findByRole('heading', { name: 'New article' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    expect(screen.getByLabelText('Category')).toBeTruthy();
  });

  test('sends a saved draft to its edit URL', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: 'admin' },
      status: 'ready',
    });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ post: { slug: 'quiet-tools', status: 'draft' } }),
    });
    renderComposer();
    await screen.findByRole('heading', { name: 'New article' });
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/alejandroluis/blog/quiet-tools/edit');
    });
  });

  test('sends a published post to the reader', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: 'admin' },
      status: 'ready',
    });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ post: { slug: 'quiet-tools', status: 'published' } }),
    });
    renderComposer();
    await screen.findByRole('heading', { name: 'New article' });
    fillRequiredFields();
    fireEvent.click(screen.getByRole('radio', { name: 'Published' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/alejandroluis/blog/quiet-tools');
    });
  });

  test('does not navigate when the save response has no post', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: 'admin' },
      status: 'ready',
    });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    renderComposer();
    await screen.findByRole('heading', { name: 'New article' });
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
