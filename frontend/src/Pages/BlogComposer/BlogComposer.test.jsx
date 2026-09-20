import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { writeStoredLocale } from '../../utils/locale.js';
import BlogComposer from './BlogComposer.jsx';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();
const previewState = { enabled: false };

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

vi.mock('../../data/blogPreviewReview.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isBlogPreviewReview: () => previewState.enabled,
  };
});

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
    previewState.enabled = false;
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
    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Link' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Image' })).toBeTruthy();
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

  test('wraps selected article text as bold, italic, and a link', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: 'admin' },
      status: 'ready',
    });
    renderComposer();
    await screen.findByRole('heading', { name: 'New article' });

    const body = screen.getByLabelText('Article');
    const selectAll = (value) => {
      fireEvent.change(body, { target: { value } });
      body.focus();
      body.setSelectionRange(0, value.length);
    };

    selectAll('Hello');
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    await waitFor(() => {
      expect(body.value).toBe('**Hello**');
    });

    selectAll('Hello');
    fireEvent.click(screen.getByRole('button', { name: 'Italic' }));
    await waitFor(() => {
      expect(body.value).toBe('*Hello*');
    });

    selectAll('Hello');
    fireEvent.click(screen.getByRole('button', { name: 'Link' }));
    await waitFor(() => {
      expect(body.value).toBe('[Hello](https://)');
    });
  });

  test('uploads an image and inserts markdown into the article', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: 'admin' },
      status: 'ready',
    });
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        image: { url: '/blog/images/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' },
      }),
    });
    renderComposer();
    await screen.findByRole('heading', { name: 'New article' });

    const file = new File(['jpeg-bytes'], 'quiet-morning.jpg', { type: 'image/jpeg' });
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/blog/admin/images',
        expect.objectContaining({ method: 'POST' }),
      );
    });
    expect(apiFetch.mock.calls[0][1].body).toBeInstanceOf(FormData);
    expect(screen.getByLabelText('Article').value).toContain(
      '![quiet morning](/blog/images/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee)',
    );
  });

  test('lets a visitor open the composer on a Vercel preview without saving', async () => {
    previewState.enabled = true;
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderComposer();

    expect(await screen.findByRole('heading', { name: 'New article' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/Preview review/);
    expect(screen.getByRole('button', { name: 'Save' }).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Should not save' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(apiFetch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
