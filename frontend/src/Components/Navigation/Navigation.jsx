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

const NavIcon = ({ name }) => (
    <span
        className='navigation__icon'
        style={{ '--navigation-icon': `url(/images/nav/${name}.svg)` }}
        aria-hidden='true'
    />
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
                                <NavIcon name='close' />
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
