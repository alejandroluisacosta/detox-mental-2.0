import { useState, useRef, useEffect } from 'react';
import './Navigation.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';

const Navigation = () => {
    const [isLinksVisible, setIsLinksVisible] = useState(false);
    const linksContainerRef = useRef(null);
    const navigate = useNavigate();
    const { user, status, logout } = useAuth();

    const goLogin = () => {
        navigate('/login');
        setIsLinksVisible(false);
    };

    const handleLogout = async (e) => {
        e.stopPropagation();
        await logout();
        setIsLinksVisible(false);
    };

    useEffect(() => {
        if (!isLinksVisible) return;
        const onDocumentClick = (e) => {
            if (linksContainerRef.current && !linksContainerRef.current.contains(e.target)) {
                setIsLinksVisible(false);
            }
        };
        document.addEventListener('click', onDocumentClick);
        return () => document.removeEventListener('click', onDocumentClick);
    }, [isLinksVisible]);

    return (
        <div className="navigation">
            {isLinksVisible && (
                <div ref={linksContainerRef} className='navigation__links-container'>
                    <span className='navigation__link' onClick={() => navigate('/')}>ARTÍCULO</span>
                    <hr/>
                    <span className='navigation__link' onClick={() => navigate('/course')}>CURSO</span>
                    {user && (
                        <>
                            <hr />
                            <div className="navigation__user-email" title={user.email}>
                                {user.email}
                            </div>
                            <span className='navigation__link' onClick={handleLogout}>
                                CERRAR SESIÓN
                            </span>
                        </>
                    )}
                    {!user && status === 'ready' && (
                        <>
                            <hr />
                            <span className='navigation__link' onClick={goLogin}>
                                INICIAR SESIÓN
                            </span>
                        </>
                    )}
                </div>
            )}
            <img
                className="navigation__icon"
                src='/images/menu.svg'
                onClick={(e) => { e.stopPropagation(); setIsLinksVisible(v => !v); }}
                alt="Menú"
            />
        </div>
    );
}

export default Navigation;
