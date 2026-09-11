import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SummaryCommentModal from './SummaryCommentModal.jsx';

vi.mock('../CloseIcon/CloseIcon.jsx', () => ({
  default: () => null,
}));

const renderModal = ({ onClose = vi.fn(), onAdd = vi.fn() } = {}) =>
  render(
    <SummaryCommentModal
      labelledById="summary-comment-title"
      title="Comment on this passage"
      quotedText="You treat planning as safety."
      placeholder="What should change?"
      addLabel="ADD COMMENT"
      cancelLabel="CANCEL"
      onClose={onClose}
      onAdd={onAdd}
    />,
  );

describe('SummaryCommentModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('closes when Escape is pressed', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('adds a trimmed note and ignores an empty note', () => {
    const onAdd = vi.fn();
    renderModal({ onAdd });

    const add = screen.getByRole('button', { name: 'ADD COMMENT' });
    expect(add.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('What should change?'), {
      target: { value: '  Soften this.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ADD COMMENT' }));
    expect(onAdd).toHaveBeenCalledWith('Soften this.');
  });

  test('prefills an existing note so it can be edited', () => {
    const onAdd = vi.fn();
    render(
      <SummaryCommentModal
        labelledById="summary-comment-title"
        title="Comment on this passage"
        quotedText="You treat planning as safety."
        placeholder="What should change?"
        addLabel="SAVE COMMENT"
        cancelLabel="CANCEL"
        initialNote="Too harsh."
        onClose={vi.fn()}
        onAdd={onAdd}
      />,
    );

    const field = screen.getByPlaceholderText('What should change?');
    expect(field.value).toBe('Too harsh.');
    fireEvent.change(field, { target: { value: 'Softer, please.' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE COMMENT' }));
    expect(onAdd).toHaveBeenCalledWith('Softer, please.');
  });
});
