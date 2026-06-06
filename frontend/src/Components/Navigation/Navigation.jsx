import { useEffect, useMemo, useState } from 'react';
import './Navigation.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';

const Navigation = () => {
    const [menuState, setMenuState] = useState('closed');
    const [isBarVisible, setIsBarVisible] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, status } = useAuth();
    const isCourseRoute = useMemo(
        () => location.pathname.startsWith('/course') || location.pathname.startsWith('/session'),
        [location.pathname],
    );
    const isArticleRoute = useMemo(() => location.pathname === '/', [location.pathname]);
    const isInstructionsRoute = useMemo(
        () => location.pathname.startsWith('/instructions'),
        [location.pathname],
    );
    const isPromoRoute = useMemo(
        () => location.pathname.startsWith('/promo'),
        [location.pathname],
    );

    const goLogin = () => {
        navigate('/login');
        closeMenu();
    };

    const goCourse = () => {
        navigate('/course');
        closeMenu();
    };

    const goAccount = () => {
        navigate('/account');
        closeMenu();
    };

    const goInstructions = () => {
        navigate('/instructions');
        closeMenu();
    };

    const goArticle = () => {
        navigate('/');
        closeMenu();
    };

    const goPromo = () => {
        navigate('/promo');
        closeMenu();
    };

    const openMenu = () => {
        setMenuState('open');
    };

    const closeMenu = () => {
        setMenuState('closing');
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
                        <button type='button' className={`navigation__menu-link${isArticleRoute ? ' navigation__menu-link--active' : ''}`} onClick={goArticle}>TEORÍA</button>
                        <button type='button' className={`navigation__menu-link${isCourseRoute ? ' navigation__menu-link--active' : ''}`} onClick={goCourse}>CURSO</button>
                        <button type='button' className={`navigation__menu-link${isInstructionsRoute ? ' navigation__menu-link--active' : ''}`} onClick={goInstructions}>INSTRUCCIONES</button>
                        <button type='button' className={`navigation__menu-link navigation__menu-link--promo${isPromoRoute ? ' navigation__menu-link--active' : ''}`} onClick={goPromo}>GANA 25€</button>
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
                    onClick={user ? goAccount : (!user && status === 'ready' ? goLogin : undefined)}
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
