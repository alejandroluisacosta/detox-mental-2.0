import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App.jsx';
import { apiFetch } from './api/client.js';

vi.mock('lottie-react', () => ({ default: () => null }));
vi.mock('./api/client.js', () => ({ apiFetch: vi.fn() }));

describe('App blog isolation', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.localStorage.clear();
    apiFetch.mockReset();
    apiFetch.mockImplementation(async (path) => {
      if (String(path).startsWith('/blog/')) {
        return { ok: true, json: async () => ({ posts: [] }) };
      }
      return { ok: false, json: async () => ({}) };
    });
    window.history.pushState({}, '', '/alejandroluis/blog');
  });

  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  test('renders the blog without sending first-time visitors to onboarding', async () => {

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Blog' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Detox Mental' })).toBeNull();
  });
});

describe('Education entry without a forced guided tour', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.localStorage.clear();
    window.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    apiFetch.mockReset();
    apiFetch.mockResolvedValue({ ok: false, json: async () => ({}) });
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ reply: 'Hola, soy Tales.', state: 'FAQ_HUB', faqChips: [] }),
    }));
  });

  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  test('first-time visitors to the course land on it instead of the guided tour', async () => {
    window.history.pushState({}, '', '/course');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Sesión 1:' })).toBeTruthy();
    expect(window.location.pathname).toBe('/course');
  });

  test('the guided tour opens on its short title, without the old welcome lines', async () => {
    window.history.pushState({}, '', '/onboarding');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Detox Mental' })).toBeTruthy();
    expect(screen.queryByText(/tu gimnasio mental virtual/)).toBeNull();
  });
});
