import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import BlogChrome from './BlogChrome.jsx';

const mockUseAuth = vi.fn();

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

const PRODUCT_HREFS = ['/', '/journal', '/theory', '/course', '/account', '/login'];

const renderChrome = () =>
  render(
    <MemoryRouter>
      <BlogChrome />
    </MemoryRouter>,
  );

describe('BlogChrome', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
  });

  afterEach(() => {
    cleanup();
  });

  test('links only inside the personal site', () => {
    renderChrome();

    const hrefs = [...document.querySelectorAll('a')].map((link) => link.getAttribute('href'));
    expect(hrefs.every((href) => href.startsWith('/alejandroluis'))).toBe(true);
    PRODUCT_HREFS.forEach((href) => {
      expect(hrefs).not.toContain(href);
    });
  });

  test('hides write and edit from the public chrome', () => {
    renderChrome();

    expect(screen.queryByRole('link', { name: 'Escribir' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull();
  });

  test('shows write when the signed-in user is an admin', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin' },
      status: 'ready',
    });

    render(
      <MemoryRouter>
        <BlogChrome editSlug="quiet-tools" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Escribir' }).getAttribute('href')).toBe(
      '/alejandroluis/blog/new',
    );
    expect(screen.getByRole('link', { name: 'Editar' }).getAttribute('href')).toBe(
      '/alejandroluis/blog/quiet-tools/edit',
    );
  });
});
