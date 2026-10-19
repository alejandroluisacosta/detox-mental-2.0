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
const stepLabel = () => document.querySelector('.onboarding-slideshow__step')?.textContent;
const startTour = () => fireEvent.click(screen.getByRole('button', { name: 'Show me' }));

describe('JournalOnboarding', () => {
  beforeEach(() => {
    mockMedia();
  });

  afterEach(() => {
    cleanup();
  });

  test('opens on Tales\' welcome, prefetching the first clip without playing a video', () => {
    renderOnboarding();
    expect(screen.getByRole('img', { name: 'Tales' })).toBeTruthy();
    expect(document.querySelector('video')).toBeNull();
    expect(document.querySelector('link[rel="prefetch"]')?.getAttribute('href')).toBe(
      '/onboarding/journal/desktop/journal.mp4',
    );
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  test('the welcome is not counted as a step', () => {
    renderOnboarding();
    expect(stepLabel()).toBe('Journal');
    startTour();
    expect(stepLabel()).toBe('Journal · 1 of 4');
  });

  test('starts on the composer clip and loads only the current slide video', () => {
    renderOnboarding();
    startTour();
    expect(document.querySelectorAll('video')).toHaveLength(1);
    expect(clipSrc()).toBe('/onboarding/journal/desktop/journal.mp4');
  });

  test('Next and Back move through History, Summary and Meditations, and back to the welcome', () => {
    renderOnboarding();
    startTour();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/history.mp4');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/summary.mp4');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/meditations.mp4');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/summary.mp4');
    expect(document.querySelectorAll('video')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('img', { name: 'Tales' })).toBeTruthy();
  });

  test('a progress dot jumps straight to its slide', () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    expect(clipSrc()).toBe('/onboarding/journal/desktop/summary.mp4');
  });

  test('serves the mobile clips below the desktop breakpoint', () => {
    mockMedia({ desktop: false });
    renderOnboarding();
    startTour();
    expect(clipSrc()).toBe('/onboarding/journal/mobile/journal.mp4');
  });

  test('shows a still image instead of a video when the user prefers reduced motion', () => {
    mockMedia({ reducedMotion: true });
    renderOnboarding();
    startTour();
    expect(document.querySelector('video')).toBeNull();
    expect(
      screen.getByRole('img', { name: 'Typing a journal entry and selecting topics' }).getAttribute('src'),
    ).toBe('/onboarding/journal/desktop/journal.jpg');
  });

  test('the last slide finishes the slideshow instead of advancing', () => {
    const onClose = renderOnboarding();
    startTour();
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
