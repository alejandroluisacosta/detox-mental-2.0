import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Root from './Root.jsx';

let authState;

vi.mock('../../Context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}));

vi.mock('../Home/Home.jsx', () => ({
  default: () => <div>Inicio de la aplicación</div>,
}));

vi.mock('../Landing/Landing.jsx', () => ({
  default: () => <div>Landing pública</div>,
}));

describe('Root', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows a loading state while authentication resolves', () => {
    authState = { user: null, status: 'loading' };
    render(<Root />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu espacio…');
  });

  test('shows the public landing page to visitors', () => {
    authState = { user: null, status: 'ready' };
    render(<Root />);
    expect(screen.getByText('Landing pública')).toBeInTheDocument();
  });

  test('preserves the existing home for authenticated users', () => {
    authState = { user: { id: 'user-1' }, status: 'ready' };
    render(<Root />);
    expect(screen.getByText('Inicio de la aplicación')).toBeInTheDocument();
  });
});
