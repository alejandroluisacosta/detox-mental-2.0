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
    expect(window.localStorage.getItem('onboardingRevealed')).toBeNull();

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Blog' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Detox Mental' })).toBeNull();
  });
});
