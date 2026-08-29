import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalTopicsModal from './JournalTopicsModal.jsx';

vi.mock('../CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
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
  });

  test('renders localized pills with pressed state from initial topics', () => {
    renderModal({ initialTopics: ['Trabajo', 'Reflexión'] });

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
    const onSave = vi.fn();
    renderModal({ initialTopics: ['Trabajo'], onSave });

    fireEvent.click(screen.getByRole('button', { name: 'Reflection' }));
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(onSave).toHaveBeenCalledWith(['Reflexión']);
  });

  test('disables unselected pills once the topic cap is reached', () => {
    renderModal({
      initialTopics: ['Trabajo', 'Interpersonal', 'Reflexión'],
    });

    expect(screen.getByRole('button', { name: 'Wisdom' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Work' }).disabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Wisdom' }));
    expect(screen.getByRole('button', { name: 'Wisdom' }).getAttribute('aria-pressed')).toBe(
      'false',
    );
  });
});
