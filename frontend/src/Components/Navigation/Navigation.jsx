import { useState } from 'react';
import './Navigation.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, status } = useAuth();

    const goLogin = () => {
        navigate('/login');
        setIsMenuOpen(false);
    };

    const goCourse = () => {
        navigate('/course');
        setIsMenuOpen(false);
    };

    const goArticle = () => {
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <>
            {isMenuOpen && (
                <div className='navigation__menu-overlay'>
                    <div className='navigation__menu-header'>
                        <button className='navigation__menu-close' onClick={() => setIsMenuOpen(false)}>
                            Cerrar
                        </button>
                    </div>
                    <div className='navigation__menu-links'>
                        <button className='navigation__menu-link' onClick={goArticle}>ARTÍCULO</button>
                        <button className='navigation__menu-link' onClick={goCourse}>CURSO</button>
                    </div>
                </div>
            )}
            <div className="navigation">
                <button className='navigation__section navigation__section--left' onClick={() => setIsMenuOpen(true)}>
                    <img
                        className="navigation__icon"
                        src='/images/menu.svg'
                        alt="Menú"
                    />
                </button>
                <button
                    className='navigation__section navigation__section--right'
                    onClick={!user && status === 'ready' ? goLogin : undefined}
                >
                    {user?.email || 'Login'}
                </button>
            </div>
        </>
    );
}

export default Navigation;
