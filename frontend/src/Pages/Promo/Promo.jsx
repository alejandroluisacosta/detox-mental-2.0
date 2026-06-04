import { useNavigate } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation';
import './Promo.css';

export default function Promo() {
  const navigate = useNavigate();

  return (
    <div className='promo-page'>
      <Navigation />
      <main className='promo-page__content'>
        <p className='promo-page__eyebrow'>Gift card de 25€</p>
        <h1 className='promo-page__title'>Programa de prueba Detox Mental</h1>
        <p className='promo-page__text'>
          Estamos buscando personas interesadas en completar la nueva version de
          Detox Mental y compartirnos su feedback.
        </p>
        <p className='promo-page__text'>
          Esta pagina sera el espacio para detallar requisitos, pasos y
          condiciones de la promocion. Por ahora es un destino temporal para la
          nueva campana.
        </p>
        <img
          className='promo-page__image'
          src='/images/thales.webp'
          alt='Imagen de apoyo de la promocion Detox Mental'
        />
        <button
          type='button'
          className='promo-page__button'
          onClick={() => navigate('/course')}
        >
          VOLVER AL CURSO
        </button>
      </main>
    </div>
  );
}
