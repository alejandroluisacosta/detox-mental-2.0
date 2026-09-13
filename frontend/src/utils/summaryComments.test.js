import { describe, expect, test } from 'vitest';
import {
  commentTargetId,
  upsertTargetComment,
} from './summaryComments.js';

describe('upsertTargetComment', () => {
  test('appends a comment for a new passage', () => {
    const next = upsertTargetComment(
      [
        {
          id: 1,
          targetId: commentTargetId('summaryText', 0),
          section: 'summaryText',
          quotedText: 'A',
          note: 'Keep',
        },
      ],
      {
        id: 2,
        targetId: commentTargetId('summaryText', 1),
        section: 'summaryText',
        quotedText: 'B',
        note: 'Change',
      },
    );
    expect(next).toHaveLength(2);
    expect(next[1].targetId).toBe('summaryText:1');
  });

  test('replaces the existing comment for the same passage', () => {
    const next = upsertTargetComment(
      [
        {
          id: 1,
          targetId: commentTargetId('summaryText', 0),
          section: 'summaryText',
          quotedText: 'First paragraph.',
          note: 'Too harsh.',
        },
      ],
      {
        id: 99,
        targetId: commentTargetId('summaryText', 0),
        section: 'summaryText',
        quotedText: 'First paragraph.',
        note: 'Softer, please.',
      },
    );
    expect(next).toHaveLength(1);
    expect(next[0]).toEqual({
      id: 1,
      targetId: 'summaryText:0',
      section: 'summaryText',
      quotedText: 'First paragraph.',
      note: 'Softer, please.',
    });
  });
});
