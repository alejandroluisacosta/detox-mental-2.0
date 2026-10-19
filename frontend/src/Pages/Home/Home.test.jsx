import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import Home from './Home.jsx';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

const renderHome = (locale = 'en') => {
    writeStoredLocale(locale);
    return render(
        <LocaleProvider>
            <Home />
        </LocaleProvider>,
    );
};

describe('Home', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        localStorage.clear();
    });

    afterEach(() => {
        cleanup();
    });

    test('sends the Education card to the theory route', () => {
        renderHome();
        fireEvent.click(screen.getByRole('button', { name: 'Understand your mind' }));
        expect(mockNavigate).toHaveBeenCalledWith('/theory');
    });

    test('sends the Journal card to the journal route', () => {
        renderHome();
        fireEvent.click(screen.getByRole('button', { name: 'Clear your mind' }));
        expect(mockNavigate).toHaveBeenCalledWith('/journal');
    });

    test('lists the Journal card before the Education card', () => {
        renderHome();
        const cards = screen.getAllByRole('button', { name: /Clear your mind|Understand your mind/ });
        expect(cards.map((card) => card.getAttribute('aria-labelledby'))).toEqual([
            'home-journal-title',
            'home-education-title',
        ]);
    });

    test('is English by default', () => {
        render(
            <LocaleProvider>
                <Home />
            </LocaleProvider>,
        );
        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('The app to reflect.');
        expect(
            screen.getByRole('button', { name: 'Understand your mind' }).getAttribute('aria-describedby'),
        ).toBeTruthy();
        expect(screen.getByText(/\(only in Spanish\)/)).toBeTruthy();
    });

    test('switches to Spanish and remembers the choice', () => {
        renderHome();
        fireEvent.click(screen.getByRole('button', { name: 'Spanish' }));
        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
            'La aplicación para la reflexión.',
        );
        expect(screen.getByRole('button', { name: 'Entiende tu mente' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Inglés' }).getAttribute('aria-pressed')).toBe('false');
        expect(screen.getByRole('button', { name: 'Español' }).getAttribute('aria-pressed')).toBe('true');
        expect(localStorage.getItem('appLocale')).toBe('es');
    });

    test('keeps routing from the Spanish cards', () => {
        renderHome('es');
        fireEvent.click(screen.getByRole('button', { name: 'Vacía tu mente' }));
        expect(mockNavigate).toHaveBeenCalledWith('/journal');
    });

    test('does not offer a control to the personal site', () => {
        renderHome();
        expect(screen.queryByRole('button', { name: /alejandro|blog/i })).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
