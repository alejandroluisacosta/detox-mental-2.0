import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import JournalOnboarding from './JournalOnboarding.jsx';

const mockMedia = ({ desktop = true, reducedMotion = false } = {}) => {
  window.matchMedia = vi.fn((query) => ({
    matches:
      (query.includes('min-width: 1000px') && desktop)
      || (query.includes('prefers-reduced-motion') && reducedMotion),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

const renderOnboarding = (onClose = vi.fn()) => {
  render(
    <LocaleProvider>
      <JournalOnboarding onClose={onClose} />
    </LocaleProvider>,
  );
  return onClose;
};

const clipSrc = () => document.querySelector('video')?.getAttribute('src');

describe('JournalOnboarding', () => {
  beforeEach(() => {
    mockMedia();
  });

  afterEach(() => {
    cleanup();
  });

  test('starts on the composer clip and loads only the current slide video', () => {
    renderOnboarding();
    expect(document.querySelectorAll('video')).toHaveLength(1);
    expect(clipSrc()).toBe('/onboarding/journal/desktop/journal.mp4');
  });

  test('Next and Back move through History, Summary and Meditations', () => {
    renderOnboarding();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/history.mp4');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/summary.mp4');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/meditations.mp4');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/summary.mp4');
    expect(document.querySelectorAll('video')).toHaveLength(1);
  });

  test('a progress dot jumps straight to its slide', () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/summary.mp4');
  });

  test('serves the mobile clips below the desktop breakpoint', () => {
    mockMedia({ desktop: false });
    renderOnboarding();
    expect(clipSrc()).toBe('/onboarding/journal/mobile/journal.mp4');
  });

  test('shows a still image instead of a video when the user prefers reduced motion', () => {
    mockMedia({ reducedMotion: true });
    renderOnboarding();
    expect(document.querySelector('video')).toBeNull();
    expect(screen.getByRole('img').getAttribute('src')).toBe(
      '/onboarding/journal/desktop/journal.jpg',
    );
  });

  test('the last slide finishes the slideshow instead of advancing', () => {
    const onClose = renderOnboarding();
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Start writing' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Skip and Escape both close the slideshow', () => {
    const onClose = renderOnboarding();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
