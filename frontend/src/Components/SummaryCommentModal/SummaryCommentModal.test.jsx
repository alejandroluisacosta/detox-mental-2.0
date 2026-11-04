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
    expect(screen.getByPlaceholderText('What should change?').maxLength).toBe(
      1000,
    );
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

  test('with a maxLength, shows a live counter and caps the field', () => {
    const onAdd = vi.fn();
    render(
      <SummaryCommentModal
        labelledById="compass-edit-title"
        title="Edit before saving"
        fieldLabel="New text"
        placeholder="A fact about your life"
        addLabel="Save to Compass"
        cancelLabel="Cancel"
        initialNote="Living in Madrid."
        maxLength={200}
        onClose={vi.fn()}
        onAdd={onAdd}
      />,
    );

    const field = screen.getByLabelText('New text');
    expect(field.maxLength).toBe(200);
    expect(screen.getByText('17 / 200')).toBeTruthy();
    fireEvent.change(field, { target: { value: 'Living in Valencia.' } });
    expect(screen.getByText('19 / 200')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Save to Compass' }));
    expect(onAdd).toHaveBeenCalledWith('Living in Valencia.');
  });

  test('shows the text being replaced when given one', () => {
    render(
      <SummaryCommentModal
        labelledById="compass-edit-title"
        title="Edit before saving"
        replaces={{ label: 'Update memory · replaces', text: 'Working at an agency.' }}
        fieldLabel="New text"
        addLabel="Save to Compass"
        cancelLabel="Cancel"
        initialNote="Working at a startup."
        maxLength={200}
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />,
    );
    expect(screen.getByText('Update memory · replaces')).toBeTruthy();
    expect(screen.getByText('Working at an agency.')).toBeTruthy();
  });
});
