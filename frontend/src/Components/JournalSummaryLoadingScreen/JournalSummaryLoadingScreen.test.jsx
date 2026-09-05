import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import {
  SUMMARY_REVEAL_MS,
  SUMMARY_RITUAL_MS,
} from '../../utils/journalSummaryGenerate.js';
import JournalSummaryLoadingScreen from './JournalSummaryLoadingScreen.jsx';

vi.mock('../../data/summaryLoadingQuotes.js', () => ({
  pickDistinctQuotes: () => ['First quote', 'Second quote', 'Third quote'],
  quoteDisplayMs: () => 4000,
}));

const renderScreen = (props = {}) => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <JournalSummaryLoadingScreen {...props} />
    </LocaleProvider>,
  );
};

describe('JournalSummaryLoadingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('keeps the percent below the bar, rotates quotes, and holds at 99% in overtime', () => {
    renderScreen();

    expect(screen.getByText('Preparing your summary...')).toBeTruthy();
    expect(screen.getByText('[0%]')).toBeTruthy();
    expect(screen.queryByText('30')).toBeNull();
    expect(screen.getByText('First quote')).toBeTruthy();
    expect(screen.queryByText('Attempt 2 of 3')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText('Second quote')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText('Third quote')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Third quote')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(SUMMARY_RITUAL_MS - 12000);
    });
    expect(screen.getByText('Preparing your summary...')).toBeTruthy();
    expect(screen.getByText('[99%]')).toBeTruthy();
    expect(screen.getByText('Still loading')).toBeTruthy();
    expect(screen.queryByText('First quote')).toBeNull();
  });

  test('shows attempt chrome on retries and reaches 100% only when ready', () => {
    const onDone = vi.fn();
    const { rerender } = renderScreen({ attempt: 2, onDone });

    expect(screen.getByText('Attempt 2 of 3')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(SUMMARY_RITUAL_MS);
    });
    expect(screen.getByText(/\[99%\]/)).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();

    rerender(
      <LocaleProvider>
        <JournalSummaryLoadingScreen attempt={2} ready onDone={onDone} />
      </LocaleProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(SUMMARY_REVEAL_MS);
    });
    expect(screen.getByText(/\[100%\]/)).toBeTruthy();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test('waits out the ritual even if the request is already ready', () => {
    const onDone = vi.fn();
    renderScreen({ ready: true, onDone });

    act(() => {
      vi.advanceTimersByTime(SUMMARY_RITUAL_MS - 100);
    });
    expect(onDone).not.toHaveBeenCalled();
    expect(screen.queryByText(/\[100%\]/)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      vi.advanceTimersByTime(SUMMARY_REVEAL_MS);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
