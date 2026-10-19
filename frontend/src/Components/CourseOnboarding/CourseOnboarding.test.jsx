import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CourseOnboarding from './CourseOnboarding.jsx';

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
  render(<CourseOnboarding onClose={onClose} />);
  return onClose;
};

const clipSrc = () => document.querySelector('video')?.getAttribute('src');
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
const startTour = () => fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));

describe('CourseOnboarding', () => {
  beforeEach(() => {
    mockMedia();
  });

  afterEach(() => {
    cleanup();
  });

  test('opens on Tales\' welcome, which is not counted as a step', () => {
    renderOnboarding();
    expect(screen.getByRole('img', { name: 'Tales' })).toBeTruthy();
    expect(document.querySelector('video')).toBeNull();
    expect(document.querySelector('.onboarding-slideshow__step')?.textContent).toBe('Curso');
    startTour();
    expect(document.querySelector('.onboarding-slideshow__step')?.textContent).toBe('Curso · 1 de 6');
  });

  test('walks through the article, audio, exercise, tests and unlock clips in order', () => {
    renderOnboarding();
    startTour();
    const seen = [clipSrc()];
    for (let i = 0; i < 4; i += 1) {
      next();
      seen.push(clipSrc());
    }
    expect(seen).toEqual([
      '/onboarding/course/desktop/article.mp4',
      '/onboarding/course/desktop/audio.mp4',
      '/onboarding/course/desktop/exercise.mp4',
      '/onboarding/course/desktop/tests.mp4',
      '/onboarding/course/desktop/unlock.mp4',
    ]);
  });

  test('serves the mobile clips below the desktop breakpoint', () => {
    mockMedia({ desktop: false });
    renderOnboarding();
    startTour();
    expect(clipSrc()).toBe('/onboarding/course/mobile/article.mp4');
  });

  test('the secret-character slide shows an illustration instead of a video', () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a la diapositiva 6' }));
    expect(document.querySelector('video')).toBeNull();
    expect(screen.getByRole('img', { name: /personajes secretos/i })).toBeTruthy();
  });

  test('the last slide starts the course and closes the slideshow', () => {
    const onClose = renderOnboarding();
    startTour();
    for (let i = 0; i < 5; i += 1) next();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Empezar el curso' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Saltar closes the slideshow', () => {
    const onClose = renderOnboarding();
    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
