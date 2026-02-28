import { useState, useRef, useEffect } from 'react';
import './Navigation.css';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
    const [isLinksVisible, setIsLinksVisible] = useState(false);
    const linksContainerRef = useRef(null);
    const navigate = useNavigate();

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
                </div>
            )}
            <img className="navigation__icon" src='/images/menu.svg' onClick={(e) => { e.stopPropagation(); setIsLinksVisible(v => !v); }} alt="" />
        </div>
    );
}

export default Navigation;