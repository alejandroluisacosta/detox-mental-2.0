import { useNavigate } from 'react-router-dom';
import './AlejandroLuis.css';

const AlejandroLuis = () => {
  const navigate = useNavigate();

  return (
    <main className="alejandro-home">
      <h1 className="alejandro-home__title">Alejandro Luis</h1>
      <p className="alejandro-home__intro">
        Escritos sobre la mente, el oficio y la tecnología.
      </p>
      <div className="alejandro-home__hub">
        <button
          type="button"
          className="alejandro-home__button"
          onClick={() => navigate('/alejandroluis/blog')}
        >
          <span className="alejandro-home__label">BLOG</span>
        </button>
      </div>
    </main>
  );
};

export default AlejandroLuis;
