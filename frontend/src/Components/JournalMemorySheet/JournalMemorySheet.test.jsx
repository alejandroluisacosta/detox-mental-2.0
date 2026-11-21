import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalMemorySheet from './JournalMemorySheet.jsx';

const MEMORY = {
  horizon: '1y',
  date: '2025-11-19',
  entries: [
    { id: 'e1', content: 'Could not sleep again.', topics: [], createdAt: '2025-11-19T08:47:00.000Z' },
    { id: 'e2', content: 'Talked it through tonight.', topics: [], createdAt: '2025-11-19T22:15:00.000Z' },
  ],
};

const renderSheet = (locale = 'en', memory = MEMORY) => {
  writeStoredLocale(locale);
  const onClose = vi.fn();
  render(
    <LocaleProvider>
      <JournalMemorySheet memory={memory} onClose={onClose} />
    </LocaleProvider>,
  );
  return { onClose };
};

describe('JournalMemorySheet', () => {
  afterEach(() => {
    cleanup();
  });

  test('opens on the first entry of that day under its anniversary date', () => {
    renderSheet();
    const dialog = screen.getByRole('dialog', { name: 'Wednesday, November 19, 2025' });
    expect(dialog).toBeTruthy();
    expect(screen.getByText('One year ago today')).toBeTruthy();
    expect(screen.getByText('Entry 1 of 2')).toBeTruthy();
  });

  test('the dots move to the other entries of that day', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Show entry 2 of 2' }));
    expect(screen.getByText('Entry 2 of 2')).toBeTruthy();
  });

  test('a single entry shows no dots', () => {
    renderSheet('en', { ...MEMORY, entries: [MEMORY.entries[0]] });
    expect(screen.queryByRole('button', { name: /Show entry/ })).toBeNull();
  });

  test('closes from the close button, the backdrop and Escape', () => {
    const { onClose } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByTestId('journal-memory-sheet-scrim'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test('speaks Spanish for monthly anniversaries', () => {
    renderSheet('es', { ...MEMORY, horizon: '1m', date: '2026-10-19' });
    expect(screen.getByText('Hoy hace un mes')).toBeTruthy();
    expect(screen.getByRole('dialog', { name: 'lunes, 19 de octubre de 2026' })).toBeTruthy();
  });
});
