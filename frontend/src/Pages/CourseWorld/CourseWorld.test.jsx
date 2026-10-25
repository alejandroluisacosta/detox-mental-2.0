import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourseWorld from './CourseWorld.jsx';
import { COURSE_ONBOARDING_SEEN_KEY } from '../../Components/CourseOnboarding/CourseOnboarding.jsx';

// jsdom has no WebGL. The fake scene stands in for the player walking: it
// reports stops the way the real one does, and only while the walk is running.
vi.mock('../../Components/CourseWorldScene/CourseWorldScene.jsx', () => ({
  default: ({ layout, paused, teleport, onStopChange, onUnavailable }) => (
    <div data-testid="scene" data-at={teleport ? `${teleport.position.x},${teleport.position.z}` : ''}>
      {[...layout.kiosks.map((k) => k.id), 'goal'].map((id) => (
        <button key={id} type="button" onClick={() => !paused && onStopChange(id)}>
          walk to {id}
        </button>
      ))}
      <button type="button" onClick={() => !paused && onStopChange(null)}>walk away</button>
      <button type="button" onClick={onUnavailable}>no webgl</button>
    </div>
  ),
}));

const mockMedia = ({ reducedMotion = false } = {}) => {
  window.matchMedia = vi.fn((query) => ({
    matches:
      query.includes('min-width: 1000px') || (query.includes('prefers-reduced-motion') && reducedMotion),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

const renderWorld = () =>
  render(
    <MemoryRouter initialEntries={['/course/world']}>
      <Routes>
        <Route path="/course/world" element={<CourseWorld />} />
        <Route path="/course" element={<p>course page</p>} />
        <Route path="/onboarding" element={<p>guided chat</p>} />
      </Routes>
    </MemoryRouter>,
  );

const startWalk = async () => {
  renderWorld();
  await screen.findByTestId('scene');
  fireEvent.click(screen.getByRole('button', { name: 'Empezar el paseo' }));
};
const walkTo = (id) => fireEvent.click(screen.getByRole('button', { name: `walk to ${id}` }));
const walkAway = () => fireEvent.click(screen.getByRole('button', { name: 'walk away' }));
const panel = () => screen.queryByRole('dialog');
const counter = () => screen.getByText(/kioscos visitados/i).textContent;

describe('CourseWorld', () => {
  beforeEach(() => {
    mockMedia();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('opens on Tales\' welcome and the player cannot walk until it is dismissed', async () => {
    renderWorld();
    await screen.findByTestId('scene');
    expect(screen.getByRole('img', { name: 'Tales' })).toBeTruthy();

    walkTo('audio');
    expect(panel()).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Empezar el paseo' }));
    walkTo('audio');
    expect(within(panel()).getByRole('heading', { name: 'Empieza el audio curso' })).toBeTruthy();
  });

  test('a kiosk keeper explains their course step with its clip, and walking away closes it', async () => {
    await startWalk();
    walkTo('exercise');
    const dialog = panel();
    expect(within(dialog).getByRole('heading', { name: 'Haz los ejercicios de pensamientos' })).toBeTruthy();
    expect(within(dialog).getByText(/Responde la pregunta sobre el audio/)).toBeTruthy();
    expect(dialog.querySelector('video').getAttribute('src')).toBe('/onboarding/course/desktop/exercise.mp4');

    walkAway();
    expect(panel()).toBeNull();
  });

  test('with reduced motion the keeper shows the still instead of playing the clip', async () => {
    mockMedia({ reducedMotion: true });
    await startWalk();
    walkTo('article');
    expect(panel().querySelector('video')).toBeNull();
    expect(within(panel()).getByRole('img', { name: /artículo/ }).getAttribute('src'))
      .toBe('/onboarding/course/desktop/article.jpg');
  });

  test('counts each kiosk once, however many times it is visited', async () => {
    await startWalk();
    expect(counter()).toMatch(/0 de 6/);
    walkTo('article');
    walkAway();
    walkTo('article');
    walkTo('unlock');
    expect(counter()).toMatch(/2 de 6/);
  });

  test('a closed keeper stays closed while the player lingers, and talks again on the next visit', async () => {
    await startWalk();
    walkTo('tests');
    fireEvent.click(within(panel()).getByRole('button', { name: 'Seguir paseando' }));
    expect(panel()).toBeNull();

    walkAway();
    walkTo('tests');
    expect(within(panel()).getByRole('heading', { name: 'Haz los tests de pensamientos' })).toBeTruthy();
  });

  test('the kiosk list takes the player to a kiosk without walking there', async () => {
    await startWalk();
    fireEvent.click(screen.getByRole('button', { name: /Adivina el personaje/ }));
    expect(within(panel()).getByRole('heading', { name: 'Adivina el personaje' })).toBeTruthy();
    // This step has no clip; the keeper must not show a broken video.
    expect(panel().querySelector('video')).toBeNull();
    // The scene is asked to place the player at that kiosk, on the road.
    const [x] = screen.getByTestId('scene').dataset.at.split(',').map(Number);
    expect(Math.abs(x)).toBeLessThanOrEqual(2);
  });

  test('without WebGL the walk is replaced by the kiosk list, which still works', async () => {
    renderWorld();
    await screen.findByTestId('scene');
    fireEvent.click(screen.getByRole('button', { name: 'no webgl' }));
    expect(screen.queryByTestId('scene')).toBeNull();
    expect(screen.getByText(/no puede mostrar el paseo/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Lee el artículo/ }));
    expect(within(panel()).getByRole('heading', { name: 'Lee el artículo' })).toBeTruthy();
  });

  test('at the end of the road Tales invites the player to the guided chat', async () => {
    await startWalk();
    walkTo('goal');
    fireEvent.click(within(panel()).getByRole('button', { name: 'Sí, empezar la visita' }));
    expect(screen.getByText('guided chat')).toBeTruthy();
    expect(localStorage.getItem(COURSE_ONBOARDING_SEEN_KEY)).toBe('true');
  });

  test('declining Tales\' invitation, or skipping the walk, leads to the course', async () => {
    await startWalk();
    walkTo('goal');
    fireEvent.click(within(panel()).getByRole('button', { name: 'Ahora no' }));
    expect(screen.getByText('course page')).toBeTruthy();
    expect(localStorage.getItem(COURSE_ONBOARDING_SEEN_KEY)).toBe('true');
    cleanup();
    localStorage.clear();

    renderWorld();
    await screen.findByTestId('scene');
    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    expect(screen.getByText('course page')).toBeTruthy();
    expect(localStorage.getItem(COURSE_ONBOARDING_SEEN_KEY)).toBe('true');
  });
});
