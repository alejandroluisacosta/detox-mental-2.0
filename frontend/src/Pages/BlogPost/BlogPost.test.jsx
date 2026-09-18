import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { writeStoredLocale } from '../../utils/locale.js';
import BlogPost from './BlogPost.jsx';

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: null, status: 'ready' }),
}));

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

const publishedPost = {
  slug: 'attention-is-a-vote',
  title: 'Attention is a vote',
  category: 'personal-development',
  publishedAt: '2026-08-12T10:00:00.000Z',
  body: 'Every time you look, you are voting.',
};

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
});

const renderPost = (slug) => {
  writeStoredLocale('en');
  return render(
    <MemoryRouter initialEntries={[`/alejandroluis/blog/${slug}`]}>
      <LocaleProvider>
        <Routes>
          <Route path="/alejandroluis/blog/:slug" element={<BlogPost />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  );
};

describe('BlogPost', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders a published article from the API', async () => {
    apiFetch.mockResolvedValue(jsonResponse({ post: publishedPost }));
    renderPost('attention-is-a-vote');

    expect(await screen.findByRole('heading', { name: 'Attention is a vote' })).toBeTruthy();
    expect(screen.getByText('Personal development')).toBeTruthy();
    expect(screen.getByText(/you are voting/)).toBeTruthy();
  });

  test('shows not found for a 404', async () => {
    apiFetch.mockResolvedValue(jsonResponse({ message: 'Not found.' }, { ok: false, status: 404 }));
    renderPost('missing-article');

    expect(await screen.findByRole('heading', { name: 'Not found' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to the blog' }).getAttribute('href')).toBe(
      '/alejandroluis/blog',
    );
    expect(screen.queryByRole('heading', { name: 'Attention is a vote' })).toBeNull();
  });

  test('shows an error with retry when the fetch is rejected', async () => {
    apiFetch.mockRejectedValueOnce(new Error('offline'));
    renderPost('attention-is-a-vote');

    expect(await screen.findByRole('heading', { name: 'Could not load this article.' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Attention is a vote' })).toBeNull();

    apiFetch.mockResolvedValue(jsonResponse({ post: publishedPost }));
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Attention is a vote' })).toBeTruthy();
  });

  test('shows an error rather than an article when the server returns 500', async () => {
    apiFetch.mockResolvedValue(
      jsonResponse({ message: 'Could not load post.' }, { ok: false, status: 500 }),
    );
    renderPost('attention-is-a-vote');

    expect(await screen.findByRole('heading', { name: 'Could not load this article.' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Attention is a vote' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Not found' })).toBeNull();
  });

  test('renders markdown bold, italic, and links in the article body', async () => {
    apiFetch.mockResolvedValue(
      jsonResponse({
        post: {
          ...publishedPost,
          body: 'Read **this**, then *that*, and the [site](https://example.com).',
        },
      }),
    );
    renderPost('attention-is-a-vote');

    expect(await screen.findByText('this')).toBeTruthy();
    expect(screen.getByText('this').closest('strong')).toBeTruthy();
    expect(screen.getByText('that').closest('em')).toBeTruthy();
    const link = screen.getByRole('link', { name: 'site' });
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
