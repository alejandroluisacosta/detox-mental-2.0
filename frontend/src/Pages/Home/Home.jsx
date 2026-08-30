import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { t } = useLocale();

    return (
        <main className='home-page'>
            <h1 className='home-page__title'>DETOX MENTAL</h1>
            <div className='home-page__hub'>
                <button
                    type='button'
                    className='home-page__button home-page__button--education'
                    onClick={() => navigate('/theory')}
                >
                    <span className='home-page__label'>{t('home.education')}</span>
                </button>
                <button
                    type='button'
                    className='home-page__button home-page__button--journal'
                    onClick={() => navigate('/journal')}
                >
                    <span className='home-page__label'>{t('home.journal')}</span>
                </button>
            </div>
        </main>
    );
};

export default Home;
