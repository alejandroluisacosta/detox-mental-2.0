import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <main className='home-page'>
            <h1 className='home-page__title'>DETOX MENTAL</h1>
            <button
                type='button'
                className='home-page__button home-page__button--education'
                onClick={() => navigate('/theory')}
            >
                <span className='home-page__label'>EDUCACIÓN</span>
            </button>
            <button
                type='button'
                className='home-page__button home-page__button--journal'
                onClick={() => navigate('/journal')}
            >
                <span className='home-page__label'>DIARIO</span>
            </button>
        </main>
    );
};

export default Home;
