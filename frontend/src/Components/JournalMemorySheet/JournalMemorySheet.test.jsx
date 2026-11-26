import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalMemorySheet from './JournalMemorySheet.jsx';

const twoEntries = {
  horizon: '1y',
  date: '2025-11-19',
  entries: [
    { id: 'a', content: 'First thing that morning', topics: [], createdAt: '2025-11-19T08:47:00.000Z' },
    { id: 'b', content: 'Later that night', topics: [], createdAt: '2025-11-19T22:15:00.000Z' },
  ],
};

const renderSheet = (memory = twoEntries, { locale = 'en', onClose = vi.fn() } = {}) => {
  writeStoredLocale(locale);
  render(
    <LocaleProvider>
      <JournalMemorySheet memory={memory} onClose={onClose} />
    </LocaleProvider>,
  );
  return { onClose };
};

const currentCard = () =>
  screen.getAllByRole('article').find((card) => card.getAttribute('aria-hidden') !== 'true');

const originalPointerEvent = window.PointerEvent;
const originalScrollTo = window.scrollTo;
beforeAll(() => {
  // jsdom does not scroll; record the position the sheet restores on close.
  window.scrollTo = (x, y) => {
    window.scrollY = y;
  };
  // jsdom has no PointerEvent, so fireEvent.pointer* would drop clientX and pointerType.
  if (window.PointerEvent) return;
  window.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'touch';
    }
  };
});
afterAll(() => {
  window.PointerEvent = originalPointerEvent;
  window.scrollTo = originalScrollTo;
});

describe('JournalMemorySheet', () => {
  afterEach(() => cleanup());

  test('opens on the first entry under the horizon label and the full date, with focus inside', () => {
    renderSheet();
    const dialog = screen.getByRole('dialog', { name: 'Wednesday, November 19, 2025' });
    expect(within(dialog).getByText('One year ago today')).toBeInTheDocument();
    expect(currentCard()).toHaveTextContent('First thing that morning');
    expect(screen.getByText('Entry 1 of 2')).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  test('labels a one-month memory accordingly', () => {
    renderSheet({ ...twoEntries, horizon: '1m', date: '2026-10-19' });
    expect(screen.getByText('One month ago today')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Monday, October 19, 2026' })).toBeInTheDocument();
  });

  test('dots switch between entries', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Show entry 2 of 2' }));
    expect(currentCard()).toHaveTextContent('Later that night');
    expect(screen.getByText('Entry 2 of 2')).toBeInTheDocument();
  });

  test('a finger swipe past the threshold moves to the next entry; a short one does not', () => {
    renderSheet();
    const track = screen.getByTestId('journal-memory-sheet-viewport');
    fireEvent.pointerDown(track, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 280, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 280, pointerId: 1 });
    expect(currentCard()).toHaveTextContent('First thing that morning');

    fireEvent.pointerDown(track, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 200, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 200, pointerId: 1 });
    expect(currentCard()).toHaveTextContent('Later that night');
  });

  test('a single entry shows no dots and no counter', () => {
    renderSheet({ ...twoEntries, entries: [twoEntries.entries[0]] });
    expect(screen.queryByRole('button', { name: /Show entry/ })).toBeNull();
    expect(screen.queryByText(/Entry 1 of 1/)).toBeNull();
    expect(currentCard()).toHaveTextContent('First thing that morning');
  });

  test('closes with the close button, a tap on the scrim, and Escape', () => {
    const { onClose } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByTestId('journal-memory-sheet-scrim'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test('a tap inside the panel does not close it', () => {
    const { onClose } = renderSheet();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('pulling the handle down far enough closes the sheet; a short pull or a pull up does not', () => {
    let now = 1000;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);
    const { onClose } = renderSheet();
    const handle = screen.getByTestId('journal-memory-sheet-handle');
    // Slow drags, so only the distance decides.
    const drag = (toY) => {
      fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
      now += 600;
      fireEvent.pointerMove(handle, { clientY: toY, pointerId: 1 });
      now += 200;
      fireEvent.pointerUp(handle, { clientY: toY, pointerId: 1 });
    };

    drag(130);
    expect(onClose).not.toHaveBeenCalled();
    drag(-100);
    expect(onClose).not.toHaveBeenCalled();
    drag(260);
    expect(onClose).toHaveBeenCalledTimes(1);
    nowSpy.mockRestore();
  });

  test('a quick downward flick on the handle closes the sheet even when short', () => {
    let now = 1000;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);
    const { onClose } = renderSheet();
    const handle = screen.getByTestId('journal-memory-sheet-handle');

    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
    now += 40;
    fireEvent.pointerMove(handle, { clientY: 140, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 140, pointerId: 1 });
    expect(onClose).toHaveBeenCalledTimes(1);
    nowSpy.mockRestore();
  });

  test('a press on the close button inside the handle area still closes via click, not drag', () => {
    const { onClose } = renderSheet();
    const close = screen.getByRole('button', { name: 'Close' });
    fireEvent.pointerDown(close, { clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(close, { clientY: 100, pointerId: 1 });
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('locks page scroll while open and restores the scroll position on close', () => {
    window.scrollY = 420;
    const { unmount } = render(
      <LocaleProvider>
        <JournalMemorySheet memory={twoEntries} onClose={vi.fn()} />
      </LocaleProvider>,
    );
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-420px');

    window.scrollY = 0; // a fixed body reports no scroll
    unmount();
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(window.scrollY).toBe(420);
  });

  test('shows Spanish labels and a Spanish date', () => {
    renderSheet(twoEntries, { locale: 'es' });
    expect(screen.getByText('Hoy hace un año')).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'Miércoles, 19 de noviembre de 2025' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Entrada 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });
});
