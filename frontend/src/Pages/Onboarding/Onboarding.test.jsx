import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import Onboarding from './Onboarding.jsx';

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

const advance = async (ms) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe('Guided tour (onboarding chat)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    window.matchMedia = vi.fn(() => ({ matches: false }));
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ reply: 'Hola, soy Tales.', state: 'FAQ_HUB', faqChips: [] }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('opens on the Detox Mental title, then shows the chat after three seconds', async () => {
    render(<Onboarding />);
    expect(screen.getByRole('heading', { name: 'Detox Mental' })).toBeTruthy();
    await advance(2999);
    expect(screen.queryByText('Hola, soy Tales.')).toBeNull();

    await advance(1);
    expect(screen.queryByRole('heading', { name: 'Detox Mental' })).toBeNull();
    expect(screen.getByText('Hola, soy Tales.')).toBeTruthy();
  });

  test('loads the first chat message while the title is showing', async () => {
    render(<Onboarding />);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
