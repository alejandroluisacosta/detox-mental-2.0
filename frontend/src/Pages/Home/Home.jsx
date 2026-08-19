import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <main className='home-page'>
            <h1 className='home-page__title'>Detox Mental</h1>
            <button
                type='button'
                className='home-page__button home-page__button--education'
                onClick={() => navigate('/theory')}
            >
                EDUCACIÓN
            </button>
            <button
                type='button'
                className='home-page__button home-page__button--journal'
                onClick={() => navigate('/journal')}
            >
                DIARIO
            </button>
        </main>
    );
};

export default Home;
