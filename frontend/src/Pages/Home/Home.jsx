import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './Home.css';

const LANGUAGE_OPTIONS = [
    { locale: 'en', label: 'EN', labelKey: 'nav.english' },
    { locale: 'es', label: 'ES', labelKey: 'nav.spanish' },
];

const ArrowIcon = () => (
    <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
    >
        <path d='M5 12h14' />
        <path d='M13 6l6 6-6 6' />
    </svg>
);

const ModuleCard = ({ id, modifier, image, path, t, navigate }) => (
    <button
        type='button'
        className={`home-page__module home-page__module--${modifier}`}
        aria-labelledby={`home-${id}-title`}
        aria-describedby={`home-${id}-description`}
        onClick={() => navigate(path)}
    >
        <span className='home-page__module-media'>
            <img className='home-page__module-image' src={image} alt='' />
            <span className='home-page__module-tag'>{t(`home.${id}.tag`)}</span>
        </span>
        <span className='home-page__module-body'>
            <span className='home-page__module-row'>
                <span id={`home-${id}-title`} className='home-page__module-title'>
                    {t(`home.${id}.title`)}
                </span>
                <span className='home-page__module-arrow' aria-hidden='true'>
                    <ArrowIcon />
                </span>
            </span>
            <span id={`home-${id}-description`} className='home-page__module-description'>
                {t(`home.${id}.description`)}
            </span>
        </span>
    </button>
);

const Home = () => {
    const navigate = useNavigate();
    const { locale, setLocale, t } = useLocale();

    return (
        <main className='home-page'>
            <header className='home-page__header'>
                <span className='home-page__brand'>DETOX MENTAL</span>
                <div className='home-page__language' role='group' aria-label={t('nav.language')}>
                    {LANGUAGE_OPTIONS.map((option) => (
                        <button
                            key={option.locale}
                            type='button'
                            className={`home-page__language-option${
                                locale === option.locale ? ' home-page__language-option--active' : ''
                            }`}
                            aria-label={t(option.labelKey)}
                            aria-pressed={locale === option.locale}
                            onClick={() => setLocale(option.locale)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </header>
            <h1 className='home-page__title'>
                {t('home.titleLead')} <span className='home-page__title-accent'>{t('home.titleAccent')}</span>
            </h1>
            <nav className='home-page__modules' aria-label={t('home.modulesLabel')}>
                <ModuleCard
                    id='education'
                    modifier='education'
                    image='/images/education-background.webp'
                    path='/theory'
                    t={t}
                    navigate={navigate}
                />
                <ModuleCard
                    id='journal'
                    modifier='journal'
                    image='/images/journaling-background.webp'
                    path='/journal'
                    t={t}
                    navigate={navigate}
                />
            </nav>
        </main>
    );
};

export default Home;
