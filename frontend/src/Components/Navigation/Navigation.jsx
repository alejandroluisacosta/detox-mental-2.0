import { useEffect, useState } from 'react';
import './Navigation.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { isPromoEnabled } from '../../data/promoConfig.js';

const Navigation = () => {
    const [menuState, setMenuState] = useState('closed');
    const [isBarVisible, setIsBarVisible] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, status } = useAuth();
    const isCourseRoute = location.pathname.startsWith('/course') || location.pathname.startsWith('/session');
    const isTestsRoute = location.pathname.startsWith('/tests') || location.pathname.startsWith('/test');
    const isJournalRoute = location.pathname.startsWith('/journal');
    const isPromoRoute = location.pathname.startsWith('/promo');
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

    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const currentY = window.scrollY;
            if (currentY < lastY) {
                setIsBarVisible(true);
            } else if (currentY > lastY + 6) {
                setIsBarVisible(false);
            }
            lastY = currentY;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
            <div className={`navigation${isBarVisible ? ' navigation--visible' : ''}`}>
                <button type='button' className='navigation__section navigation__section--left' onClick={openMenu}>
                    <img
                        className="navigation__icon"
                        src='/images/menu.svg'
                        alt="Menú"
                    />
                </button>
                <button
                    type='button'
                    className={`navigation__section navigation__section--right${user ? ' navigation__section--right-user' : ''}`}
                    onClick={
                        user
                            ? () => goTo('/account')
                            : (!user && status === 'ready' ? () => goTo('/login') : undefined)
                    }
                >
                    {user ? (
                        <>
                            <span className='navigation__user-email'>
                                PERFIL
                            </span>
                            <img
                                className='navigation__account-icon'
                                src='/icons/account.svg'
                                alt='Cuenta'
                            />
                        </>
                    ) : 'LOGIN'}
                </button>
            </div>
        </>
    );
}

export default Navigation;
