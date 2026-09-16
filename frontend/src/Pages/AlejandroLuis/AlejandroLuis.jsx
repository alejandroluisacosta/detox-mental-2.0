import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './AlejandroLuis.css';

const AlejandroLuis = () => {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <main className="alejandro-home">
      <h1 className="alejandro-home__title">Alejandro Luis</h1>
      <p className="alejandro-home__intro">{t('blog.intro')}</p>
      <div className="alejandro-home__hub">
        <button
          type="button"
          className="alejandro-home__button"
          onClick={() => navigate('/alejandroluis/blog')}
        >
          <span className="alejandro-home__label">{t('blog.landingButton')}</span>
        </button>
      </div>
    </main>
  );
};

export default AlejandroLuis;
