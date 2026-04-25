import { useEffect, useMemo, useState } from 'react';
import './Navigation.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';

const Navigation = () => {
    const [menuState, setMenuState] = useState('closed');
    const [isBarVisible, setIsBarVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, status } = useAuth();
    const isCourseRoute = useMemo(
        () => location.pathname.startsWith('/course') || location.pathname.startsWith('/session'),
        [location.pathname],
    );
    const emailLabel = useMemo(() => {
        if (!user?.email) return '';
        const visibleChars = 10;
        return user.email.length > visibleChars
            ? `${user.email.slice(0, visibleChars)}...`
            : user.email;
    }, [user]);

    const goLogin = () => {
        navigate('/login');
        closeMenu();
    };

    const goCourse = () => {
        navigate('/course');
        closeMenu();
    };

    const goArticle = () => {
        navigate('/');
        closeMenu();
    };

    const openMenu = () => {
        setMenuState('open');
    };

    const closeMenu = () => {
        if (window.matchMedia('(min-width: 1000px)').matches) {
            setMenuState('closed');
            return;
        }
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
                        <button type='button' className={`navigation__menu-link${!isCourseRoute ? ' navigation__menu-link--active' : ''}`} onClick={goArticle}>ARTÍCULO</button>
                        <button type='button' className={`navigation__menu-link${isCourseRoute ? ' navigation__menu-link--active' : ''}`} onClick={goCourse}>CURSO</button>
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
                    onClick={!user && status === 'ready' ? goLogin : undefined}
                >
                    {user ? (
                        <>
                            <span className='navigation__user-email' title={user.email}>
                                {emailLabel}
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
