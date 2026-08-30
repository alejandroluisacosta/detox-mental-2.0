import { useEffect, useState } from 'react';
import './Navigation.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { isPromoEnabled } from '../../data/promoConfig.js';
import {
    EDUCATIONAL_LINKS,
    JOURNALING_LINKS,
    resolveNavModule,
} from '../../data/navigationModules.js';

const LANGUAGE_OPTIONS = [
    { locale: 'en', flag: '🇺🇸', labelKey: 'nav.english' },
    { locale: 'es', flag: '🇪🇸', labelKey: 'nav.spanish' },
];

const Navigation = () => {
    const [menuState, setMenuState] = useState('closed');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, status } = useAuth();
    const { locale, setLocale, t } = useLocale();
    const navModule = resolveNavModule(location.pathname);
    const moduleLinks = navModule === 'journaling' ? JOURNALING_LINKS : EDUCATIONAL_LINKS;
    const isPromoRoute = location.pathname.startsWith('/promo');
    const isAccountRoute = location.pathname.startsWith('/account') || location.pathname.startsWith('/login');
    const menuLinks = [
        ...moduleLinks.map((link) => ({
            ...link,
            label: t(link.labelKey),
            isActive: link.isActive(location.pathname),
        })),
        {
            label: user ? t('nav.account') : t('nav.login'),
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
                            {t('nav.close')}
                        </button>
                    </div>
                    <div className='navigation__menu-links'>
                        <button
                            type='button'
                            className='navigation__menu-link navigation__menu-link--home'
                            onClick={() => goTo('/')}
                            aria-label={t('nav.home')}
                        >
                            <img
                                className='navigation__menu-home-icon'
                                src='/images/home.svg'
                                alt=''
                                aria-hidden='true'
                            />
                        </button>
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
                        {navModule === 'educational' && isPromoEnabled() && (
                            <button
                                type='button'
                                className={`navigation__menu-link navigation__menu-link--promo${isPromoRoute ? ' navigation__menu-link--active' : ''}`}
                                onClick={() => goTo('/promo')}
                            >
                                {t('nav.promo')}
                            </button>
                        )}
                        <div
                            className='navigation__language'
                            role='group'
                            aria-label={t('nav.language')}
                        >
                            {LANGUAGE_OPTIONS.map((option) => {
                                const selected = locale === option.locale;
                                const languageName = t(option.labelKey);
                                return (
                                    <button
                                        key={option.locale}
                                        type='button'
                                        className={`navigation__language-button${selected ? ' navigation__language-button--active' : ''}`}
                                        onClick={() => setLocale(option.locale)}
                                        aria-pressed={selected}
                                        aria-label={languageName}
                                    >
                                        <span className='navigation__language-flag' aria-hidden='true'>
                                            {option.flag}
                                        </span>
                                        <span className='navigation__language-name'>{languageName}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            {menuState === 'closed' && (
                <button
                    type='button'
                    className='navigation__reveal'
                    onClick={openMenu}
                    aria-label={t('nav.openMenu')}
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
};

export default Navigation;
