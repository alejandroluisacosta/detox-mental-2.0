import { useEffect, useState } from 'react';
import './Navigation.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { isPromoEnabled } from '../../data/promoConfig.js';

const Navigation = () => {
    const [menuState, setMenuState] = useState('closed');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, status } = useAuth();
    const isCourseRoute = location.pathname.startsWith('/course') || location.pathname.startsWith('/session');
    const isTestsRoute = location.pathname.startsWith('/tests') || location.pathname.startsWith('/test');
    const isJournalRoute = location.pathname.startsWith('/journal');
    const isPromoRoute = location.pathname.startsWith('/promo');
    const isAccountRoute = location.pathname.startsWith('/account') || location.pathname.startsWith('/login');
    const menuLinks = [
        { label: 'TEORÍA', path: '/', isActive: location.pathname === '/' },
        { label: 'CURSO', path: '/course', isActive: isCourseRoute },
        { label: 'TESTS', path: '/tests', isActive: isTestsRoute },
        { label: 'DIARIO', path: '/journal', isActive: isJournalRoute },
        {
            label: 'INSTRUCCIONES',
            path: '/instructions',
            isActive: location.pathname.startsWith('/instructions'),
        },
        {
            label: user ? 'CUENTA' : 'LOGIN',
            path: user ? '/account' : '/login',
            isActive: isAccountRoute,
            disabled: !user && status !== 'ready',
        },
    ];

    const openMenu = () => {
        setMenuState('open');
    };

    const closeMenu = () => {
        setMenuState('closing');
    };

    const goTo = (path) => {
        navigate(path);
        closeMenu();
    };

    useEffect(() => {
        if (menuState === 'closed') return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeMenu();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [menuState]);

    return (
        <>
            {menuState !== 'closed' && (
                <div
                    className={`navigation__menu-overlay navigation__menu-overlay--${menuState}`}
                    onAnimationEnd={() => {
                        if (menuState === 'closing') setMenuState('closed');
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeMenu();
                    }}
                >
                    <div className='navigation__menu-header'>
                        <button type='button' className='navigation__menu-close' onClick={closeMenu}>
                            Cerrar
                        </button>
                    </div>
                    <div className='navigation__menu-links'>
                        {menuLinks.map((link) => (
                            <button
                                key={link.path}
                                type='button'
                                disabled={link.disabled}
                                className={`navigation__menu-link${link.isActive ? ' navigation__menu-link--active' : ''}`}
                                onClick={() => goTo(link.path)}
                            >
                                {link.label}
                            </button>
                        ))}
                        {isPromoEnabled() && (
                            <button
                                type='button'
                                className={`navigation__menu-link navigation__menu-link--promo${isPromoRoute ? ' navigation__menu-link--active' : ''}`}
                                onClick={() => goTo('/promo')}
                            >
                                GANA 25€
                            </button>
                        )}
                    </div>
                </div>
            )}
            {menuState === 'closed' && (
                <button
                    type='button'
                    className='navigation__reveal'
                    onClick={openMenu}
                    aria-label='Abrir menú'
                >
                    <img
                        className='navigation__reveal-icon'
                        src='/images/menu.svg'
                        alt=''
                        aria-hidden='true'
                    />
                </button>
            )}
        </>
    );
}

export default Navigation;
