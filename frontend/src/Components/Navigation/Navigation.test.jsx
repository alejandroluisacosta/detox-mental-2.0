import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Navigation from './Navigation.jsx';

const mockUseLocation = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useLocation: () => mockUseLocation(),
    useNavigate: () => mockNavigate,
}));

vi.mock('../../Context/AuthContext.jsx', () => ({
    useAuth: () => ({ user: null, status: 'ready' }),
}));

vi.mock('../../data/promoConfig.js', () => ({
    isPromoEnabled: () => false,
}));

const openMenu = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
};

describe('Navigation', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    test('shows educational links on an educational route', () => {
        mockUseLocation.mockReturnValue({ pathname: '/theory' });
        render(<Navigation />);
        openMenu();

        expect(screen.getByRole('button', { name: 'TEORÍA' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'CURSO' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'TESTS' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'INSTRUCCIONES' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'LOGIN' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'HISTORIAL' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'RESUMEN SEMANAL' })).toBeNull();
    });

    test('shows journaling links on a journal route', () => {
        mockUseLocation.mockReturnValue({ pathname: '/journal' });
        render(<Navigation />);
        openMenu();

        expect(screen.getByRole('button', { name: 'DIARIO' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'HISTORIAL' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'RESUMEN SEMANAL' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'LOGIN' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'TEORÍA' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'CURSO' })).toBeNull();
    });

    test('sends the home control to the module chooser', () => {
        mockUseLocation.mockReturnValue({ pathname: '/journal/history' });
        render(<Navigation />);
        openMenu();

        fireEvent.click(screen.getByRole('button', { name: 'Inicio' }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
