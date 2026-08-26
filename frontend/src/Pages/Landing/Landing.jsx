import { Link } from 'react-router-dom';
import './Landing.css';

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 10h11M11 6l4 4-4 4" />
  </svg>
);

const AudioIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 10v4M9 7v10M13 4v16M17 7v10M21 10v4" />
  </svg>
);

const JournalIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 11.5a8.2 8.2 0 0 1-9 8.2 9.4 9.4 0 0 1-3.7-.9L3 20l1.4-4.5A8.1 8.1 0 1 1 21 11.5Z" />
  </svg>
);

const Landing = () => {
  return (
    <div className="landing">
      <header className="landing__header">
        <Link className="landing__brand" to="/" aria-label="Detox Mental, inicio">
          Detox Mental
        </Link>
        <nav className="landing__nav" aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#herramientas">Herramientas</a>
          <Link className="landing__login" to="/login">Entrar</Link>
        </nav>
      </header>

      <main>
        <section className="landing__hero">
          <div className="landing__hero-copy">
            <p className="landing__eyebrow">UN GIMNASIO PARA TU MENTE</p>
            <h1>Entiende lo que piensas.<br />Escribe lo que necesitas.</h1>
            <p className="landing__hero-description">
              Un espacio guiado para mirar de frente los pensamientos que te
              desgastan, comprenderlos y empezar a relacionarte con ellos de otra manera.
            </p>
            <div className="landing__hero-actions">
              <Link className="landing__button landing__button--primary" to="/onboarding">
                Empezar mi recorrido
                <ArrowIcon />
              </Link>
              <a className="landing__button landing__button--secondary" href="#como-funciona">
                Descubrir cómo funciona
              </a>
            </div>
            <p className="landing__hero-note">Empieza explorando. Sin contraseña.</p>
          </div>

          <div className="landing__hero-visual" aria-label="Una muestra de la experiencia Detox Mental">
            <div className="landing__orbit landing__orbit--outer" />
            <div className="landing__orbit landing__orbit--inner" />
            <div className="landing__thought landing__thought--one">¿Y si no soy suficiente?</div>
            <div className="landing__thought landing__thought--two">No puedo dejar de pensarlo</div>
            <div className="landing__thought landing__thought--three">Necesito entenderme</div>
            <div className="landing__guide-card">
              <div className="landing__guide-header">
                <img src="/images/thales.webp" alt="" />
                <div>
                  <strong>Tales</strong>
                  <span>Tu guía en Detox Mental</span>
                </div>
              </div>
              <p>
                No tienes que ordenar todo antes de empezar. Cuéntame:
                <strong> ¿qué pensamiento ocupa más espacio hoy?</strong>
              </p>
              <div className="landing__guide-input">
                Escribe tu respuesta
                <span aria-hidden="true">→</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing__intro" id="como-funciona">
          <p className="landing__section-number" aria-hidden="true">01</p>
          <div className="landing__intro-copy">
            <p className="landing__eyebrow">DE LA REACCIÓN A LA REFLEXIÓN</p>
            <h2>No se trata de dejar la mente en blanco.</h2>
            <p>
              Se trata de aprender a observar lo que ocurre dentro de ti sin
              juicio, hacer mejores preguntas y convertir esa claridad en acciones concretas.
            </p>
          </div>
          <ol className="landing__steps">
            <li>
              <span>1</span>
              <div>
                <h3>Observa</h3>
                <p>Pon distancia entre tú y el ruido de tu mente.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Comprende</h3>
                <p>Descubre qué emoción o necesidad hay detrás.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Reformula</h3>
                <p>Escribe una respuesta más consciente y útil.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="landing__tools" id="herramientas">
          <div className="landing__section-heading">
            <div>
              <p className="landing__eyebrow">A TU RITMO, CON ESTRUCTURA</p>
              <h2>Herramientas para conocerte mejor</h2>
            </div>
            <p>
              Alterna aprendizaje, escucha y escritura. Vuelve cuando lo necesites
              y haz del autoconocimiento una práctica, no una tarea pendiente.
            </p>
          </div>

          <div className="landing__feature-grid">
            <article className="landing__feature landing__feature--course">
              <div className="landing__feature-icon"><AudioIcon /></div>
              <p className="landing__feature-kicker">15 SESIONES GUIADAS</p>
              <h3>Un curso para pasar de entender a practicar</h3>
              <p>
                Audios breves y ejercicios de escritura que se desbloquean paso a paso
                para acompañarte durante todo el proceso.
              </p>
              <div className="landing__audio-preview" aria-hidden="true">
                <button type="button" tabIndex="-1">▶</button>
                <div>
                  <span>Sesión 01</span>
                  <div><i /></div>
                </div>
                <span>08:42</span>
              </div>
            </article>

            <article className="landing__feature">
              <div className="landing__feature-icon"><JournalIcon /></div>
              <p className="landing__feature-kicker">DIARIO PERSONAL</p>
              <h3>Escribe sin tener que hacerlo “bien”</h3>
              <p>
                Guarda reflexiones libres, organízalas por temas y convierte una foto
                de tus notas manuscritas en texto cuando prefieras escribir a mano.
              </p>
              <div className="landing__journal-preview" aria-hidden="true">
                <span>Reflexión</span><span>Preocupaciones</span>
                <p>Hoy me he dado cuenta de que...</p>
              </div>
            </article>

            <article className="landing__feature landing__feature--chat">
              <div className="landing__feature-icon"><ChatIcon /></div>
              <p className="landing__feature-kicker">CONVERSACIÓN INICIAL</p>
              <h3>No hace falta que sepas por dónde empezar</h3>
              <p>
                Tales te recibe con una conversación guiada para conocer tu situación,
                responder preguntas y ayudarte a elegir el primer paso.
              </p>
              <div className="landing__chat-preview" aria-hidden="true">
                <img src="/images/thales.webp" alt="" />
                <span>Vamos a empezar por lo que más pesa hoy.</span>
              </div>
            </article>
          </div>
        </section>

        <section className="landing__for-you">
          <div className="landing__for-you-copy">
            <p className="landing__eyebrow">PUEDE SER PARA TI SI...</p>
            <h2>Tu cabeza no para, pero tú quieres dejar de huir de ella.</h2>
          </div>
          <ul>
            <li><span>✓</span> Revives conversaciones y errores una y otra vez.</li>
            <li><span>✓</span> Te cuesta poner nombre a lo que sientes.</li>
            <li><span>✓</span> Quieres escribir, pero la página en blanco te frena.</li>
            <li><span>✓</span> Buscas una práctica personal con dirección y continuidad.</li>
          </ul>
        </section>

        <section className="landing__final-cta">
          <p className="landing__eyebrow">TU PRIMER PASO PUEDE SER PEQUEÑO</p>
          <h2>Empieza con una pregunta.<br />Lo demás se construye escribiendo.</h2>
          <Link className="landing__button landing__button--light" to="/onboarding">
            Conocer a Tales
            <ArrowIcon />
          </Link>
          <p>Detox Mental es una herramienta de reflexión y no sustituye la atención profesional.</p>
        </section>
      </main>

      <footer className="landing__footer">
        <span>Detox Mental™</span>
        <p>Lee. Escucha. Piensa. Escribe.</p>
        <Link to="/login">Ya tengo una cuenta</Link>
      </footer>
    </div>
  );
};

export default Landing;
