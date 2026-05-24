/** Last chip: starts the existing challenge flow (time selection → …). */
export const CHALLENGE_CHIP_ID = "challenge";

export const CHALLENGE_CHIP_LABEL = "Ir al desafío";

export const FOLLOW_UP_QUESTION = `¿Qué te gustaría saber ahora?`;

export const CHALLENGE_PROMPT_LABEL = `Dime cuando estés preparado/a y haremos un mini-desafío para ver qué tan claros son tus pensamientos ahora mismo.

Luego te diré por dónde te recomendamos empezar.`;

/** Short intro on first open (placeholder tone; edit anytime). */
export const FAQ_INTRO = `Bienvenido/a a Detox Mental, tu gimnasio mental virtual.

Yo soy Tales, tu guía al inicio de este proceso.

Te explico dónde estás:

**Detox Mental** es una aplicación para ayudarte a relacionarte mejor con pensamientos que te generan estrés, sin sustituir terapia ni consejo médico.

Aquí tienes respuestas rápidas a lo que suelen preguntarse quienes nos visitan por primera vez.`

/**
 * Ordered FAQ chips (excluding the challenge chip).
 * @type {{ id: string, label: string, markdownBody: string }[]}
 */
export const FAQ_ENTRIES = [
  {
    id: "how_to_use",
    label: "¿Cómo se utiliza esta aplicación?",
    markdownBody: `Detox Mental consta de dos partes: una **teoría** y un **curso** práctico.

### La teoría

La teoría está pensada para darte **contexto** y ayudarte a entender mejor el enfoque de la aplicación antes de empezar.

Aquí te contamos **cómo nació** Detox Mental, nuestra **filosofía** y las **herramientas** que utilizamos para trabajar en el estrés que genera la mente.

### El curso

El **curso** amplía la teoría. Consiste en **15 sesiones de audio** con **15 ejercicios prácticos de escritura**.

La idea es avanzar poco a poco, aplicando lo aprendido directamente a pensamientos y situaciones reales de tu vida cotidiana.

Las primeras sesiones están **desbloqueadas** desde el inicio. El resto se van **desbloqueando** a medida que avanzas.

Puedes hacerlo a tu ritmo, aunque lo habitual es realizar una sesión por día.

Completa los contenidos de la aplicación para mejorar tu relación con ciertos pensamientos y reducir el estrés que te generan.`
  },
  {
    id: "time_to_complete",
    label: "¿Cuánto tiempo lleva completar la aplicación?",
    markdownBody:
      `No hay un tiempo fijo ni una forma correcta de completarla.

Algunas personas prefieren seguir una estructura diaria, mientras que otras avanzan de forma más flexible según su tiempo y energía.

Lo importante no es la velocidad, sino que puedas aplicar lo que vas aprendiendo en tu vida cotidiana de manera útil para ti.`
  },
  {
    id: "app_story",
    label: "¿Cuál es la historia de esta aplicación?",
    markdownBody: `Detox Mental nació en **2021** a raíz de un **artículo** de internet que fue especialmente exitoso.

El creador de esta aplicación es un ex-escritor de desarrollo personal.

En 2021, hizo un experimento para ver cuáles eran sus artículos más leídos: los publicó todos en **Facebook** e **Instagram** y les hizo **publicidad** por una semana.

Entre ellos había títulos como *"Cómo liberarte de los miedos que te impiden sacar tu mejor versión”*, *”Cómo hacer las cosas que no te gustan pero que son buenas para tu salud y tu futuro”*, o *”Cómo adquirir un nuevo hábito en tres pasos”*.

Después de una semana, estos fueron los **resultados** del experimento:

El **tercer** artículo más leído tuvo 5000 lecturas.

El **segundo** tuvo 6000 lecturas.

El **primero** tuvo **30.000**.

El primer artículo tuvo **5 veces más** lecturas que el segundo. Una victoria arrasadora e inesperada.

El título original del artículo ganador era **"Cómo liberarte de los pensamientos que te atormentan en 5 pasos"**, y su éxito demostró la **necesidad** que existe de liberarnos del estrés generado por la mente.

A partir de esta necesidad, nació la idea del curso: **Detox Mental en 15 días**.

Un curso hecho para personas que quieren **entender mejor su propia mente** y trabajar en el estrés que se acumula en ella.

 **Muchas cosas han cambiado** desde el lanzamiento inicial en 2021.

El artículo cambió su nombre original para pasar a ser **"Cómo limpiar tu mente en 5 pasos — La estrategia para reducir tu estrés de forma sencilla y segura"**.

(Decidimos alejarnos del término "pensamientos que atormentan" para adoptar un tono menos dramático).

El curso se planificó originalmente para **30 días**, pero se comprimió a **15 días**.

(Resulta ser que, en este caso, ser más **intensivos** da mejores resultados).

Y sigue habiendo cambios a medido que recibimos **feedback** de quienes lo completan. Cada experiencia ayuda a seguir **refinando el contenido** para la siguiente persona que lo utilice.

Dicho esto, te invitamos a probar el curso.

Si estás aquí, es probable que te interese mejorar tu relación con tu mente, y esta aplicación está diseñada para ayudarte a lograr justo eso de forma **sencilla y segura**.

Esa es nuestra historia. Si quieres escribirnos para saber cualquier detalle del proyecto o sugerir cambios, puedes contactarnos en **detoxmental4@gmail.com**.`
  },
  {
    id: "creator",
    label: "¿Quién hizo Detox Mental?",
    markdownBody: `Alejandro Luis Acosta.

LinkedIn: [alejandroluisacosta](https://www.linkedin.com/in/alejandroluisacosta/)`
  },
  {
    id: "professional_help",
    label: "¿Esto reemplaza la ayuda profesional?",
    markdownBody:
      `No.

Detox Mental **no sustituye** la asistencia médica ni psicológica. La aplicación fue diseñada para personas que se sienten **mentalmente saturadas** por los estímulos y la acumulación de pensamientos del día a día, pero que en general siguen **funcionando con normalidad**.

La principal herramienta que recomendamos es **la escritura**. Existe evidencia científica de que escribir sobre pensamientos y emociones puede ayudar a **reducir estrés mental** y ordenar mejor lo que pasa por nuestra cabeza.

Si alguna vez intentaste mejorar algún aspecto de tu vida leyendo un **libro**, escuchando un **podcast**, viendo **videos** o incorporando **mejores hábitos**, es probable que esta aplicación tenga sentido para ti.

En cambio, si estás atravesando una **crisis psicológica** severa, pensamientos suicidas o una situación que afecta seriamente tu funcionamiento diario, nuestra recomendación es buscar **ayuda profesional** antes de utilizar una herramienta como esta.

Detox Mental está pensado para personas que ya están relativamente bien, pero sienten que **vivir con menos ruido mental** es posible.`
  },
  {
    id: "is_it_free",
    label: "¿Hay que pagar algo?",
    markdownBody:
      `Detox Mental tiene una versión gratuita y una versión de pago.

Puedes empezar gratis y acceder a parte del contenido del curso para ver si encaja contigo.

Si quieres acceder al contenido completo, puedes desbloquearlo con una sola compra.`
  },
  {
    id: "course_contraindications",
    label: "Contraindicaciones",
    markdownBody:
      `Abstente de utilizar esta aplicación si estás atravesando una situación de salud mental **grave o inestable**.

En particular, **no es recomendable** si experimentas de forma frecuente pensamientos suicidas, episodios de ansiedad o pánico intensos, paranoia, compulsiones que afectan tu vida diaria, episodios de desconexión de la realidad, o cualquier otra condición que interfiera de manera significativa con tu funcionamiento cotidiano.

Tampoco es una herramienta adecuada si estás actualmente en tratamiento psicológico o psiquiátrico intensivo, salvo que tu profesional de referencia considere explícitamente que puede ser útil como complemento.

Detox Mental **no está diseñado** para tratar ni sustituir atención clínica de ningún tipo. Es una herramienta de uso personal orientada a la **escritura** y la **organización de pensamientos** en contextos de bienestar general y malestar leve o moderado.

Si tienes dudas sobre si este tipo de herramienta es adecuada para ti, te recomendamos consultar con un **profesional de la salud** antes de utilizarla.`
  },
];

export function getFaqById(id) {
  return FAQ_ENTRIES.find((e) => e.id === id);
}
