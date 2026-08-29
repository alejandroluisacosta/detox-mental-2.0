import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import JournalConfirmModal from './JournalConfirmModal.jsx';

vi.mock('../CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

const renderModal = ({ onClose = vi.fn() } = {}) =>
  render(
    <JournalConfirmModal
      labelledById="confirm-title"
      title="Delete this entry?"
      text="This action cannot be undone."
      onClose={onClose}
      primary={{ label: 'DELETE', onClick: vi.fn() }}
      secondary={{ label: 'CANCEL', onClick: onClose }}
    />,
  );

describe('JournalConfirmModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('closes when Escape is pressed', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
