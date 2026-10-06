import { existsSync } from 'node:fs';
import { join } from 'node:path';
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

    test('does not offer a personal-site control on journal or education routes', () => {
        mockUseLocation.mockReturnValue({ pathname: '/journal' });
        renderNav();
        openMenu();

        expect(screen.queryByRole('button', { name: /blog|alejandro/i })).toBeNull();
        cleanup();

        mockUseLocation.mockReturnValue({ pathname: '/theory' });
        renderNav();
        openMenu();

        expect(screen.queryByRole('button', { name: /blog|alejandro/i })).toBeNull();
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

        const controls = [...screen.getByRole('dialog', { name: 'Menu' }).querySelectorAll('button')];
        const homeIndex = controls.findIndex((button) => button.textContent === 'Home');
        const journalIndex = controls.findIndex((button) => button.textContent === 'JOURNAL');

        expect(homeIndex).toBeGreaterThanOrEqual(0);
        expect(journalIndex).toBeGreaterThan(homeIndex);
    });

    test('opens the drawer from the floating button and hides that button meanwhile', () => {
        mockUseLocation.mockReturnValue({ pathname: '/theory' });
        renderNav();

        expect(screen.queryByRole('dialog')).toBeNull();
        openMenu();

        expect(screen.getByRole('dialog', { name: 'Menu' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Open menu' })).toBeNull();
    });

    test.each([
        ['the close button', () => fireEvent.click(screen.getByRole('button', { name: 'Close' }))],
        ['the Escape key', () => fireEvent.keyDown(document, { key: 'Escape' })],
        ['a click on the scrim', () => fireEvent.click(document.querySelector('.navigation__scrim'))],
    ])('closes the drawer with %s and brings the floating button back', (_label, close) => {
        mockUseLocation.mockReturnValue({ pathname: '/theory' });
        renderNav();
        openMenu();

        close();
        fireEvent.animationEnd(screen.getByRole('dialog', { name: 'Menu' }));

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getByRole('button', { name: 'Open menu' })).toBeTruthy();
    });

    test('marks only the current route as the current page', () => {
        mockUseLocation.mockReturnValue({ pathname: '/session/3' });
        renderNav();
        openMenu();

        expect(screen.getByRole('button', { name: 'COURSE' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: 'TESTS' })).not.toHaveAttribute('aria-current');
    });

    test('navigates to the chosen link and closes the drawer', () => {
        mockUseLocation.mockReturnValue({ pathname: '/theory' });
        renderNav();
        openMenu();

        fireEvent.click(screen.getByRole('button', { name: 'TESTS' }));
        fireEvent.animationEnd(screen.getByRole('dialog', { name: 'Menu' }));

        expect(mockNavigate).toHaveBeenCalledWith('/tests');
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('lets the user switch between the education and journaling modules', () => {
        mockUseLocation.mockReturnValue({ pathname: '/theory' });
        renderNav();
        openMenu();

        expect(screen.getByRole('button', { name: 'Education' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Journaling' })).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(screen.getByRole('button', { name: 'Journaling' }));
        expect(mockNavigate).toHaveBeenCalledWith('/journal');
        cleanup();

        mockUseLocation.mockReturnValue({ pathname: '/journal/history' });
        renderNav();
        openMenu();

        expect(screen.getByRole('button', { name: 'Journaling' })).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(screen.getByRole('button', { name: 'Education' }));
        expect(mockNavigate).toHaveBeenCalledWith('/theory');
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

    test.each(['/theory', '/journal'])(
        'every icon shown on %s points to an SVG file that exists in public',
        (pathname) => {
            mockUseLocation.mockReturnValue({ pathname });
            renderNav();
            openMenu();

            const icons = [...screen.getByRole('dialog', { name: 'Menu' }).querySelectorAll('.navigation__icon')];
            expect(icons.length).toBe(7);
            icons.forEach((icon) => {
                const url = icon.getAttribute('style').match(/url\((\/[^)]+\.svg)\)/)?.[1];
                expect(url, icon.outerHTML).toBeTruthy();
                expect(existsSync(join(process.cwd(), 'public', url)), url).toBe(true);
            });
        },
    );
});
