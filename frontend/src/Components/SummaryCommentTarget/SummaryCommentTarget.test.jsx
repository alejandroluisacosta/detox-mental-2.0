import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SummaryCommentTarget from './SummaryCommentTarget.jsx';

describe('SummaryCommentTarget', () => {
  afterEach(() => {
    cleanup();
  });

  test('calls onComment with the passage when clicked', () => {
    const onComment = vi.fn();
    render(
      <SummaryCommentTarget
        text="You treat planning as safety."
        ariaLabel="Add a comment on this passage"
        onComment={onComment}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Add a comment on this passage' }),
    );
    expect(onComment).toHaveBeenCalledWith('You treat planning as safety.');
  });

  test('shows a note icon on a commented passage', () => {
    render(
      <SummaryCommentTarget
        text="You treat planning as safety."
        commented
        commentMarkAlt="This passage has a comment"
        onComment={vi.fn()}
      />,
    );

    const mark = screen.getByAltText('This passage has a comment');
    expect(mark.getAttribute('src')).toBe('/icons/note.svg');
    expect(mark.className).toContain('summary-comment-target__mark');
  });

  test('renders static text when commenting is disabled', () => {
    render(
      <SummaryCommentTarget
        text="You treat planning as safety."
        disabled
        ariaLabel="Add a comment on this passage"
        onComment={vi.fn()}
      />,
    );

    expect(screen.getByText('You treat planning as safety.')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Add a comment on this passage' }),
    ).toBeNull();
  });
});
