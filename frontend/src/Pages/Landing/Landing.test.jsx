import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing.jsx';

describe('Landing', () => {
  afterEach(() => {
    cleanup();
  });

  test('explains the product and links to the existing entry flows', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /Entiende lo que piensas/i })
    ).toBeInTheDocument();
    expect(screen.getByText('15 SESIONES GUIADAS')).toBeInTheDocument();

    const onboardingLinks = screen.getAllByRole('link', {
      name: /Empezar mi recorrido|Conocer a Tales/i,
    });
    onboardingLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/onboarding');
    });
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
  });
});
