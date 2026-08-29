import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import Home from './Home.jsx';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

const renderHome = (locale = 'en') =>
    render(
        <LocaleProvider initialLocale={locale}>
            <Home />
        </LocaleProvider>,
    );

describe('Home', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    test('shows the brand on the module chooser', () => {
        renderHome();
        expect(screen.getByRole('heading', { name: 'DETOX MENTAL' })).toBeTruthy();
    });

    test('sends EDUCATION to the theory route', () => {
        renderHome();
        fireEvent.click(screen.getByRole('button', { name: 'EDUCATION' }));
        expect(mockNavigate).toHaveBeenCalledWith('/theory');
    });

    test('sends JOURNAL to the journal route', () => {
        renderHome();
        fireEvent.click(screen.getByRole('button', { name: 'JOURNAL' }));
        expect(mockNavigate).toHaveBeenCalledWith('/journal');
    });

    test('shows Spanish module labels when the locale is Spanish', () => {
        renderHome('es');
        expect(screen.getByRole('button', { name: 'EDUCACIÓN' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'DIARIO' })).toBeTruthy();
    });
});
