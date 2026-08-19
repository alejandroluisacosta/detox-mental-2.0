import { describe, expect, test } from 'vitest';
import { getTopicsFadeEdges } from './journalTopicsFade.js';

describe('getTopicsFadeEdges', () => {
  test('shows no fades when content fits', () => {
    expect(
      getTopicsFadeEdges({ scrollLeft: 0, clientWidth: 320, scrollWidth: 320 })
    ).toEqual({ left: false, right: false });
  });

  test('shows only the right fade at the start of an overflowing row', () => {
    expect(
      getTopicsFadeEdges({ scrollLeft: 0, clientWidth: 320, scrollWidth: 480 })
    ).toEqual({ left: false, right: true });
  });

  test('shows both fades while scrolled in the middle', () => {
    expect(
      getTopicsFadeEdges({ scrollLeft: 80, clientWidth: 320, scrollWidth: 480 })
    ).toEqual({ left: true, right: true });
  });

  test('shows only the left fade at the end of an overflowing row', () => {
    expect(
      getTopicsFadeEdges({ scrollLeft: 160, clientWidth: 320, scrollWidth: 480 })
    ).toEqual({ left: true, right: false });
  });
});
