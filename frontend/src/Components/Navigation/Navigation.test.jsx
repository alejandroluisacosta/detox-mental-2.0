import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
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

const renderNav = (locale = 'en') => {
    writeStoredLocale(locale);
    return render(
        <LocaleProvider>
            <Navigation />
        </LocaleProvider>,
    );
};

const openMenu = () => {
    fireEvent.click(screen.getByRole('button', { name: /Open menu|Abrir menú/ }));
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
        renderNav();
        openMenu();

        expect(screen.getByRole('button', { name: 'THEORY' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'COURSE' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'TESTS' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'INSTRUCTIONS' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'LOGIN' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'HISTORY' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'WEEKLY SUMMARY' })).toBeNull();
    });

    test('shows journaling links on a journal route', () => {
        mockUseLocation.mockReturnValue({ pathname: '/journal' });
        renderNav();
        openMenu();

        expect(screen.getByRole('button', { name: 'JOURNAL' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'HISTORY' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'WEEKLY SUMMARY' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'LOGIN' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'THEORY' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'COURSE' })).toBeNull();
    });

    test('sends the home control to the module chooser', () => {
        mockUseLocation.mockReturnValue({ pathname: '/journal/history' });
        renderNav();
        openMenu();

        fireEvent.click(screen.getByRole('button', { name: 'Home' }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('places the home control above the module links', () => {
        mockUseLocation.mockReturnValue({ pathname: '/journal' });
        renderNav();
        openMenu();

        const menu = document.querySelector('.navigation__menu-links');
        const controls = [...menu.querySelectorAll('button')];
        const homeIndex = controls.findIndex((button) => button.getAttribute('aria-label') === 'Home');
        const journalIndex = controls.findIndex((button) => button.textContent === 'JOURNAL');

        expect(homeIndex).toBe(0);
        expect(journalIndex).toBeGreaterThan(homeIndex);
    });

    test('switches journaling labels from English to Spanish with the flag controls', () => {
        mockUseLocation.mockReturnValue({ pathname: '/journal' });
        renderNav('en');
        openMenu();

        fireEvent.click(screen.getByRole('button', { name: 'Spanish' }));
        expect(screen.getByRole('button', { name: 'DIARIO' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'HISTORIAL' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Español' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });
});
