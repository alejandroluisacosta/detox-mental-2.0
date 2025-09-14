import { useState } from 'react';
import './Navigation.css';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
    const [isLinksVisible, setIsLinksVisible] = useState(false);
    const navigate = useNavigate();
    return (
        <div className="navigation">
            {isLinksVisible && <div className='navigation__links-container'>
                <span className='navigation__link' onClick={() => navigate('/')}>ARTÍCULO</span>
                <hr/>
                <span className='navigation__link' onClick={() => navigate('/course')}>CURSO</span>
            </div>}
            <img className="navigation__icon" src='/images/menu.svg' onClick={() => setIsLinksVisible(v => !v)}/>
        </div>
    );
}

export default Navigation;