/** Last chip: starts the existing challenge flow (time selection → …). */
export const CHALLENGE_CHIP_ID = "challenge";

export const CHALLENGE_CHIP_LABEL = {
  es: "Ir al desafío",
  en: "Go to the challenge",
};

export const FOLLOW_UP_QUESTION = {
  es: `¿Qué te gustaría saber ahora?`,
  en: `What would you like to know now?`,
};

export const CHALLENGE_PROMPT_LABEL = {
  es: `Dime cuando estés preparado/a y haremos un mini-desafío para ver qué tan claros son tus pensamientos ahora mismo.

Luego te diré por dónde te recomendamos empezar.`,
  en: `Tell me when you are ready and we will do a mini-challenge to see how clear your thoughts are right now.

Then I will tell you where we recommend you start.`,
};

/** Short intro on first open (placeholder tone; edit anytime). */
export const FAQ_INTRO = {
  es: `Bienvenido/a a Detox Mental, tu gimnasio mental virtual.

Yo soy Tales, tu guía al inicio de este proceso.

Te explico dónde estás:

**Detox Mental** es una aplicación para ayudarte a relacionarte mejor con pensamientos que te generan estrés, sin sustituir terapia ni consejo médico.

Aquí tienes respuestas rápidas a lo que suelen preguntarse quienes nos visitan por primera vez.`,
  en: `Welcome to Detox Mental, your virtual mental gym.

I am Tales, your guide at the start of this process.

Let me explain where you are:

**Detox Mental** is an app to help you relate better to thoughts that cause you stress, without replacing therapy or medical advice.

Here are quick answers to what first-time visitors usually ask.`,
};

/**
 * Ordered FAQ chips (excluding the challenge chip).
 * @type {{ id: string, label: { es: string, en: string }, markdownBody: { es: string, en: string } }[]}
 */
