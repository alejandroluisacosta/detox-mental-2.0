import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SessionsContext } from '../../Context/SessionsContext';
import { sessionsData } from '../../data';
import { COURSE_ONBOARDING_SEEN_KEY } from '../../Components/CourseOnboarding/CourseOnboarding.jsx';
import CourseWrapper from './CourseWrapper.jsx';

const mockNavigate = vi.fn();
const mockPromoEnabled = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../data/promoConfig.js', () => ({
  isPromoEnabled: () => mockPromoEnabled(),
}));

vi.mock('../../Components/Navigation/Navigation', () => ({ default: () => null }));
vi.mock('lottie-react', () => ({ default: () => null }));
vi.mock('../../Components/RewardOfferModal/RewardOfferModal', () => ({
  default: () => <div role="dialog" aria-label="Oferta de recompensa" />,
}));

const renderCourse = ({ onboardingSeen = false } = {}) => {
  if (onboardingSeen) window.localStorage.setItem(COURSE_ONBOARDING_SEEN_KEY, 'true');
  return render(
    <SessionsContext.Provider
      value={{ sessions: sessionsData, setSessions: vi.fn(), sessionsLoading: false }}
    >
      <CourseWrapper />
    </SessionsContext.Provider>,
  );
};

const courseIntro = () => screen.queryByRole('dialog', { name: 'Introducción al curso' });
const rewardOffer = () => screen.queryByRole('dialog', { name: 'Oferta de recompensa' });
const advance = (ms) => act(() => {
  vi.advanceTimersByTime(ms);
});

describe('Course page first visit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockReset();
    mockPromoEnabled.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('shows the session list straight away, then the slideshow after half a second', () => {
    renderCourse();
    expect(screen.getByRole('heading', { name: 'Sesión 1:' })).toBeTruthy();
    expect(courseIntro()).toBeNull();

    advance(499);
    expect(courseIntro()).toBeNull();
    advance(1);
    expect(courseIntro()).toBeTruthy();
  });

  test('no longer sends first-time visitors to session 1', () => {
    renderCourse();
    advance(10000);
    expect(mockNavigate).not.toHaveBeenCalledWith('/session/1', expect.anything());
    expect(mockNavigate).not.toHaveBeenCalledWith('/session/1');
  });

  test('stays closed on later visits once skipped', () => {
    const first = renderCourse();
    advance(500);
    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    expect(courseIntro()).toBeNull();
    first.unmount();

    renderCourse();
    advance(1000);
    expect(courseIntro()).toBeNull();
  });

  test('the help button reopens the slideshow immediately', () => {
    renderCourse({ onboardingSeen: true });
    advance(1000);
    expect(courseIntro()).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Cómo funciona el curso' }));
    expect(courseIntro()).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Atrás' })).toBeNull();
  });

  test('the reward offer waits until the slideshow is closed', () => {
    mockPromoEnabled.mockReturnValue(true);
    renderCourse();
    advance(500);
    advance(10000);
    expect(rewardOffer()).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    advance(4999);
    expect(rewardOffer()).toBeNull();
    advance(1);
    expect(rewardOffer()).toBeTruthy();
  });

  test('returning visitors still get the reward offer after five seconds', () => {
    mockPromoEnabled.mockReturnValue(true);
    renderCourse({ onboardingSeen: true });
    advance(5000);
    expect(rewardOffer()).toBeTruthy();
  });
});
