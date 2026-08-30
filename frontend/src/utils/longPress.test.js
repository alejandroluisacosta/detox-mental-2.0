import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createLongPressHandlers } from './longPress.js';

describe('createLongPressHandlers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('fires onLongPress after the delay and consumes the following click', () => {
    const onLongPress = vi.fn();
    const handlers = createLongPressHandlers({ onLongPress, delayMs: 500 });

    handlers.onPointerDown({ pointerType: 'touch', button: 0 });
    vi.advanceTimersByTime(499);
    expect(onLongPress).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(handlers.consumeClickIfLongPress()).toBe(true);
    expect(handlers.consumeClickIfLongPress()).toBe(false);
  });

  test('cancels the hold when the pointer is released early', () => {
    const onLongPress = vi.fn();
    const handlers = createLongPressHandlers({ onLongPress, delayMs: 500 });

    handlers.onPointerDown({ pointerType: 'touch', button: 0 });
    handlers.onPointerUp();
    vi.advanceTimersByTime(500);

    expect(onLongPress).not.toHaveBeenCalled();
    expect(handlers.consumeClickIfLongPress()).toBe(false);
  });

  test('prevents the context menu', () => {
    const handlers = createLongPressHandlers({ onLongPress: vi.fn() });
    const event = { preventDefault: vi.fn() };

    handlers.onContextMenu(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });
});
