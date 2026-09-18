import { describe, expect, test } from 'vitest';
import { wrapMarkdownEmphasis, wrapMarkdownLink } from './markdownFormat.js';

describe('wrapMarkdownEmphasis', () => {
  test('wraps the selection in bold markers', () => {
    expect(wrapMarkdownEmphasis('Hello world', 0, 5, '**')).toEqual({
      value: '**Hello** world',
      selectionStart: 2,
      selectionEnd: 7,
    });
  });

  test('wraps the selection in italic markers', () => {
    expect(wrapMarkdownEmphasis('Hello world', 6, 11, '*')).toEqual({
      value: 'Hello *world*',
      selectionStart: 7,
      selectionEnd: 12,
    });
  });

  test('inserts a placeholder when nothing is selected', () => {
    expect(wrapMarkdownEmphasis('ab', 1, 1, '**')).toEqual({
      value: 'a**text**b',
      selectionStart: 3,
      selectionEnd: 7,
    });
  });

  test('unwraps markers that already surround the selection', () => {
    expect(wrapMarkdownEmphasis('Say **Hello** now', 6, 11, '**')).toEqual({
      value: 'Say Hello now',
      selectionStart: 4,
      selectionEnd: 9,
    });
  });

  test('unwraps markers included in the selection', () => {
    expect(wrapMarkdownEmphasis('**Hello**', 0, 9, '**')).toEqual({
      value: 'Hello',
      selectionStart: 0,
      selectionEnd: 5,
    });
  });
});

describe('wrapMarkdownLink', () => {
  test('turns selected text into a markdown link and selects the URL', () => {
    expect(wrapMarkdownLink('See the site', 4, 12)).toEqual({
      value: 'See [the site](https://)',
      selectionStart: 16,
      selectionEnd: 24,
    });
  });

  test('inserts a labeled link when nothing is selected', () => {
    expect(wrapMarkdownLink('', 0, 0)).toEqual({
      value: '[link text](https://)',
      selectionStart: 1,
      selectionEnd: 10,
    });
  });
});
