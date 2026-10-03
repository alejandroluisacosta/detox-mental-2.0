import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import MeditationPrintCover from './MeditationPrintCover.jsx';

describe('MeditationPrintCover', () => {
  test('renders title in h1 and optional author and years', () => {
    const { container } = render(
      <MeditationPrintCover title="My Book" author="Ada" years="2024 – 2026" />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'My Book' })).toBeTruthy();
    expect(container.querySelector('.meditation-print-cover__title')).toBeTruthy();
    expect(container.querySelector('.meditation-print-cover__author')?.textContent).toBe('Ada');
    expect(container.querySelector('.meditation-print-cover__years')?.textContent).toBe(
      '2024 – 2026',
    );
    expect(container.querySelector('.meditation-print-cover')).toBeTruthy();
  });

  test('omits author when null and years when not provided', () => {
    const { container } = render(<MeditationPrintCover title="Meditations" author={null} />);

    expect(container.querySelector('.meditation-print-cover__author')).toBeNull();
    expect(container.querySelector('.meditation-print-cover__years')).toBeNull();
  });

  test('places an introduction slot after the cover section', () => {
    const { container } = render(<MeditationPrintCover title="Meditations" author={null} />);
    const cover = container.querySelector('.meditation-print-cover');
    const slot = container.querySelector('[data-slot="meditation-print-introduction"]');
    expect(cover?.nextElementSibling).toBe(slot);
    expect(slot?.childElementCount).toBe(0);
  });

  test('does not include word-count copy in cover text', () => {
    const { container } = render(
      <MeditationPrintCover title="Quiet" author={null} years="2026" />,
    );
    expect(container.querySelector('.meditation-print-cover')?.textContent).toBe('Quiet2026');
  });

  test('omits the title heading when the title is empty', () => {
    const { container } = render(
      <MeditationPrintCover title="" author={null} years="2026" />,
    );
    expect(container.querySelector('.meditation-print-cover__title')).toBeNull();
    expect(container.querySelector('.meditation-print-cover__years')?.textContent).toBe('2026');
  });
});