export const FAQ_ENTRIES = [
  {
    id: "how_to_use",
    label: {
      es: "¿Cómo se utiliza esta aplicación?",
      en: "How do I use this app?",
    },
    markdownBody: {
      es: `Detox Mental consta de dos partes: una **teoría** y un **curso** práctico.

### La teoría

La teoría está pensada para darte **contexto** y ayudarte a entender mejor el enfoque de la aplicación antes de empezar.

Aquí te contamos **cómo nació** Detox Mental, nuestra **filosofía** y las **herramientas** que utilizamos para trabajar en el estrés que genera la mente.

### El curso

El **curso** amplía la teoría. Consiste en **15 sesiones de audio** con **15 ejercicios prácticos de escritura**.

La idea es avanzar poco a poco, aplicando lo aprendido directamente a pensamientos y situaciones reales de tu vida cotidiana.

Las primeras sesiones están **desbloqueadas** desde el inicio. El resto se van **desbloqueando** a medida que avanzas.

Puedes hacerlo a tu ritmo, aunque lo habitual es realizar una sesión por día.

Completa los contenidos de la aplicación para mejorar tu relación con ciertos pensamientos y reducir el estrés que te generan.`,
      en: `Detox Mental has two parts: a **theory** and a practical **course**.

### The theory

The theory is meant to give you **context** and help you understand the app's approach before you start.

Here we tell you **how Detox Mental was born**, our **philosophy**, and the **tools** we use to work on the stress the mind creates.

### The course

The **course** expands on the theory. It is **15 audio sessions** with **15 practical writing exercises**.

The idea is to move forward little by little, applying what you learn directly to thoughts and real situations in your everyday life.

The first sessions are **unlocked** from the start. The rest **unlock** as you go.

You can do it at your own pace, though the usual rhythm is one session a day.

Complete the contents of the app to improve your relationship with certain thoughts and reduce the stress they cause you.`,
    },
  },
  {
    id: "time_to_complete",
    label: {
      es: "¿Cuánto tiempo lleva completar la aplicación?",
      en: "How long does it take to complete the app?",
    },
    markdownBody: {
      es:
      `No hay un tiempo fijo ni una forma correcta de completarla.

Algunas personas prefieren seguir una estructura diaria, mientras que otras avanzan de forma más flexible según su tiempo y energía.

Lo importante no es la velocidad, sino que puedas aplicar lo que vas aprendiendo en tu vida cotidiana de manera útil para ti.`,
      en:
      `There is no fixed time and no single correct way to complete it.

Some people prefer a daily structure, while others move more flexibly according to their time and energy.

What matters is not speed, but being able to apply what you learn in your everyday life in a way that is useful to you.`,
    },
  },
  {
    id: "app_story",
    label: {
      es: "¿Cuál es la historia de esta aplicación?",
      en: "What is the story of this app?",
    },
    markdownBody: {
      es: `Detox Mental nació en **2021** a raíz de un **artículo** de internet que fue especialmente exitoso.

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

Esa es nuestra historia. Si quieres escribirnos para saber cualquier detalle del proyecto o sugerir cambios, puedes contactarnos en **detoxmental4@gmail.com**.`,
      en: `Detox Mental was born in **2021** from an internet **article** that was especially successful.

The creator of this app is a former personal-development writer.

In 2021, he ran an experiment to see which of his articles were read the most: he published them all on **Facebook** and **Instagram** and ran **ads** on them for a week.

Among them were titles such as *"How to free yourself from the fears that keep you from becoming your best version"*, *"How to do the things you dislike that are good for your health and your future"*, and *"How to acquire a new habit in three steps"*.

After a week, these were the **results** of the experiment:

The **third** most-read article had 5,000 reads.

The **second** had 6,000 reads.

The **first** had **30,000**.

The first article had **5 times more** reads than the second. A sweeping and unexpected win.

The original title of the winning article was **"How to free yourself from the thoughts that torment you in 5 steps"**, and its success showed the **need** that exists to free ourselves from the stress the mind creates.

From that need, the idea of the course was born: **Detox Mental in 15 days**.

A course made for people who want to **understand their own mind better** and work on the stress that builds up in it.

 **Many things have changed** since the initial launch in 2021.

The article changed its original name and became **"How to cleanse your mind in 5 steps — The strategy for reducing your stress in a simple, safe way"**.

(We decided to move away from the term "thoughts that torment you" to adopt a less dramatic tone).

The course was originally planned for **30 days**, but it was compressed to **15 days**.

(It turns out that, in this case, being more **intensive** gives better results).

And there are still changes as we receive **feedback** from people who complete it. Each experience helps keep **refining the content** for the next person who uses it.

That said, we invite you to try the course.

If you are here, you are probably interested in improving your relationship with your mind, and this app is designed to help you do exactly that in a **simple, safe** way.

That is our story. If you want to write to us to learn any detail of the project or suggest changes, you can contact us at **detoxmental4@gmail.com**.`,
    },
  },
  {
    id: "creator",
    label: {
      es: "¿Quién hizo Detox Mental?",
      en: "Who made Detox Mental?",
    },
    markdownBody: {
      es: `Alejandro Luis Acosta.

LinkedIn: [alejandroluisacosta](https://www.linkedin.com/in/alejandroluisacosta/)`,
      en: `Alejandro Luis Acosta.

LinkedIn: [alejandroluisacosta](https://www.linkedin.com/in/alejandroluisacosta/)`,
    },
  },
  {
    id: "professional_help",
    label: {
      es: "¿Esto reemplaza la ayuda profesional?",
      en: "Does this replace professional help?",
    },
    markdownBody: {
      es:
      `No.

Detox Mental **no sustituye** la asistencia médica ni psicológica. La aplicación fue diseñada para personas que se sienten **mentalmente saturadas** por los estímulos y la acumulación de pensamientos del día a día, pero que en general siguen **funcionando con normalidad**.

La principal herramienta que recomendamos es **la escritura**. Existe evidencia científica de que escribir sobre pensamientos y emociones puede ayudar a **reducir estrés mental** y ordenar mejor lo que pasa por nuestra cabeza.

Si alguna vez intentaste mejorar algún aspecto de tu vida leyendo un **libro**, escuchando un **podcast**, viendo **videos** o incorporando **mejores hábitos**, es probable que esta aplicación tenga sentido para ti.

En cambio, si estás atravesando una **crisis psicológica** severa, pensamientos suicidas o una situación que afecta seriamente tu funcionamiento diario, nuestra recomendación es buscar **ayuda profesional** antes de utilizar una herramienta como esta.

Detox Mental está pensado para personas que ya están relativamente bien, pero sienten que **vivir con menos ruido mental** es posible.`,
      en:
      `No.

Detox Mental **does not replace** medical or psychological care. The app was designed for people who feel **mentally saturated** by the stimuli and the buildup of thoughts in day-to-day life, but who in general still **function normally**.

The main tool we recommend is **writing**. There is scientific evidence that writing about thoughts and emotions can help **reduce mental stress** and better organize what goes through our heads.

If you have ever tried to improve some aspect of your life by reading a **book**, listening to a **podcast**, watching **videos**, or building **better habits**, this app will probably make sense for you.

On the other hand, if you are going through a severe **psychological crisis**, suicidal thoughts, or a situation that seriously affects your daily functioning, our recommendation is to seek **professional help** before using a tool like this.

Detox Mental is meant for people who are already relatively well, but who feel that **living with less mental noise** is possible.`,
    },
  },
  {
    id: "is_it_free",
    label: {
      es: "¿Hay que pagar algo?",
      en: "Is there anything to pay?",
    },
    markdownBody: {
      es:
      `Detox Mental tiene una versión gratuita y una versión de pago.

Puedes empezar gratis y acceder a parte del contenido del curso para ver si encaja contigo.

Si quieres acceder al contenido completo, puedes desbloquearlo con una sola compra.`,
      en:
      `Detox Mental has a free version and a paid version.

You can start for free and access part of the course content to see if it fits you.

If you want access to the full content, you can unlock it with a single purchase.`,
    },
  },
  {
    id: "course_contraindications",
    label: {
      es: "Contraindicaciones",
      en: "Contraindications",
    },
    markdownBody: {
      es:
      `Abstente de utilizar esta aplicación si estás atravesando una situación de salud mental **grave o inestable**.

En particular, **no es recomendable** si experimentas de forma frecuente pensamientos suicidas, episodios de ansiedad o pánico intensos, paranoia, compulsiones que afectan tu vida diaria, episodios de desconexión de la realidad, o cualquier otra condición que interfiera de manera significativa con tu funcionamiento cotidiano.

Tampoco es una herramienta adecuada si estás actualmente en tratamiento psicológico o psiquiátrico intensivo, salvo que tu profesional de referencia considere explícitamente que puede ser útil como complemento.

Detox Mental **no está diseñado** para tratar ni sustituir atención clínica de ningún tipo. Es una herramienta de uso personal orientada a la **escritura** y la **organización de pensamientos** en contextos de bienestar general y malestar leve o moderado.

Si tienes dudas sobre si este tipo de herramienta es adecuada para ti, te recomendamos consultar con un **profesional de la salud** antes de utilizarla.`,
      en:
      `Do not use this app if you are going through a **serious or unstable** mental-health situation.

In particular, it is **not recommended** if you frequently experience suicidal thoughts, intense anxiety or panic episodes, paranoia, compulsions that affect your daily life, episodes of disconnection from reality, or any other condition that significantly interferes with your everyday functioning.

It is also not a suitable tool if you are currently in intensive psychological or psychiatric treatment, unless the clinician overseeing your care explicitly considers that it may be useful as a complement.

Detox Mental is **not designed** to treat or replace clinical care of any kind. It is a personal-use tool oriented toward **writing** and the **organization of thoughts** in contexts of general well-being and mild or moderate distress.

If you have doubts about whether this kind of tool is right for you, we recommend consulting a **health professional** before using it.`,
    },
  },
];

export function getFaqById(id) {
  return FAQ_ENTRIES.find((e) => e.id === id);
}
