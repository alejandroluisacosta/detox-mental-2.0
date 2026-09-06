import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import {
  SUMMARY_QUOTE_MS,
  SUMMARY_REVEAL_MS,
  SUMMARY_RITUAL_MS,
} from '../../utils/journalSummaryGenerate.js';
import JournalSummaryLoadingScreen from './JournalSummaryLoadingScreen.jsx';

vi.mock('../../data/summaryLoadingQuotes.js', () => ({
  pickDistinctQuotes: () => ['First quote', 'Second quote', 'Third quote'],
}));

const renderScreen = (props = {}) => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <JournalSummaryLoadingScreen {...props} />
    </LocaleProvider>,
  );
};

const TASK_LABELS = [
  'Reading your entries of the last 7 days',
  'Socrates is writing his question',
  'Machiavelli is defining his challenge',
  'Finishing your summary',
];

const getTaskItems = () => screen.getAllByRole('listitem');

const expectTaskState = (index, { current = false, completed = false } = {}) => {
  const item = getTaskItems()[index];
  expect(item.getAttribute('aria-current')).toBe(current ? 'step' : null);
  const completedMarker = item.querySelector(
    '.journal-summary-loading-screen__task-marker--completed',
  );
  const glowLabel = item.querySelector(
    '.journal-summary-loading-screen__task-label--glow',
  );
  if (completed) {
    expect(completedMarker).toBeTruthy();
    expect(glowLabel).toBeNull();
  } else if (current) {
    expect(completedMarker).toBeNull();
    expect(glowLabel).toBeTruthy();
  } else {
    expect(completedMarker).toBeNull();
    expect(glowLabel).toBeNull();
  }
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
      vi.advanceTimersByTime(SUMMARY_QUOTE_MS);
    });
    expect(screen.getByText('Second quote')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(SUMMARY_QUOTE_MS);
    });
    expect(screen.getByText('Third quote')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(SUMMARY_QUOTE_MS);
    });
    expect(screen.getByText('First quote')).toBeTruthy();
    expect(screen.getByText('[99%]')).toBeTruthy();
    expect(screen.getByText('Still loading')).toBeTruthy();
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

  test('shows four tasks with the first step active at 0s', () => {
    renderScreen();

    TASK_LABELS.forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
    expectTaskState(0, { current: true });
    expectTaskState(1);
    expectTaskState(2);
    expectTaskState(3);
  });

  test('completes earlier steps and shows philosopher avatars on the timeline', () => {
    renderScreen();

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expectTaskState(0, { completed: true });
    expectTaskState(1, { current: true });
    expect(screen.getByRole('img', { name: 'Socrates' }).getAttribute('src')).toBe(
      '/images/socrates.webp',
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expectTaskState(1, { completed: true });
    expectTaskState(2, { current: true });
    expect(
      screen.getByRole('img', { name: 'Machiavelli' }).getAttribute('src'),
    ).toBe('/images/machiavelli.webp');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expectTaskState(2, { completed: true });
    expectTaskState(3, { current: true });
    expect(screen.getByRole('img', { name: 'Machiavelli' })).toBeTruthy();
  });

  test('keeps the last task active in overtime until the summary is ready', () => {
    const onDone = vi.fn();
    const { rerender } = renderScreen({ onDone });

    act(() => {
      vi.advanceTimersByTime(SUMMARY_RITUAL_MS);
    });
    expectTaskState(0, { completed: true });
    expectTaskState(1, { completed: true });
    expectTaskState(2, { completed: true });
    expectTaskState(3, { current: true });
    expect(screen.getByText('[99%]')).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();

    rerender(
      <LocaleProvider>
        <JournalSummaryLoadingScreen ready onDone={onDone} />
      </LocaleProvider>,
    );

    expectTaskState(3, { completed: true });
    act(() => {
      vi.advanceTimersByTime(SUMMARY_REVEAL_MS);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
