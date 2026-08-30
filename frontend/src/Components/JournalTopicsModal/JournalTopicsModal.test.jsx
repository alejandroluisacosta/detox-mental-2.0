import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import { JOURNAL_TOPIC_IDS } from '../../data/journalTopics.js';
import JournalTopicsModal from './JournalTopicsModal.jsx';

const mockUseJournalTopics = vi.fn();

vi.mock('../CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

vi.mock('../../Context/JournalTopicsContext.jsx', () => ({
  useJournalTopics: () => mockUseJournalTopics(),
}));

const renderModal = ({
  initialTopics = [],
  onClose = vi.fn(),
  onSave = vi.fn(),
  saving = false,
} = {}) => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <JournalTopicsModal
        initialTopics={initialTopics}
        onClose={onClose}
        onSave={onSave}
        saving={saving}
      />
    </LocaleProvider>,
  );
};

describe('JournalTopicsModal', () => {
  afterEach(() => {
    cleanup();
    mockUseJournalTopics.mockReset();
  });

  const stubTopics = (allTopics = JOURNAL_TOPIC_IDS) => {
    mockUseJournalTopics.mockReturnValue({
      customTopics: [],
      allTopics,
      status: 'ready',
      createTopic: vi.fn(),
      renameTopic: vi.fn(),
    });
  };

  test('renders localized pills with pressed state from initial topics', () => {
    stubTopics();
    renderModal({ initialTopics: ['work', 'reflection'] });

    expect(screen.getByRole('button', { name: 'Work' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Reflection' }).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Interpersonal' }).getAttribute('aria-pressed'),
    ).toBe('false');
    expect(screen.getByRole('button', { name: 'Wisdom' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Worries' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Meditations' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Private' })).toBeTruthy();
  });

  test('toggles a pill on and off before saving the selected ids', () => {
    stubTopics();
    const onSave = vi.fn();
    renderModal({ initialTopics: ['work'], onSave });

    fireEvent.click(screen.getByRole('button', { name: 'Reflection' }));
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(onSave).toHaveBeenCalledWith(['reflection']);
  });

  test('disables unselected pills once the topic cap is reached', () => {
    stubTopics();
    renderModal({
      initialTopics: ['work', 'interpersonal', 'reflection'],
    });

    expect(screen.getByRole('button', { name: 'Wisdom' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Work' }).disabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Wisdom' }));
    expect(screen.getByRole('button', { name: 'Wisdom' }).getAttribute('aria-pressed')).toBe(
      'false',
    );
  });

  test('renders custom topics from the shared catalog', () => {
    stubTopics([...JOURNAL_TOPIC_IDS, 'Family']);
    renderModal();

    expect(screen.getByRole('button', { name: 'Family' })).toBeTruthy();
  });

  test('closes when Escape is pressed', () => {
    stubTopics();
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not close on Escape while saving', () => {
    stubTopics();
    const onClose = vi.fn();
    renderModal({ onClose, saving: true });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
