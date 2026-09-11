import { describe, expect, test } from 'vitest';
import { upsertSectionComment } from './summaryComments.js';

describe('upsertSectionComment', () => {
  test('appends a comment for a new section', () => {
    const next = upsertSectionComment(
      [{ id: 1, section: 'bestQuote', quotedText: 'A', note: 'Keep' }],
      { id: 2, section: 'summaryText', quotedText: 'B', note: 'Change' },
    );
    expect(next).toHaveLength(2);
    expect(next[1].section).toBe('summaryText');
  });

  test('replaces the existing comment for the same section', () => {
    const next = upsertSectionComment(
      [
        {
          id: 1,
          section: 'summaryText',
          quotedText: 'First paragraph.',
          note: 'Too harsh.',
        },
      ],
      {
        id: 99,
        section: 'summaryText',
        quotedText: 'Second paragraph.',
        note: 'Softer, please.',
      },
    );
    expect(next).toHaveLength(1);
    expect(next[0]).toEqual({
      id: 1,
      section: 'summaryText',
      quotedText: 'Second paragraph.',
      note: 'Softer, please.',
    });
  });
});
