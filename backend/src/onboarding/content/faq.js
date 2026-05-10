/** Last chip: starts the existing challenge flow (time selection → …). */
export const CHALLENGE_CHIP_ID = "challenge";

export const CHALLENGE_CHIP_LABEL = "Ir al desafío";

export const FOLLOW_UP_QUESTION = `¿Qué te gustaría saber ahora?`;

export const CHALLENGE_PROMPT_LABEL =
  "Dime cuando estés preparado/a y haremos un mini-desafío para ver qué tan claros son tus pensamientos ahora mismo. Luego te diré por dónde te recomendamos empezar.";

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
    label: "¿Cómo se utiliza la aplicación?",
    markdownBody: `Esta aplicación consta de **dos partes**: un **artículo** y un **curso de 15 días**.

### El artículo

La idea es que **leas el artículo primero** para ganar contexto. Este presenta una estrategia en **cinco (5) pasos** para trabajar en tus pensamientos de forma sencilla y segura.

El artículo es largo y completo. Puedes leerlo en un día o repartirlo en varios.

**No es obligatorio** antes del curso, pero es lo ideal.

### El curso

El **curso** amplía el artículo: son **15 sesiones de audio** con **15 ejercicios** (uno por sesión).

Lo recomendado es una sesión al día, pero puedes ir a tu ritmo.

Las **tres primeras sesiones** están desbloqueadas; las demás se desbloquean con un código (puedes leer las **instrucciones** de la app para más información sobre cómo desbloquearlas).

Completa los contenidos de la aplicación para mejorar tu relación con ciertos pensamientos y reducir el estrés que te generan.

Si luego de terminar quieres seguir profundizando en los beneficios de trabajar en tu mente, es recomendable acudir a un profesional de salud mental.`
  },
  {
    id: "time_investment",
    label: "¿Cuánto tiempo tengo que invertir?",
    markdownBody:
      `Lo ideal es terminar todo en **16 días**:

- **1 día** para leer el artículo.
- **15 días** para completar el curso.
      
Lo normal es dedicar unos **30 minutos** al día aproximadamente, pero cada quien lo hace a su ritmo.
      
Siéntete libre de dedicar el tiempo que quieras y puedas, especialmente al principio.
      
Nos puedes contactar a **detoxmental4@gmail.com** y te damos recomendaciones de ritmo según tus necesidades.`
  },
  {
    id: "course_duration",
    label: "¿Cuánto dura el curso?",
    markdownBody:
      `Está diseñado para hacerse en **15 días** dedicando **± 30 minutos** al día.
      
Puedes hacerlo al ritmo que prefieras: 15 días es el ideal, pero lo importante es que se ajuste a tu rutina diaria.`
  },
  {
    id: "app_story",
    label: "¿Cuál es la historia de esta aplicación?",
    markdownBody: `Esta aplicación nació en **2021** a raíz de un **artículo** de internet que fue especialmente exitoso.

El creador de esta aplicación es un ex-escritor de desarrollo personal.

En 2021, hizo un experimento para ver cuáles eran sus artículos más leídos: les hizo **publicidad** a todos en **Facebook** e **Instagram** por una semana.

Entre ellos había títulos como *"Cómo liberarte de los miedos que te impiden sacar tu mejor versión"* o *"Cómo hacer las cosas que no te gustan pero que son buenas para tu salud y tu futuro."*

Estos fueron los **resultados** del experimento:

El **tercer** artículo más leído tuvo 5000 lecturas.

El **segundo** tuvo 6000 lecturas.

El **primero** tuvo **30.000**.

El primer artículo tuvo **5 veces más** lecturas que el segundo. De allí en adelante, todos rondaron entre las 3000 y 5000 lecturas.

El título original de este artículo era **"Cómo liberarte de los pensamientos que te atormentan en 5 pasos"**, y su inesperado y aplastante éxito demostró la necesidad de la gente de liberarse del estrés de la mente en el día a día.

A partir de esta necesidad, nació el curso: **Detox Mental en 15 días**.

La intención de Detox Mental es ser una herramienta para sacarnos aunque sea **momentáneamente** de las pantallas y **hacer algo** por los pensamientos que normalmente evitamos.

En lugar de recordar algo desagradable y dejarlo pasar, la idea es escribirlo en papel y **lidiar mentalmente** con ello por unos minutos.

Luego sigues con tu día, pero le dedicas al menos una pequeña, pequeña parte de tu día. Un **mínimo de esfuerzo.**

Resulta que hacer esto es bastante **terapéutico**. Para muchas personas es útil, y se puede hacer en cualquier momento practicamente sin costo.

Para algunas personas es maravilloso. Para otros, normal.

Pero todas las personas que hemos visto utilizar la escritura como herramienta han dicho **al menos algo positivo** acerca de la experiencia.

**"Me ayudó a calmarme un poco"**.

**"Me lo quité de la cabeza al menos por un rato"**.

Estas son las cosas que suelen decirnos aquellos que **no tienen** una transformación espectacular.

Lo importante es que al final del día, se sienten mejor. **Siempre vale la pena** hacerlo, y nadie se arrepiente de haberlo hecho.

Es como ir al **gimnasio**: rara vez vas a salir diciendo "me arrepiento de haber ido". Lo normal es que valga la pena.

**No es** para todo el mundo.

A veces la escritura guiada no encaja: está bien **probar** y ver si te sirve.

Por otro lado, **Detox Mental no sustituye terapia ni atención médica**. Si tienes un diagnóstico o **síntomas intensos** (por ejemplo depresión grave, ansiedad que te paraliza, manías de hacer daño a ti o a otros), lo sensato es hablarlo primero con un **profesional** de salud mental o con tu médico.

Este contenido va pensado para personas que estén **relativamente saludables**, que tienen un estilo de vida decente **pero mejorable**, y que les gusta hacer cosas para mejorar su situación.

Si alguna vez te has sentido inclinado a **leer un libro** para mejorar en algo que te gustaría cambiar, **es posible** que te guste esta aplicación.

Si **ves vídeos** para mejorar en el gimnasio, tu alimentación, tu trabajo, tu relación con tus amigos, tu familia, tu pareja, tu vida... **es posible** que te guste esta aplicación.

Es una herramienta de desarrollo personal para terminarla en un **tiempo corto** y ver el potencial de trabajar en la mente.

Lo ideal, el **"caso perfecto"**, es terminar el curso y apuntarse a terapia con un profesional de la salud mental. Si se logra, ese es un caso de **éxito completo**.

El motivo es que la terapia es la mejor forma de lidiar con esos pensamientos. Es pagarle a alguien para que escuche tus problemas, y eso es **tremendamente efectivo** para liberar el estrés de la mente.

Si Detox Mental puede llevarte a que hagas eso, eso es una **gran victoria**. La aplicación puede haber detonado un **cambio importante** en tu vida.

Por otro lado, puede que no seas un caso de éxito completo, pero sea como sea, lo más seguro es que **saques algo bueno** de escribir tus pensamientos.

Como mínimo, te **separás por un rato** de ellos. Eso ya es un **alivio**.

Con respecto a la aplicación como producto, **muchas cosas han cambiado** desde 2021.

El artículo cambió su nombre original para pasar a ser "Cómo trabajar en tu estrés en 5 pasos — La estategia para limpiar tu mente de forma sencilla y segura".

Dedicimos alejarnos del término "pensamientos que atormentan" por el tono clínico que convella.

El curso se planificó originalmente para 30 días, pero pasamos a promocionarlo en 15 días. Resulta que más rápido es mejor en este caso.

El enfoque ha cambiado de "limpiar la mente" a "trabajar en la mente". "Limpiar la mente" suena a promesa no cumplida, mientras que "trabajar en la mente" es una habilidad que todos podemos adquirir y mejorar.

Y siguen viniendo cambios a medido que recibimos feedback de nuestros usuarios, a quienes apreciamos enormemente.

Dicho esto, te invitamos a probar el curso.

No prometemos que te liberes de todos tus pensamientos, pero sí te ofrecemos, bueno, un Detox Mental: desintoxicarte un poco y calmar esa mente, que no para ni la tuya ni la de nadie!

Si quieres escribirnos para saber cualquier detalle de la aplicación o para sugerir cambios, nos puedes contactar a **detoxmental4@gmail.com**.

Esa es nuestra historia. Esperamos que te guste la aplicación y que te sea útil.
`
  },
  {
    id: "creator",
    label: "¿Quién creó esta aplicación?",
    markdownBody: "[Placeholder] Aquí irá información sobre la persona o el equipo detrás de la aplicación."
  },
  {
    id: "medical_backing",
    label: "¿Esto está respaldado por profesionales de la medicina?",
    markdownBody:
      "[Placeholder] Aquí irá una aclaración honesta sobre evidencia, límites del contenido y cuándo conviene acudir a un profesional de salud mental."
  },
  {
    id: "is_it_free",
    label: "¿Hay que pagar algo?",
    markdownBody:
      "[Placeholder] Aquí irá una aclaración honesta sobre evidencia, límites del contenido y cuándo conviene acudir a un profesional de salud mental."
  },
  {
    id: "course_contraindications",
    label: "Contraindicaciones",
    markdownBody:
      "[Placeholder] Aquí irá una aclaración honesta sobre evidencia, límites del contenido y cuándo conviene acudir a un profesional de salud mental."
  },
];

export function getFaqById(id) {
  return FAQ_ENTRIES.find((e) => e.id === id);
}
