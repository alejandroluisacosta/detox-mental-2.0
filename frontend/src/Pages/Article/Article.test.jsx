import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ArticleWrapper from './ArticleWrapper.jsx';

vi.mock('./Article', () => ({
  default: () => <h1>Cómo limpiar tu mente en 5 pasos</h1>,
}));

describe('Theory page', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows the article on the first visit without an intro screen', () => {
    render(<ArticleWrapper />);
    expect(screen.getByRole('heading', { name: 'Cómo limpiar tu mente en 5 pasos' })).toBeTruthy();
  });
});
