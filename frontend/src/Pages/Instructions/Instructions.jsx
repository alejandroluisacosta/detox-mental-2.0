import Navigation from '../../Components/Navigation/Navigation.jsx';
import './Instructions.css';

export default function Instructions() {
  return (
    <div className='instructions-page'>
      <Navigation />
      <main className='instructions-page__content'>
        <h1 className='instructions-page__title'>Detox Mental: limpia tu mente en 15 días.</h1>
        <p className='instructions-page__lead'>
          Esta aplicación consta de dos (2) partes: un <strong>artículo</strong> y un <strong>curso</strong> de 15 días.
        </p>

        <section className='instructions-page__section'>
          <h2>1. Artículo</h2>
          <p>
            Es la pieza principal de información a partir de la cual se creó el curso.
          </p>
          <p>
            Contiene una estrategia de <strong>cinco (5) pasos</strong> para trabajar en tus pensamientos de forma segura y sencilla.
          </p>
          <p>
            Es un artículo largo y completo. Puedes leerlo en un día o repartirlo en varios.
          </p>
          <p>
            La estrategia se basa principalmente <strong>escribir lo que estás pensando</strong> por los beneficios que esto conlleva,
            incluida la disminución del estrés.
          </p>
          <p><strong>Lo ideal es leerlo antes de empezar el curso, pero no es obligatorio.</strong></p>
        </section>

        <section className='instructions-page__section'>
          <h2>2. Curso</h2>
          <p>El curso expande los contenidos del artículo.</p>
          <p>Consta de <strong>15 sesiones de audio</strong> acompañadas de <strong>15 ejercicios</strong>.</p>
          <p>
            Cada sesión viene con su ejercicio. La idea es hacerlo al terminar de escuchar la sesión.
          </p>
          <p>El ritmo recomendado es hacer una sesión y un ejercicio al día para terminar el curso en 15 días. De igual forma, puedes hacerlo al ritmo que prefieras.</p>
          <p>
            Las <strong>tres (3)</strong> primeras sesiones están <strong>desbloqueadas</strong>. De allí en adelante, se tienen que desbloquear.
          </p>
        </section>

        <section className='instructions-page__section'>
          <h3>¿Cómo se desbloquean las sesiones?</h3>
          <p>
            Las sesiones se desbloquean con un <strong>código</strong>. Hay dos formas de conseguirlos:
          </p>
          <ol className='instructions-page__list'>
            <li>
              <strong>Respondiendo una pregunta</strong>
              <p>
                Cada sesión bloqueada tiene un mini-desafío: responder una pregunta relacionada con la mente (o <strong><i>tu</i></strong> mente).
              </p>
              <p>
                Envíanos tus respuestas por correo y te damos el código para la sesión correspondiente.
              </p>
            </li>
            <li>
              <strong>Adivina el personaje</strong>
              <p>
                En el curso hay <strong>siete (7) personajes secretos</strong>. Están en las sesiones 1, 2, 4, 5, 9, 10 y 15.
              </p>
              <p>
                Si adivinas un personaje, envíanoslo por correo y te damos el código de la sesión que elijas.
              </p>
            </li>
          </ol>
          <p className='instructions-page__contact'><strong>
            Nuestro correo es: detoxmental4@gmail.com
          </strong></p>
        </section>

        <section className='instructions-page__closing'>
          <p>
            Completa todas las sesiones que puedas y libérate un poco del estrés de tu mente hiperactiva.
          </p>
          <p>
            Si al terminar todos los contenidos quieres seguir profundizando en los beneficios de comprender tu mente,
            te recomendamos acudir a un profesional de la salud mental al menos una vez al mes.
          </p>
        </section>
      </main>
    </div>
  );
}
