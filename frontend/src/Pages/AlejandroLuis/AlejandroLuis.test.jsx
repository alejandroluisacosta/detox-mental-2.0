import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import AlejandroLuis from './AlejandroLuis.jsx';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('AlejandroLuis', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  test('sends BLOG to the personal blog index', () => {
    render(<AlejandroLuis />);

    expect(screen.getByRole('heading', { name: 'Alejandro Luis' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'BLOG' }));
    expect(mockNavigate).toHaveBeenCalledWith('/alejandroluis/blog');
  });

  test('does not offer product module controls', () => {
    render(<AlejandroLuis />);

    expect(screen.queryByRole('button', { name: /education|journal|educación|diario/i })).toBeNull();
  });
});
