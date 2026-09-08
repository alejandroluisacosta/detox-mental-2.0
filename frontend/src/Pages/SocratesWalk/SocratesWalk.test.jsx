import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SocratesWalk from './SocratesWalk.jsx';

const setMove = vi.fn();
const queueJump = vi.fn();
const resize = vi.fn();
const dispose = vi.fn();

vi.mock('../../utils/createSocratesWalkWorld.js', () => ({
  createSocratesWalkWorld: () => ({
    canvas: document.createElement('canvas'),
    setMove,
    queueJump,
    resize,
    dispose,
  }),
}));

const renderPage = () => render(
  <MemoryRouter>
    <SocratesWalk />
  </MemoryRouter>,
);

describe('SocratesWalk', () => {
  beforeEach(() => {
    setMove.mockReset();
    queueJump.mockReset();
    resize.mockReset();
    dispose.mockReset();
    global.ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    };
  });

  afterEach(() => {
    cleanup();
  });

  test('renders mobile walk and jump controls without product chrome', () => {
    renderPage();
    expect(screen.getByRole('group', { name: 'Move' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Jump' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Exit' }).getAttribute('href')).toBe('/');
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  test('queues a jump from the on-screen button', () => {
    renderPage();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Jump' }));
    expect(queueJump).toHaveBeenCalledTimes(1);
  });

  test('moves from the analog stick and resets on release', () => {
    renderPage();
    const stick = screen.getByRole('group', { name: 'Move' });
    vi.spyOn(stick, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 168,
      height: 168,
      right: 168,
      bottom: 168,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    stick.setPointerCapture = vi.fn();

    const dispatchPointer = (type, clientX, clientY) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        clientX: { value: clientX },
        clientY: { value: clientY },
      });
      stick.dispatchEvent(event);
    };

    dispatchPointer('pointerdown', 104, 84);
    const [nudgeX] = setMove.mock.calls.at(-1);
    expect(Math.abs(nudgeX)).toBeLessThan(0.08);

    dispatchPointer('pointerdown', 156, 84);
    const [fullX, fullZ] = setMove.mock.calls.at(-1);
    expect(fullX).toBeGreaterThan(0.8);
    expect(fullZ).toBeCloseTo(0, 1);

    dispatchPointer('pointerup', 156, 84);
    expect(setMove).toHaveBeenLastCalledWith(0, 0);
  });
});
