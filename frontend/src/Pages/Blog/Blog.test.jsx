import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { writeStoredLocale } from '../../utils/locale.js';
import Blog from './Blog.jsx';

const mockUseAuth = vi.fn();

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

const previewState = { enabled: false };

vi.mock('../../data/blogPreviewReview.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isBlogPreviewReview: () => previewState.enabled,
  };
});

const personalPost = {
  id: '1',
  slug: 'attention-is-a-vote',
  title: 'Attention is a vote',
  excerpt: 'What you look at, you become.',
  category: 'personal-development',
  publishedAt: '2026-08-12T10:00:00.000Z',
};

const techPost = {
  id: '2',
  slug: 'the-phone-is-not-the-enemy',
  title: 'The phone is not the enemy',
  excerpt: 'Tools are not the problem.',
  category: 'technology',
  publishedAt: '2026-09-01T10:00:00.000Z',
};

const draftPost = {
  id: '3',
  slug: 'quiet-tools',
  title: 'Quiet tools',
  excerpt: 'Still unpublished.',
  category: 'technology',
  status: 'draft',
  createdAt: '2026-09-10T10:00:00.000Z',
};

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
});

const renderBlog = (path = '/alejandroluis/blog') => {
  writeStoredLocale('en');
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleProvider>
        <Routes>
          <Route path="/alejandroluis/blog" element={<Blog />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  );
};

describe('Blog', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    previewState.enabled = false;
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(jsonResponse({ posts: [personalPost, techPost] }));
  });

  afterEach(() => {
    cleanup();
  });

  test('renders published articles from the API', async () => {
    renderBlog();

    expect(await screen.findByRole('link', { name: /Attention is a vote/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /The phone is not the enemy/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Personal development' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Technology' })).toBeTruthy();
  });

  test('shows an empty state when the API returns no posts', async () => {
    apiFetch.mockResolvedValue(jsonResponse({ posts: [] }));
    renderBlog();

    expect(await screen.findByText('There are no articles in this category.')).toBeTruthy();
  });

  test('shows an error with retry when the fetch is rejected', async () => {
    apiFetch.mockRejectedValueOnce(new Error('offline'));
    renderBlog();

    expect(await screen.findByText('Could not load articles.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Attention is a vote/ })).toBeNull();

    apiFetch.mockResolvedValue(jsonResponse({ posts: [personalPost] }));
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('link', { name: /Attention is a vote/ })).toBeTruthy();
  });

  test('filters articles in memory without a second fetch', async () => {
    renderBlog();
    await screen.findByRole('link', { name: /Attention is a vote/ });
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/blog/posts');

    fireEvent.click(screen.getByRole('button', { name: 'Technology' }));

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /Attention is a vote/ })).toBeNull();
    });
    expect(screen.getByRole('link', { name: /The phone is not the enemy/ })).toBeTruthy();
    expect(apiFetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Personal development' }));

    expect(await screen.findByRole('link', { name: /Attention is a vote/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /The phone is not the enemy/ })).toBeNull();
    expect(apiFetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'All' }));

    expect(await screen.findByRole('link', { name: /Attention is a vote/ })).toBeTruthy();
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  test('applies a known category from the URL after one unfiltered fetch', async () => {
    renderBlog('/alejandroluis/blog?category=technology');

    expect(await screen.findByRole('link', { name: /The phone is not the enemy/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Attention is a vote/ })).toBeNull();
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/blog/posts');
  });

  test('treats an unknown category as all', async () => {
    renderBlog('/alejandroluis/blog?category=foo');

    expect(await screen.findByRole('link', { name: /Attention is a vote/ })).toBeTruthy();
    expect(apiFetch).toHaveBeenCalledWith('/blog/posts');
    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  test('lets an admin reach drafts from the index', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin' },
      status: 'ready',
    });
    apiFetch.mockResolvedValue(jsonResponse({ posts: [personalPost, draftPost] }));

    renderBlog();

    expect(await screen.findByText('Draft')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Quiet tools/ }).getAttribute('href')).toBe(
      '/alejandroluis/blog/quiet-tools/edit',
    );
    expect(apiFetch).toHaveBeenCalledWith('/blog/admin/posts');
  });

  test('includes a sample article on a Vercel preview even if the API fails', async () => {
    previewState.enabled = true;
    apiFetch.mockRejectedValue(new Error('cors'));
    renderBlog();

    expect(await screen.findByRole('link', { name: /Preview sample/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Preview sample/ }).getAttribute('href')).toBe(
      '/alejandroluis/blog/review-sample',
    );
    expect(screen.queryByText('Could not load articles.')).toBeNull();
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
