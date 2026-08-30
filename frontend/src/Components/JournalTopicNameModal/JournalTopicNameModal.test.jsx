import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalTopicNameModal from './JournalTopicNameModal.jsx';

vi.mock('../CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

const renderModal = ({
  title = 'New topic',
  initialName = '',
  submitLabel = 'SAVE',
  existingNames = [],
  onClose = vi.fn(),
  onSave = vi.fn(),
  saving = false,
} = {}) => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <JournalTopicNameModal
        title={title}
        initialName={initialName}
        submitLabel={submitLabel}
        existingNames={existingNames}
        onClose={onClose}
        onSave={onSave}
        saving={saving}
      />
    </LocaleProvider>,
  );
};

describe('JournalTopicNameModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders the initial name and submits the normalized value', () => {
    const onSave = vi.fn();
    renderModal({ initialName: 'Family', onSave });

    expect(screen.getByLabelText('Topic name').value).toBe('Family');
    fireEvent.change(screen.getByLabelText('Topic name'), {
      target: { value: '  Family life  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(onSave).toHaveBeenCalledWith('Family life');
  });

  test('shows an inline validation error instead of saving', () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(screen.getByRole('alert').textContent).toBe('Enter a topic name.');
    expect(onSave).not.toHaveBeenCalled();
  });

  test('closes when Escape is pressed', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not close on Escape while saving', () => {
    const onClose = vi.fn();
    renderModal({ onClose, saving: true });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
