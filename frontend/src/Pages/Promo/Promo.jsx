import { useNavigate } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation';
import { PROMO_FORM_URL } from '../../data/promoFormUrl.js';
import './Promo.css';

function PromoApplyButton({ className = '' }) {
  const handleApply = () => {
    window.open(PROMO_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type='button'
      className={`promo-page__button promo-page__button--primary${className ? ` ${className}` : ''}`}
      onClick={handleApply}
    >
      APLICAR EN GOOGLE FORMS
    </button>
  );
}

export default function Promo() {
  const navigate = useNavigate();

  return (
    <div className='promo-page'>
      <Navigation />
      <main className='promo-page__content'>
        <header className='promo-page__hero'>
          <p className='promo-page__eyebrow'>Programa piloto · Gift card 25€</p>
          <h1 className='promo-page__title'>
            Prueba Detox Mental y comparte tu experiencia
          </h1>
          <p className='promo-page__lead'>
            Buscamos personas que quieran completar el curso de 15 días (audio +
            ejercicio en papel) y darnos feedback honesto. Si encajas, recibirás
            una gift card de Amazon de 25€.
          </p>
          <div className='promo-page__cta-block'>
            <PromoApplyButton />
            <button
              type='button'
              className='promo-page__button promo-page__button--secondary'
              onClick={() => navigate('/course')}
            >
              VOLVER AL CURSO
            </button>
          </div>
        </header>

        <img
          className='promo-page__image'
          src='/images/gift_card.webp'
          alt='Gift card de Amazon de 25 euros'
        />

        <section className='promo-page__section'>
          <h2>Qué implica</h2>
          <p>
            El curso consta de <strong>15 sesiones de audio</strong> y{' '}
            <strong>15 ejercicios escritos en papel</strong> (no en la web).
          </p>
          <p>
            El ritmo es de una sesión por día. Si un día no puedes, al día
            siguiente pasas a la siguiente sesión. Recuperar la sesión omitida es
            opcional.
          </p>
        </section>

        <section className='promo-page__section'>
          <h2>Cómo funciona</h2>
          <ol className='promo-page__list promo-page__list--ordered'>
            <li>
              Rellenas un formulario corto con dos preguntas principales: con qué
              temas se relacionan tus pensamientos estresantes y por qué crees que
              este curso te sería útil.
            </li>
            <li>
              Si encajas, hacemos una entrevista breve (~15 min) para confirmar
              que eres una buena persona para el experimento y acordar las
              fechas de inicio.
            </li>
            <li>
              Completas el curso, envías tu evidencia diaria y, al final, un
              testimonio en audio.
            </li>
          </ol>
        </section>

        <section className='promo-page__section'>
          <h2>Reglas clave</h2>
          <p className='promo-page__rule'>
            <strong>Puedes fallar un día, pero no dos seguidos.</strong>
          </p>
          <p>Ejemplos:</p>
          <ul className='promo-page__list'>
            <li>
              <strong>Permitido:</strong> haces la sesión 1, fallas la 2, haces
              la 3, fallas la 4… y así hasta la 15.
            </li>
            <li>
              <strong>No permitido:</strong> haces la sesión 1, fallas la 2 y
              fallas la 3. En ese momento quedas descalificado.
            </li>
          </ul>
          <p>
            Para recibir la gift card debes completar las 15 sesiones respetando
            esta regla y entregar el testimonio final en audio.
          </p>
          <p className='promo-page__note'>
            Si avanzas varias sesiones y luego te descalificas, tu progreso no
            se pierde del todo: en algunos casos puede haber una recompensa
            menor. Los detalles se concretan
            contigo si encajas en el programa.
          </p>
        </section>

        <section className='promo-page__section'>
          <h2>Qué debes enviar cada día</h2>
          <p>
            Cada día envías una foto de tu ejercicio escrito. Como escribirás
            contenido personal, el texto sensible <strong>no</strong> debe ser
            legible.
          </p>
          <p>
            Solo necesitamos que se lean un par de frases no sensibles para
            confirmar que has escrito un texto coherente relacionado con tus
            pensamientos.
          </p>
          <p>
            Una forma sencilla de difuminar el texto es usar la opción de
            difuminar de WhatsApp al enviar la foto.
          </p>
        </section>

        <section className='promo-page__section'>
          <h2>Testimonio final</h2>
          <p>
            Para reclamar cualquier recompensa debes enviar un testimonio hablado
            al terminar el curso. Puede ser anónimo.
          </p>
          <p>
            Lo mínimo es que se escuche tu voz explicando si el curso te resultó
            útil. Si no te importa compartir tu nombre, mejor. Si puedes grabar
            un vídeo con tu rostro, aún mejor. Pero el nivel de exposición es
            totalmente tuyo.
          </p>
        </section>

        <section className='promo-page__section promo-page__section--misc'>
          <h2>Otras condiciones</h2>
          <p>Puedes abandonar el programa cuando quieras.</p>
          <p>
            Si fallas una vez y quieres intentarlo de nuevo, escríbenos a{' '}
            <strong>detoxmental4@gmail.com</strong>. No necesitas repetir la
            selección, aunque nos reservamos el derecho de aceptarte.
          </p>
          <p>
            <strong>Válido hasta el 01 de julio 2026.</strong>
          </p>
        </section>

        <footer className='promo-page__footer'>
          <PromoApplyButton className='promo-page__button--full' />
          <button
            type='button'
            className='promo-page__back-link'
            onClick={() => navigate('/course')}
          >
            Volver al curso
          </button>
        </footer>
      </main>
    </div>
  );
}
