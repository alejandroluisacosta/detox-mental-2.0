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

const MODULE_OPTIONS = [
    { module: 'educational', labelKey: 'nav.moduleEducation', path: '/theory' },
    { module: 'journaling', labelKey: 'nav.moduleJournaling', path: '/journal' },
];

const ICON_PATHS = {
    home: ['M3 11l9-8 9 8', 'M5 10v10h14V10'],
    '/theory': ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 21a2 2 0 0 1 2-2h13'],
    '/course': ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M10 8.5l5 3.5-5 3.5z'],
    '/tests': ['M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z', 'M8.5 12.5l2.5 2.5 4.5-5'],
    '/instructions': ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 11v5', 'M12 8h.01'],
    '/journal': ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
    '/journal/history': ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
    '/journal/meditations': ['M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'],
    '/journal/summary': ['M5 20V10', 'M12 20V4', 'M19 20v-7'],
    account: ['M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M4 21a8 8 0 0 1 16 0'],
};

const NavIcon = ({ name }) => (
    <svg
        className='navigation__icon'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
    >
        {(ICON_PATHS[name] ?? []).map((d) => (
            <path key={d} d={d} />
        ))}
    </svg>
);

const Navigation = () => {
    const [menuState, setMenuState] = useState('closed');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, status } = useAuth();
    const { locale, setLocale, t } = useLocale();
    const navModule = resolveNavModule(location.pathname);
    const moduleLinks = navModule === 'journaling' ? JOURNALING_LINKS : EDUCATIONAL_LINKS;
    const mainLinks = moduleLinks.map((link) => ({
        ...link,
        icon: link.path,
        label: t(link.labelKey),
        isActive: link.isActive(location.pathname),
    }));
    const isPromoRoute = location.pathname.startsWith('/promo');
    const isAccountRoute = location.pathname.startsWith('/account') || location.pathname.startsWith('/login');
    const accountLink = {
        label: user ? t('nav.account') : t('nav.login'),
        path: user ? '/account' : '/login',
        icon: 'account',
        isActive: isAccountRoute,
        disabled: !user && status !== 'ready',
    };

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

    const renderLink = (link) => (
        <button
            key={link.path}
            type='button'
            disabled={link.disabled}
            className={`navigation__link${link.isActive ? ' navigation__link--active' : ''}`}
            aria-current={link.isActive ? 'page' : undefined}
            onClick={() => goTo(link.path)}
        >
            <NavIcon name={link.icon} />
            {link.label}
        </button>
    );

    return (
        <>
            {menuState !== 'closed' && (
                <div className='navigation__overlay'>
                    <div
                        className={`navigation__scrim navigation__scrim--${menuState}`}
                        onClick={closeMenu}
                    />
                    <div
                        role='dialog'
                        aria-modal='true'
                        aria-label={t('nav.menu')}
                        className={`navigation__drawer navigation__drawer--${menuState}`}
                        onAnimationEnd={(e) => {
                            if (e.target === e.currentTarget && menuState === 'closing') {
                                setMenuState('closed');
                            }
                        }}
                    >
                        <div className='navigation__drawer-header'>
                            <button
                                type='button'
                                className='navigation__home'
                                onClick={() => goTo('/')}
                            >
                                <NavIcon name='home' />
                                {t('nav.home')}
                            </button>
                            <button
                                type='button'
                                className='navigation__close'
                                onClick={closeMenu}
                                aria-label={t('nav.close')}
                            >
                                <svg
                                    className='navigation__icon'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    aria-hidden='true'
                                >
                                    <path d='M6 6l12 12' />
                                    <path d='M18 6L6 18' />
                                </svg>
                            </button>
                        </div>
                        <div className='navigation__segmented'>
                            {MODULE_OPTIONS.map((option) => {
                                const selected = navModule === option.module;
                                return (
                                    <button
                                        key={option.module}
                                        type='button'
                                        className={`navigation__segment${selected ? ' navigation__segment--active' : ''}`}
                                        aria-pressed={selected}
                                        onClick={() => (selected ? closeMenu() : goTo(option.path))}
                                    >
                                        {t(option.labelKey)}
                                    </button>
                                );
                            })}
                        </div>
                        <nav className='navigation__links' aria-label={t('nav.menu')}>
                            {mainLinks.map(renderLink)}
                        </nav>
                        {navModule === 'educational' && isPromoEnabled() && (
                            <button
                                type='button'
                                className={`navigation__promo${isPromoRoute ? ' navigation__promo--active' : ''}`}
                                onClick={() => goTo('/promo')}
                            >
                                {t('nav.promo')}
                            </button>
                        )}
                        <div className='navigation__footer'>
                            {renderLink(accountLink)}
                            <div
                                className='navigation__segmented'
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
                                            className={`navigation__segment${selected ? ' navigation__segment--active' : ''}`}
                                            onClick={() => setLocale(option.locale)}
                                            aria-pressed={selected}
                                            aria-label={languageName}
                                        >
                                            <span aria-hidden='true'>{option.flag}</span>
                                            <span aria-hidden='true'>{languageName}</span>
                                        </button>
                                    );
                                })}
                            </div>
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
