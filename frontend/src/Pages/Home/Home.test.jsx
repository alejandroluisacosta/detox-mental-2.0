import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Home from './Home.jsx';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('Home', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    test('sends EDUCACIÓN to the theory route', () => {
        render(<Home />);
        fireEvent.click(screen.getByRole('button', { name: 'EDUCACIÓN' }));
        expect(mockNavigate).toHaveBeenCalledWith('/theory');
    });

    test('sends DIARIO to the journal route', () => {
        render(<Home />);
        fireEvent.click(screen.getByRole('button', { name: 'DIARIO' }));
        expect(mockNavigate).toHaveBeenCalledWith('/journal');
    });
});
