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
    markdownBody: `Detox Mental nació en **2021** a raíz de un **artículo** de internet que fue especialmente exitoso.

El creador de esta aplicación es un ex-escritor de desarrollo personal.

En 2021, hizo un experimento para ver cuáles eran sus artículos más leídos: los publicó todos en **Facebook** e **Instagram** y les hizo publicidad por una semana.

Entre ellos había títulos como *"Cómo liberarte de los miedos que te impiden sacar tu mejor versión”*, *”Cómo hacer las cosas que no te gustan pero que son buenas para tu salud y tu futuro”*, o *”Cómo adquirir un nuevo hábito en tres pasos”*.

Después de una semana, estos fueron los **resultados** del experimento:

El **tercer** artículo más leído tuvo 5000 lecturas.

El **segundo** tuvo 6000 lecturas.

El **primero** tuvo **30.000**.

El primer artículo tuvo **5 veces más** lecturas que el segundo. Una victoria arrasadora e inesperada.

De allí en adelante, todos rondaron entre las 3000 y 5000 lecturas. Resultados más “normales” dentro de lo que se esperaba.

El título original del artículo ganador era **"Cómo liberarte de los pensamientos que te atormentan en 5 pasos"**, y su inesperado y aplastante éxito demostró la necesidad de que hay en la actualidad de liberarse del estrés generado por la mente.

A partir de esta necesidad, nació el curso: **Detox Mental en 15 días**.

Un curso hecho para ayudar a todas las personas que escribieron preguntando cómo podían profundizar en el tema y que ha seguido evolucionando para aquellos que quieren **entender mejor su propia mente** y trabajar en el estrés que se acumula en ella.

 **Muchas cosas han cambiado** desde 2021.

El artículo cambió su nombre original para pasar a ser **"Cómo limpiar tu mente en 5 pasos — La estrategia para reducir tu estrés de forma sencilla y segura"**.

(Decidimos alejarnos del término "pensamientos que atormentan" por el tono clínico que implica).

El curso se planificó originalmente para **30 días**, pero pasamos a comprimirlo a **15 días**.

(Resulta ser que, en este caso, ser **intensivos** da mejores resultados).

Y sigue habiendo cambios a medido que recibimos **feedback** de nuestros usuarios, a quienes apreciamos enormemente

Cada persona que completa las sesiones y nos cuenta su experiencia suma a este proyecto. Cada nueva mejora está diseñada para que esa experiencia sea más **útil y transformadora** para la próxima persona que decida aventurarse. 

Dicho esto, te invitamos a probar el curso.

Aunque no prometemos milagros, sí te ofrecemos algo **positivo**, **bien intencionado**, y pensado como una **herramienta** para que puedas ayudarte a ti mismo/a.

Porque al final, cualquier beneficio que puedas obtener vendrá de **tu voluntad** de mejorar tu situación. De tus ganas de aprender algo nuevo y utilizarlo a tu favor. 

Esa es nuestra historia. Esperamos que te guste la aplicación y que te sea útil.

Si quieres escribirnos para saber cualquier detalle del proyecto o para sugerir cambios, nos puedes contactar a **detoxmental4@gmail.com**.
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
