import React from 'react';
import './Article.css'

const Article = () => {
    return (
    <div className="article-root">
      <header className="sticky-header">
        <h1>Cómo liberarte de los pensamientos que te atormentan en 5 pasos</h1>
      </header>
      <main className="article-content">
        {/* Introduction */}
        <section className="intro-section">
          <p>A principios del 2020 se libraba en mi interior una lucha que tenía meses de antigüedad. Mi cerebro, el campo de batalla, había sido infectado por un tóxico pensamiento, una idea que en poco tiempo se convirtió en una trampa que no mata pero tampoco afloja:</p>
          <blockquote>“¿Cómo se sentirá tener una muerte dolorosa?”</blockquote>
          <p>Nota: este artículo contiene hechos, afirmaciones y opiniones que podrían impactar a ciertos lectores. Si te consideras una persona sensible, te recomiendo abstenerte de leerlo.</p>
          <p>Luego de superar un incidente particularmente desagradable, decidí utilizar mi historia para compartir la estrategia de cinco pasos que me sacó de apuros cuando las cosas empezaron a ponerse feas.</p>
          <p>Tras conocer estos cinco pasos encontrarás recomendaciones creativas y algunas herramientas de alejandroluis.com que te ayudarán a iniciarte en el proceso de limpieza mental.</p>
        </section>
        {/* 5 Steps Overview */}
        <section className="steps-overview">
          <h2>Los cinco pasos de la estrategia son:</h2>
          <ol className="steps-list">
            <li><span className="step-number">1</span> Toma distancia</li>
            <li><span className="step-number">2</span> Reconoce</li>
            <li><span className="step-number">3</span> Comprende</li>
            <li><span className="step-number">4</span> Ármate</li>
            <li><span className="step-number">5</span> Mata</li>
          </ol>
        </section>
        {/* Story and context */}
        <section>
          <h2>El inicio</h2>
          <p>A mediados del 2019, mi hermano me mostró un video que me perturbó profundamente aunque no era su intención. Este video trataba de un juego/simulación donde el protagonista es una persona ahogándose y el objetivo es nadar lo más que puedas antes de una inevitable muerte.</p>
          <p>Aparentemente este juego fue diseñado para concientizar a los usuarios de botes acerca del uso de salvavidas, y luego de verlo, puedo asegurar que fui concientizado efectivamente.</p>
          <p>La experiencia es muy real. Aquí te dejo el video para que puedas comprobarlo por ti misme[1]:</p>
          <p><em>Este es el video. Ver a partir del 1:30.</em></p>
          <p>Esta simulación, que incluye alucinaciones y al protagonista rompiéndose una uña para mantenerse alerta, fue demasiado para mí.</p>
          <p>Me sacudió. Por un momento me convertí en esa persona ahogándose y sentí la desesperación que sentía. Esas imágenes se repitieron en mi mente por más tiempo del que deberían y esa noche experimenté unos extraños escalofríos que recorrían mi cuerpo de arriba abajo.</p>
          <p>Fue tal y como suena: ese video me traumatizó.</p>
          <p>Mi hermano, por otro lado, estaba completamente relajado.</p>
          <p>¿Y por qué no debía de estarlo? Era un video y ya. El chico que lo subió a YouTube, quien está jugando mientras graba, tampoco parecía tan conmocionado como yo.</p>
          <p>Lo mismo en otro video donde se muestra la reacción de varios salvavidas ante la simulación: todos estaban impactados, pero ninguno dijo “por un momento me convertí en esa persona ahogándose y sentí la desesperación que sentía. Estoy traumatizado”.</p>
          <p>No. Todos normales.</p>
          <p>¿Por qué a mí me afectó tanto?</p>
        </section>
        <section>
          <h2>Trauma emocional</h2>
          <p>Pasaron unos meses y el video estaba olvidado. De hecho, volví a verlo un par de veces para desmitificarlo y nunca volví a sentir lo que sentí aquel día con mi hermano.</p>
          <p>A pesar de eso, algo seguía mal en mi cerebro. Había una especie de corto circuito y yo lo sabía.</p>
          <p>Lo que me había impactado no era la muerte del protagonista del juego sino la desesperación que este había experimentado justo antes de morir. Fue una experiencia ficticia pero poderosa que me marcó a nivel emocional.</p>
          <p>Ya había superado el evento que inició todo, pero aún sentía los escalofríos de aquella noche mientras me imaginaba en otro tipo de situaciones igual de desesperantes:</p>
          <blockquote>«¿Cómo se sentirán los segundos previos a un accidente de tránsito mortal? Ese momento en el que caes en cuenta de que lo que sea que vas a golpear es inevitable. ¿Qué te pasará por la mente cuando sabes que vas a morir?»<br/>«¿Y el golpe? ¿Cómo se sentirá un golpe tan fuerte que es capaz de matarte? ¿Y si la muerte no es inmediata? ¿Si quedas sufriendo por unos minutos antes de dejar esta vida? ¿Cómo se siente una persona un instante antes de provocar un choque que le costará la vida a toda su…?»</blockquote>
          <p>(En este punto podría seguir ahondando en los oscuros pensamientos que solía tener, pero para no herir la sensibilidad del lector sin necesidad, cortaré aquí esta dinámica).</p>
          <p>Y no eran solo pensamientos relacionados con accidentes de tránsito. También pensaba en incendios, la pérdida de un brazo o pierna, aplastamientos, muerte de familiares por mi culpa… Tú nómbralo y seguramente ya pensé en ello.</p>
          <p>Fue una época loca y sé que esto parece una historia de terror, pero quizás te reconforte saber que estos pensamientos no me afectaron en lo más mínimo.</p>
          <p>Lo viví muy tranquilo y fue todo gracias a algo que aprendí hace años en un libro: Una Nueva Tierra de Eckhart Tolle. Pasemos a la estrategia para explicarte lo que hice.</p>
          <p><em>(*Nota de edición [1 año y 2 meses después]: releyendo esto, me doy cuenta de que es injusto decir que solo leer el libro me permitió sobrellevar la situación. Leer Una Nueva Tierra fue el paso más importante de todo este proceso porque fue lo que me abrió las puertas del mundo de la mente, lo que despertó mi curiosidad por ella, pero luego de eso me convertí en un friki de la psicología, la consciencia y la espiritualidad (lo sigo siendo) y en los últimos años he invertido cientos de horas leyendo y escuchando acerca de estos temas. Lo más importante de todo lo aprendido está resumido en el artículo que estás por leer).</em></p>
        </section>
        {/* Step 1 */}
        <section className="step-section">
          <h3><span className="step-number">1</span> Toma distancia: tú NO eres tu mente</h3>
          <p>Tolle es más conocido por su bestseller El Poder del Ahora, un libro famoso en todos los rincones de la tierra gracias a su forma de explicar principios espirituales sin amarrarse a las creencias de ninguna religión específica.</p>
          <p>La tesis de Tolle resumida (quizás demasiado resumida) es que las personas vivimos en un constante estado de estrés generado por nuestros propios pensamientos, y si estás leyendo esto en el 2022, debes saber exactamente a qué se refiere: esa imparable voz que está en tu cabeza reviviendo discusiones del pasado e ideando la respuesta perfecta que debiste haber dicho, imaginando escenarios emocionantes para tu futuro, juzgando todas tus acciones y decidiendo si estuvieron bien o mal, recordando antiguos errores, enumerando los defectos de tu pareja… Tú sabes, esa voz.</p>
          <p>Reconocerla es importante, comprenderla es crucial.</p>
          <p>El truco está en entender que la mayor parte del diálogo que constantemente se libra en nuestro cerebro es involuntario. Tú puedes estar cepillándote los dientes antes de dormir y en tu mente puede estar ocurriendo un extenso juicio donde se acusa a tus padres por maltratarte cuando eras niño. Todo en contra de tu voluntad y sin mucho que puedas hacer para detenerlo.</p>
          <p>Es posible que intentes pensar en algo menos complejo y no lo consigas aunque lo intentes con todas tus fuerzas. Cambiar estos diálogos internos suele ser bastante complicado.</p>
          <p>Esta es la primera verdad que debes conocer acerca de los pensamientos: tú no controlas tu mente tanto como crees.</p>
          <p>En realidad, son nuestras emociones las que controlan la gran mayoría de nuestros pensamientos, y aunque estas pueden ser comprendidas y canalizadas de modo que no destruyan nuestra salud mental, la mayoría somos analfabetas emocionales y no sabemos cómo hacerlo.</p>
          <p>En las escuelas no se enseña cómo lidiar con la furia o la frustración. Nuestros padres, que se educaron en el mismo sistema educativo, suelen ser igual de ignorantes que nosotros con respecto al mundo emocional. En las redes sociales se ha puesto muy de moda la psicología (cosa que aplaudo y apoyo enormemente) y cada día tenemos más herramientas para conocernos a nosotros mismos, pero lastimosamente, todavía no es suficiente como para decir que los humanos manejamos correctamente nuestras emociones.</p>
          <p>Es por eso que cuando tenemos algún incidente que nos hace molestar terminamos pasando horas pensando no solo en eso, sino en todas las situaciones parecidas que nos hacen sentir igual de molestos.</p>
          <p>Lo que empieza como una discusión con una amiga se convierte un espiral de pensamientos que te lleva a las injusticias que has sufrido últimamente, el problema de convivencia que te enferma de solo pensar en él o el maleducado teleoperador que te arruinó la tarde intentando venderte un engañoso plan de telefonía.</p>
          <p>Así empieza el círculo vicioso: el primer pensamiento desata una emoción y dicha emoción atrae otros pensamientos que la mantienen viva.</p>
          <p>A todas estas, nosotros ni siquiera nos hemos dado cuenta de todo el desastre que desató esa discusión inicial con nuestra amiga. No sabemos detectar la emoción y mucho menos apaciguarla, lo que provoca que pasemos una tarde o incluso varios días envueltos en el mismo agujero de pensamientos que nos hacen enojar.</p>
          <p>Esto es tan común como problemático.</p>
          <p>La mayor demostración de que no controlamos nuestra mente es la meditación.</p>
          <p>Incluso los más expertos meditadores tienen problemas para mantener su mente en blanco a pesar de todo el tiempo que dedican a conseguir este «simple» objetivo.</p>
          <p>¿Cuánto tiempo puedes pasar sin pensar en nada en absoluto?</p>
          <p>Haz el intento y te darás cuenta de lo difícil que es.</p>
          <p>Los pensamientos son casi inevitables. Llegan directamente a nuestra mente y nosotros únicamente elegimos con cuáles nos quedamos y con cuáles no (de lo que hablaré más adelante en este post).</p>
          <p>La persona promedio que utiliza su teléfono celular diariamente y no practica ningún tipo de meditación tendrá suerte si puede pasar tres segundos sin pensar. Tres segundos: esa es la clase de poder que tenemos sobre el flujo de nuestras ideas.</p>
          <p>El lado bueno es que cada uno de nosotros tiene el poder de liberarse de ese estado pensamiento compulsivo si estamos dispuestos a poner la mente en blanco y centrarnos en el «aquí y ahora», un ejercicio sencillo pero que requiere constancia para ser dominado. La mayoría estamos tan acostumbrados a tener nuestra mente ocupada que unos pocos minutos sin distracciones se convierten en una tortura.</p>
          <p>Cuando lo intentamos, lo más común es sentir una ligera pero constante desesperación que no sabemos de dónde viene. Una vez hayas reconocido que tú no eres tu mente y que tus pensamientos son en su mayoría aleatorios, empezarás a observar más a menudo esta extraña y desagradable sensación.</p>
          <p>Es allí cuando debes continuar al segundo paso de la estrategia.</p>
        </section>
        {/* Step 2 */}
        <section className="step-section">
          <h3><span className="step-number">2</span> Reconoce: tus pensamientos no pueden dañarte… Si no se lo permites</h3>
          <p>Descubrir lo aleatorios que son los pensamientos puede ser muy beneficioso si sabes qué hacer con esa información.</p>
          <p>Cuando descubres que sin importar lo que hagas habrá momentos en los que tendrás que lidiar con PQAs (Pensamientos Que Atormentan), estos dejan de parecer tan peligrosos. Poco a poco empiezan a generarte curiosidad y en casi un 100% de los casos conducen a grandes revelaciones.</p>
          <p>Los PQAs solo pueden dañarte si tú les permites estar en tu mente más tiempo del que deberían o si los evitas en lugar de enfrentarlos. Del resto, son inofensivos. Así se resume la lección que me salvó de lo que pudo ser un terrible episodio de ansiedad, depresión o ambas cosas a la vez.</p>
          <p>En mi caso, cuando los horribles pensamientos empezaron a llegar, ya estaba preparado gracias a la lectura de libros relacionados y una práctica de quietud (meditación) bien establecida. Desde el primer momento supe que estas locas ideas que me preocupaban eran obra de mi exagerada imaginación y que no debía darme mala vida por ellas.</p>
          <p>Una de las cosas que he aprendido leyendo a escritores como Tolle y oyendo a expertos de la espiritualidad como Jay Shetty es que no nos conviene tomar demasiado en serio nuestros propios pensamientos.</p>
          <p>Es normal tener ideas que nos avergüencen o que nos parezcan horribles.</p>
          <p>Esto es lo que pasa cuando el cajero de Mcdonald’s te da el helado equivocado y automáticamente piensas «ojalá se muera».</p>
          <p>Cuando entras en razón te das cuenta de que eso fue exagerado. No quieres que el cajero muera realmente, pero ahora te juzgas a ti mismo/a por haber pensado así.</p>
          <p>Un mal pensamiento no te hace una mala persona. Todos pensamos cosas locas, y siempre y cuando no actuemos en consecuencia, no habrá problema. Seguirán siendo ideas que pasaron por nuestra cabeza y luego se desvanecieron en el olvido.</p>
          <p>Aunque en mi caso fueron los escenarios de muertes dolorosas, los PQAs tiene todos los colores y texturas que puedas imaginar. Algunos ejemplos son:</p>
          <ul>
            <li>Cometer un error y machacarte constantemente con que no eres suficiente.</li>
            <li>Tener “pensamientos oscuros” que normalmente involucran eventos negativos e irremediables (mi caso).</li>
            <li>Imaginar escenarios donde alguien que te hizo daño recibe un castigo desmedido.</li>
            <li>Tener pensamientos racistas a pesar de odiar el racismo.</li>
            <li>Exagerar alguno de tus defectos para victimizarte.</li>
            <li>Pensamientos suicidas.</li>
          </ul>
          <p>La lista sigue y sigue, pero en todos los casos, quien logra reconocer que estos pensamientos no lo definen, consigue verlos por lo que son: ideas que van y vienen a nuestro cerebro de forma infinita y que necesitan de nuestra atención para sobrevivir.</p>
          <p>Lo que nos lleva al tercer paso.</p>
        </section>
        {/* Step 3 */}
        <section className="step-section">
          <h3><span className="step-number">3</span> Comprende: ¿Cómo se mata un pensamiento?</h3>
          <p>¿Por qué existen los pensamientos tormentosos? ¿Qué utilidad tienen? Conocer la respuesta a la pregunta marcada en negritas podría ser todo lo que necesitas para resolver todos y cada uno de tus problemas personales—no solo los relacionados con los PQAs.</p>
          <p>Las teorías basadas en la evolución suelen dar respuestas convincentes a este tipo de preguntas importantes, y en el caso de los pensamientos tormentosos, dichas teorías son tan útiles que se ganaron una sección en este artículo. Si crees en la evolución (o si eres alguien religioso pero escuchas otras creencias con mente abierta), lo que leerás a continuación será clave si de verdad quieres retomar el control de tu mente.</p>
          <p><strong>¿Cuál es la utilidad de los PQAs?</strong></p>
          <p>Desde el punto de vista evolutivo, los PQAs representan innumerables ventajas para nuestra especie.</p>
          <p>Los humanos estamos en la cima de la cadena alimenticia no gracias a nuestra fuerza física, sino a nuestra inteligencia y capacidad de preocuparnos por cosas que aún no han sucedido. Ser los animales más neuróticos del planeta trajo como resultado una especie que puede planificar su alimentación teniendo en cuenta épocas de sequía y lluvia, que puede evitar ser cazada por otros animales más poderosos y que también puede abandonar un sitio particular si las reservas de agua parecen agotarse. Un perro, un elefante o una señora hipopótamo pueden desarrollar cierta planificación, pero nunca en el nivel de complejidad que el cerebro humano es capaz de manejar.</p>
          <p>Por otro lado, este nivel de conciencia acerca de todos los posibles escenarios tiene un precio: si no es controlado, es fácil terminar dentro de un interminable bucle de preocupaciones que nos permite sobrevivir pero, al mismo, tiempo nos hace miserables.</p>
          <p>En un mundo moderno donde la sobrevivencia está prácticamente garantizada (el alimento abunda, el agua también, el riesgo de ser cazado por otros animales es mínimo, tenemos refugio todo el año, las guerras son cada vez menos comunes…), este poder de evitar catástrofes ha mutado a una constante búsqueda por mejorar nuestra situación sin importar qué tan buena sea.</p>
          <p>Lo peor del caso es que esta búsqueda de progreso parece ser infinita[2]. Las personas no sabemos cómo frenar nuestras ansias de más y aquellos que quieren detenerlas requieren años de práctica para conseguir resultados medianamente satisfactorios.</p>
          <p>En resumen: la gran mayoría de las personas que vivimos en la actualidad no tenemos ningún control sobre la máquina de sobrevivencia que tenemos dentro de nuestro cráneo, así que la única forma de enfrentar este problema de pensamientos compulsivos es comprendiéndolo: si los PQAs están para ayudarnos a sobrevivir y a mejorar nuestra situación, debemos utilizarlos a nuestro favor en lugar de intentar ignorarlos y esperar a que se vayan por sí solos, lo que rara vez ocurrirá.</p>
          <p>Para conseguirlo, deberás hacer dos cosas:</p>
          <ol>
            <li>Aprender a diferenciar los PQAs valiosos de los que solo están motivados por el ego. (Por ejemplo: vivir atormentado porque no puedes ir a la discoteca todos los fines de semana como hacen tus amigos de padres millonarios. Esto es un PQA sin valor real a menos que tu objetivo de vida sea mantener las apariencias, y si ese es tu caso, este artículo no te ayudará demasiado).</li>
            <li>Determinar qué información te quieren dar los PQAs valiosos, los que están motivados por situaciones que amenazan tu seguridad, felicidad y desarrollo personal.</li>
          </ol>
          <p>El primer paso, aprender a diferenciar los PQAs valiosos de los motivados por el ego, será cubierto en un próximo artículo.</p>
          <p><em>(Nota de edición [1 año y 2 meses después]: ese artículo para aprender a diferenciar los PQAs valiosos de los motivados por el ego nunca ha sido escrito porque no he notado curiosidad por parte de los lectores. Si quieres que lo escriba, mándame un correo a soyalejandroluis1@gmail.com diciéndome que te interesa. Si hay suficientes peticiones, me pongo manos a la obra).</em></p>
          <p>El segundo, relacionado con entender el mensaje de los PQAs valiosos, será discutido ahora mismo con un ejemplo:</p>
          <p>Si tienes meses atormentado por problemas de convivencia[3], una situación que azota tu paz y tranquilidad día tras día, debes hacer lo posible por observar el diálogo dentro de tu cabeza y hacer preguntas constructivas que ayuden a solucionar el problema.</p>
          <p>Mira este diálogo interno intervenido por el poder de las preguntas constructivas:</p>
          <blockquote>
            Tú, molesto: «¡Mi compañero de cuarto es lo peor! Mira lo que hizo esta vez: el baño lleno de pelo después de afeitarse. ¡Este tipo es asqueroso!»<br/>
            Pregunta constructiva: ¿Y por qué vives con esa persona si te parece tan asquerosa?<br/>
            Tú, aún molesto: «¡Porque lo necesito! Es la única forma de ahorrar dinero mientras sigo en ese trabajo mal pagado en el que estoy. Apenas consiga otro empleo me voy de esta casa.<br/>
            Pregunta constructiva: ¿Y cuánto tiempo tienes sin hacer nada productivo por conseguir ese nuevo empleo?<br/>
            Tú, aún molesto pero un poco más calmado porque te estás diciendo a ti mismo tus verdades en la cara: «Llevo un mes sin buscar nada, pero eso no quiere decir que lo he abandonado».<br/>
            Pregunta constructiva: Entonces, ¿Vale la pena quejarte por algo que es también tu culpa? Si no has hecho todo lo que podrías por tu nuevo empleo, ¿No podrías al menos buscar formas creativas de hablar con tu compañero de cuarto para convencerlo de que sea más organizado mientras tú sigas viviendo con él? Si solo estás con él porque así ahorras dinero, ¿Por qué no te buscas otro compañero con el que compartir gastos que sea más aseado?
          </blockquote>
          <p>Si sigues con este proceso por suficiente tiempo (días o semanas), terminarás por darte cuenta de que tu problema no está tanto en tu compañero de cuarto como en ti, que no has hecho lo suficiente por cambiar de empleo. Tu molestia es más contigo que con él, solo que no lo sabes.</p>
          <p>Si a partir de ese momento empiezas a hacer todo lo posible por fortalecer tus puntos débiles y actuar, el problema con tu sucio compañero pasará a un segundo plano y podrás enfocar tu energía en lo que deberías estar haciendo en lugar de quejarte.</p>
          <p>Lo mismo pasa si te atormentan los pensamientos relacionados con dinero, con tu pareja, con la situación de tu país, con el COVID o con tu equipo de fútbol: si te encargas de hacer tu parte, el tormento disminuye.</p>
          <p>Todas las situaciones que nos atormentan tienen solución, y si no somos lo suficientemente creativos como para encontrarla, nos veremos condenados a una vida llena de PQAs.</p>
          <p>Dicho esto,</p>
          <h4>¿Cómo se mata un PQA?</h4>
          <p>Una vez descubras tu plan de acción y empieces a trabajar en él, el problema empezará a hacerse cada vez más pequeño y soportable. Es allí donde debes matar a tu PQA de la misma manera en que se mata a cualquier pensamiento: de hambre.</p>
          <p>Los pensamientos viven de la atención. Si no le das ninguna atención a alguno en particular, este desaparece en el infinito flujo de ideas que se mueren por pasar tiempo en tu mente.</p>
          <p>Esta regla aplica tanto para pensamientos negativos como positivos: los grandes tormentos mueren de la misma manera que las grandes ideas si no se les alimenta con nuestra valiosa y limitada atención.</p>
          <p>Si ya comprendes el problema y conoces la táctica para matar a tus PQAs, es hora de dar el próximo paso: armarte con una herramienta que te permita controlar tu atención y así negársela a los pensamientos que quieres eliminar.</p>
        </section>
        {/* Step 4 */}
        <section className="step-section">
          <h3><span className="step-number">4</span> Ármate: la quietud como método para regular tu atención</h3>
          <p>Uno de los peores consejos del mundo es el típico «no pienses en eso y ya».</p>
          <p>Para todos es sencillo decirle a alguien más que piense en otra cosa cuando no somos nosotros quienes estamos pasando por su situación. Esto suele dar pésimos resultados.</p>
          <p>Mucho más efectivo sería intentar cambiar tu estado emocional para que poco a poco empieces a atraer otros pensamientos a tu mente, pero lastimosamente, poca gente conoce este truco psicológico—que además no es nada fácil de aplicar.</p>
          <p>Así que en lugar de decirte que cada vez que tengas un PQA hagas tu mejor esfuerzo por pensar en otra cosa, te hablaré de una práctica sencilla que con el tiempo te ayudará a regular tus emociones y ser más consciente de donde pones tu atención.</p>
          <p>Esta práctica es la quietud, y antes de complicarnos con alguna extraña explicación, resumiré en menos de una línea el procedimiento completo: siéntate a no hacer nada y listo.</p>
          <p>Sin teléfono, sin libros, sin televisión, sin hablar con alguien más. Eres tú con tus propios pensamientos por unos minutos y ya.</p>
          <p>Este procedimiento, que es literalmente el más sencillo del mundo, no es tan fácil de llevar a cabo.</p>
          <p>De hecho, ha sido estudiado por miles de años y ha recibido muchos nombres, de los cuales el más famoso es «meditación».</p>
          <p>Así como en la sección anterior hice una aclaratoria para las personas religiosas, en esta hago una aclaratoria para los ateos/agnósticos: no hace falta que creas en ningún Dios ni agente místico para practicar tu quietud. Ni siquiera hace falta que le digas meditación, solo necesitas practicarla por suficiente tiempo y observar tus resultados como haría un buen científico.</p>
          <p>La quietud es la práctica por excelencia para aprender a focalizar nuestra atención. Su efectividad se basa en dos ventajas:</p>
          <ul>
            <li>Al estar completamente quietos y sin distracciones, somos capaces de observar nuestros pensamientos sin hacer nada con respecto a ellos, lo que nos permite reconocer qué tanto pensamos en algo y qué tan útil es hacerlo.</li>
            <li>La practica continuada nos enseña a robarle la atención a los pensamientos repetitivos o inútiles, lo que, como ya sabemos, es vital a la hora de matar PQAs.</li>
          </ul>
          <p>Es importante recalcar que solo podrás quitarle la atención a aquellos pensamientos que ya hayas observado y reconocido su mensaje. Si entiendes lo que quieren decirte, podrás apaciguarlos. Si no, te verás condenado a revivirlos una y otra vez.</p>
          <h4>Las complicaciones de la quietud</h4>
          <p>Siendo una práctica tan sencilla es común caer en la idea de que es fácil incorporarla a nuestra vida. El exceso de confianza es el peor peligro de este ejercicio.</p>
          <p>Aunque todos somos capaces de estar quietos, estamos tan, pero tan acostumbrados a estar haciendo algo que la tranquilidad se ha convertido en un estado anti natural para el ser humano moderno.</p>
          <p>Por este motivo el hábito de practicar la quietud suele morir antes de nacer: muchos dicen que lo harán y nunca lo hacen y otros se inician en una primera sesión (dos como máximo) y luego lo abandonan con la excusa de que «mañana empiezan de nuevo».</p>
          <p>Las complicaciones de la quietud vienen puramente de las excusas. A continuación te dejo algunas de las más comunes junto a sus soluciones:</p>
          <ul>
            <li><strong>Hoy no tengo tiempo para meditar</strong> / No necesitas «tiempo para meditar». Con un minuto al día es suficiente para empezar.</li>
            <li><strong>Estoy muy cansado/estresado para hacerlo</strong> / El cansancio y el estrés son excelentes indicadores de que una sesión de quietud te caerá bien. Incluso podría ser justo lo que necesitas.</li>
            <li><strong>Hoy no tengo ganas, pero mañana lo hago</strong> / Cada día que lo dejes de lado se hará más difícil comenzar. Si hoy no tienes ganas, mañana tendrás menos. Recuerda que solo un minuto es suficiente.</li>
            <li><strong>Yo no creo en ese tipo de cosas místicas</strong> / La quietud no tiene nada de místico. De hecho, en los últimos años se ha vuelto ultra popular en el mundo científico por sus indiscutibles beneficios para el cerebro y su composición.</li>
            <li><strong>No sé cómo se hace</strong> / No necesitas saber nada. Solo siéntate en una posición cómoda y no hagas nada. Si quieres aprender nuevas técnicas, cosa que recomiendo, basta con escribir «meditación» en YouTube para que miles de expertos se maten por enseñarte sus mejores trucos.</li>
            <li><strong>Siempre digo que lo haré y finalmente no lo hago</strong> / Esto es normal y reconocerlo es el primer paso para superarlo. Muchos nos sentimos desesperados tras solo unos segundos sin hacer nada, así que no te preocupes si al principio te cuesta. Si este es tu caso te recomiendo que busques una meditación guiada en YouTube para que alguien más te guíe en cada sesión.</li>
            <li><strong>No me gusta</strong> / A nadie le gusta al principio. ¿Crees que eres el único/a?</li>
            <li><strong>Prefiero hacer otra cosa</strong> / Esto es válido. Más adelante escribiré un artículo hablando de esto que se llamará 5 formas de meditar sin meditar. Aun así, debo decir que la quietud es por mucho el método más efectivo para aprender a controlar tu atención. Por mucho.</li>
          </ul>
          <p><em>(Nota de edición [1 año y 2 meses después]: el artículo 5 formas de meditar sin meditar tampoco se ha escrito, pero hay una sección de mi audio curso Detox Mental completamente dedicada a dichas prácticas meditativas. Para más información acerca del curso, escríbeme a soyalejandroluis1@gmail.com o ve a mi página de contacto).</em></p>
          <p>Si tu motivo para no practicar la quietud no está en esa lista, no desesperes: no existe ninguna razón válida para no probarla. A fin de cuentas, se trata de no hacer absolutamente nada sin invertir ni un bolívar (es decir, nada) para iniciarte.</p>
          <p>El tema de la quietud merece un artículo por sí solo, pero mientras tanto, quédate con la idea de que meditar no te hará ningún daño.</p>
          <p>En todo caso, si se te hace insoportable, esto es una señal de que tu problema de atención es más grave de lo que piensas (esto también es normal), lo que significa que en lugar de evitarla deberías entrarle con todo.</p>
          <p>Nota: si eres una de esas personas que ha tenido experiencias negativas con la meditación, no dudes en dejar un comentario en este artículo si lo sientes conveniente. Yo sé que hay casos de casos.</p>
          <p><em>Comentario de edición [1 año y 2 meses después]: En todo el tiempo que ha transcurrido después de escribir este artículo, he aprendido mucho más acerca de la meditación (además de haber tenido un año más de práctica), y a pesar de que lo dicho anteriormente sigue pareciéndome correcto, debo hacer un par de aclaratorias:</em></p>
          <ul>
            <li>La meditación es una práctica de exploración personal, y a pesar de que tiene enormes beneficios terapéuticos, no es terapia. No puedes (o al menos no deberías) pretender que todos tus problemas de pensamientos se solucionen con la meditación, y si tienes problemas profundos que ni siquiera puedes comprender, lo más recomendable es que vayas a terapia o, alternativamente, adquieras un curso explicativo como Detox Mental[4]. Esto se debe a que:</li>
            <li>Observar tus pensamientos es un primer (y necesario) paso, mas no el único que debes tomar. Tu verdadera intención debe ser: primero, aprender a escucharlos, y luego, aprender a descifrarlos: comprender lo que dicen para poder tomar acción. Esto es explicado en detalle en Detox Mental, y cualquier psicoterapeuta capacitado puede ayudarte con ello.[5]</li>
          </ul>
          <p><em>[Fin del comentario].</em></p>
          <p>Dicho esto, pasemos al último paso de la estrategia: a matar esos PQAs.</p>
        </section>
        {/* Step 5 */}
        <section className="step-section">
          <h3><span className="step-number">5</span> Mata: práctica, práctica, práctica</h3>
          <p>Pasó el tiempo.</p>
          <p>Aprendiste a tomar distancia de tus pensamientos y ya no te identificas con ellos… Al menos no tanto.</p>
          <p>Descubriste por tu propia experiencia que a menos que hagas algo respecto a tus peores pensamientos, no tienen ningún poder sobre ti. Todos son perro que ladra y no muerde.</p>
          <p>Tuviste tus primeras experiencias como asesino de PQAs. Mataste a un par de ellos de hambre y comprobaste que una vez muertos, no suelen revivir—y si lo hacen, vuelven debilitados.</p>
          <p>Aprendiste un par de cosas acerca de la quietud. La probaste algunas veces y aunque no te sentiste «iluminado» como el Buda, llegaste a ver el tremendo potencial de esta práctica.</p>
          <p>¿Qué viene ahora?</p>
          <p><strong>Práctica, práctica, práctica.</strong></p>
          <p>Si crees que tus PQAs se darán por vencidos después de un par de días, estás equivocade[6]. Los pensamientos que te atormentan tienen años gestándose dentro de tu mente y están cómodos allí.</p>
          <p>Peor aún, tú estás cómodo con ellos porque son familiares, los de siempre. ¿Sabes qué es lo único que da más miedo que tus PQAs? El cambio. La mayoría somos alérgicos al cambio y adictos a lo conocido, así que no te sorprendas si después de un tiempo practicando esta estrategia tu mente sigue siendo un campo de batalla.</p>
          <p>A fin de cuentas, posiblemente tú quieras que sea así.</p>
          <p>Puede que no lo reconozcas, pero en algún nivel de tu consciencia se encuentra alguien que genuinamente aprecia la preocupación, la desesperación y el miedo. (Más abajo te daré una recomendación para lidiar con esto).</p>
          <p>Esto parecerá intimidante para muchos y los únicos que se comprometerán con el proceso son aquellos que tienen problemas de pensamientos lo suficientemente grandes como para ignorarlos. El resto seguirá con su vida como siempre y sus PQAs se seguirán alimentando de su atención hasta convertirse en enormes bestias devora-cerebros. Esta es la forma en la que funcionan las cosas en nuestro mundo y no hay nada que reprochar.</p>
          <p>Si tú eres una de las personas que ya llegó al «llegadero» y no soporta ni un día más de esta tortura mental, nunca olvides las siguientes dos verdades:</p>
          <ul>
            <li>Tus emociones controlan tus pensamientos.</li>
            <li>Tus PQAs (Pensamientos Que Atormentan) son señales de que debes tomar alguna acción.</li>
          </ul>
          <p>Comprueba esta teoría por ti mismo/a. Si resulta ser verdadera para ti, será solo cuestión de tiempo para que consigas suavizar el duro problema de pensamientos que estás sufriendo actualmente.</p>
          <p>Sigue el mensaje de tus emociones. Ellas señalan el camino que tú debes seguir para liberarte del tormento.</p>
        </section>
        {/* Recommendations and Conclusion */}
        <section className="recommendations-section">
          <h2>Recomendaciones creativas para liberarte de los pensamientos que te atormentan</h2>
          <p>Como es costumbre en alejandroluis.com, dedicaremos la parte final de este artículo a atacar el problema utilizando nuestra herramienta más poderosa: la creatividad.</p>
          <p>Con todo lo aprendido en este artículo tienes suficientes armas como para solventar tu situación, pero a menos que vuelvas a leerlo constantemente, quedará en el olvido—irónicamente por falta de atención.</p>
          <p>¿Encontraste este post en Google o te apareció en una publicidad en Facebook? Bien, ya diste el primer paso al leerlo.</p>
          <p>La cuestión con los PQAs y con los pensamientos en general es que controlarlos es un trabajo de todos los días, por lo que la mejor manera de mantenerte en el proceso es continuar consumiendo información relacionada que promueva el mismo tipo de ideas que estás teniendo mientras lees estas líneas.</p>
          <blockquote>Como diría Se-Xing Gah Lin Doh: El contenido que consumes te construye. ¿Qué estás construyendo?</blockquote>
          <p>A continuación te daré tres recomendaciones de libros básicos que puedes leer (o audiolibros que puedes escuchar) para comenzar con tu limpieza mental.</p>
          <h3>Fuentes de información recomendadas</h3>
          <ol>
            <li><strong>Deja de ser tú, de Joe Dispenza</strong><br/>El Dr. Joe Dispenza es la persona a la que quieres acudir ahora que tienes problemas con tus pensamientos y emociones. Dispenza es un autor experto en neurociencia que tiene años haciendo estudios sobre el cerebro utilizando tecnología de punta y escribiendo de ello de forma sencilla, clara y accesible para cualquier persona.<br/>Deja de ser tú es el único libro suyo que he leído[7] y lo recomiendo encarecidamente.<br/>La tesis de este libro es que nuestra mente construye nuestra realidad, y basándose en un enfoque totalmente científico, el autor explica cómo nuestros pensamientos tienen un poder real sobre la vida que tenemos además de darnos claves para comprenderlos y manejarlos.</li>
            <li><strong>El poder del ahora, de Eckhart Tolle</strong><br/>Si has estado antes en este blog habrás notado que recomiendo este libro en repetidas ocasiones.<br/>Esto se debe a que El Poder del Ahora es una de esas lecturas que me cambió como persona. Al leerlo descubrí que paso la mayor parte de mi tiempo en «piloto automático» y el solo hecho de notarlo me inició en un camino de autoconocimiento que continuará por el resto de mi vida.<br/>Este libro te ayuda a entender que tus pensamientos no gobiernan tu vida y te hace reflexionar acerca de todo el estrés que te generan las cosas que están fuera de tu control.</li>
            <li><strong>El sutíl arte de que (casi todo) te importe una mi*rda, de Mark Manson</strong><br/>Este libro, cuyo título suena mejor en inglés, es uno de esos mega best sellers que tienen razones para ser tan famosos.<br/>La idea principal de este libro es que las personas nos preocupamos por tantas cosas innecesarias que en cierto punto nuestra vida pierde sentido. En cambio, si elegimos con sabiduría las cosas que sí nos importan y mandamos todo lo demás al carajo, automáticamente recobramos dicho sentido y dejamos atrás la mayor parte de nuestras limitaciones—principalmente porque nos damos cuenta de que, en la mayoría de los casos, ya no nos importa tener «limitaciones».</li>
          </ol>
          <p>Nota de recomendaciones: te recuerdo que si eres «alérgico» a los libros siempre tienes la opción de escucharlos en audiolibro. No te pierdas de la buena información solo porque no tienes el hábito de leer.</p>
          <p><em>Comentario de edición [1 año y 2 meses después]: Todas las recomendaciones que di anteriormente fueron valiosas para mí, pero recientemente (diciembre de 2021) descubrí una fuente de información más poderosa que todas las anteriores: Paramita, un canal de YouTube dedicado a enseñanzas budistas.</em></p>
          <p>¿Yo nací budista? No. ¿Actualmente me considero budista? No. Al menos no tanto como para decir que lo soy.<br/>Y a pesar de que las respuestas a esas preguntas son negativas, hay algo que puedo afirmar con autoridad: lo que he aprendido con ese canal me ha transformado como nada que haya visto antes.<br/>Ahora tengo más paz, más felicidad y un entendimiento de la realidad tremendamente más profundo que antes. Si estás sufriendo por tus PQAs y necesitas algo rápido y gratis que te pueda ayudar, ve a Paramita.</p>
          <p>Obviamente, este tema tiene mucha tela que cortar. El budismo no es para todo el mundo, puede que el maestro (el Lama Rinchen) no te caiga bien, o puede que simplemente seas alérgico a la espiritualidad en general, pero en resumidas cuentas, si tuviera que dar una única recomendación a mis lectores para que establecieran prácticas que les ayuden a restablecer el orden en su mente, sería esta[9].</p>
          <p><em>[Fin del comentario].</em></p>
          <h3>Acciones recomendadas</h3>
          <ol>
            <li><strong>Escribe tus pensamientos en papel</strong><br/>De todas las recomendaciones que pueda darte para liberar tus PQAs, esta es la principal: busca un cuaderno viejo que tengas en casa o compra uno nuevo y empieza a escribir frenéticamente todos tus pensamientos. Go!<br/>Para quienes no lo saben, hay magia en la escritura. Escribir nuestras ideas en papel es uno de los métodos más poderosos para entendernos a nosotros mismos y, hablando de pensamientos tormentosos que necesitamos comprender antes de poder liberar, sería una gran tragedia no utilizar la escritura como herramienta principal para llevar a cabo esta misión.<br/>De todas las cosas que hice mientras me perseguían mis PQAs, la escritura en diario debe ser a la que más tiempo le dediqué.<br/>No es necesario ser nada sofisticado cuando escribimos nuestras preocupaciones. Con solo relatar con sinceridad las cosas que te pasan por la mente encontrarás rápidamente tu flow y liberarás una gran tensión que llevas dentro[10].<br/>Lo mejor de todo: las soluciones comenzarán a aparecer. Pruébalo por ti mismo y descubre el gran poder que se esconde en la palabra escrita.</li>
            <li><strong>Ve a terapia</strong><br/>En décadas anteriores la terapia era repudiada y considerada como algo que solo servía para ayudar a los locos, a los enfermos mentales. Las cosas han cambiado mucho en los últimos años.<br/>En la actualidad, la terapia es una de esas cosas que todos sabemos que debemos hacer pero que siempre dejamos para después. Es extraña para muchos, consume tiempo y dinero y en algunos casos no estamos muy seguros de qué tanto pueda ayudarnos.<br/>Este corto texto es para decirte que sí te va a ayudar. Y mucho.<br/>Todos hemos tenido la experiencia de contarle nuestros problemas a un amigo y sentirnos mucho mejor después de hacerlo. Ahora imagina cómo te sentirías si en lugar de un amigo tuvieras a un experto en escuchar problemas.<br/>Alguien que lo ha hecho diariamente por años y cuyos consejos están respaldados por una ciencia que tiene décadas estudiando y resolviendo problemas como los tuyos.<br/>Mucho mejor que el «yo te entiendo» de tu bien intencionado amigo, eso seguro.<br/>Un espacio seguro donde hablar de tus PQAs puede ser invaluable. Si tienes el dinero y la oportunidad de hacerlo, no la desperdicies. En un futuro te lo agradecerás.<br/>Nota: no utilices a tu pareja como terapeuta. Puedes hablarle de tus problemas, pero si esto se vuelve más repetitivo de lo que debería, tu relación terminará por oxidarse con el paso del tiempo.</li>
          </ol>
          <h3>Recursos de alejandroluis.com para liberarte de los pensamientos que te atormentan</h3>
          <p>Tras años leyendo, escuchando, escribiendo y comprobando con mi propia experiencia la efectividad de las lecciones expuestas en este artículo, he creado dos piezas de contenido que pueden darte un primer empujón a la hora de batallar contra tus PQAs.</p>
          <ul>
            <li><strong>Desbloquea Tu Pasión: 6 preguntas para descubrir la pasión a la que te gustaría dedicarte</strong><br/>Después de invertir cinco años y medio estudiando una carrera que no me gustaba y luchando conmigo mismo para encontrar mi pasión, finalmente descubrí la escritura como la actividad a la que quiero dedicarme por muchos años mientras construyo la vida de mis sueños a su alrededor.<br/>(Nota de edición [1 año y 2 meses después]: al momento de escribir esto tenía muy claro que quería ser escritor profesional, pero ya no estoy tan seguro de esto y debo ser sincero al respecto. Por otro lado, el ebook Desbloquea Tu Pasión sigue siendo vigente porque sigo guiándome de los mismos principios para conseguir un nuevo camino a seguir, que de momento, parece ser un híbrido entre escritor e ingeniero en computación).<br/>Luego de hacer este hallazgo recolecté las seis preguntas más importantes que cualquier persona debe hacerse si quiere conseguir la suya y las comprimí en un corto ebook que puedes leer en una tarde sin presión alguna.<br/>Desbloquea tu pasión pondrá tu creatividad a trabajar de forma profunda y divertida.<br/>Si tus PQAs están relacionados con el camino que lleva tu vida, con tu carrera universitaria, con la opinión de otras personas o con la frustración de no saber ni por donde empezar a construir la vida de tus sueños, este ebook es para ti.<br/>Adquiere el ebook Desbloquea tu Pasión y permítele a tu mente encontrar una respuesta a la pregunta más importante de tu vida.<br/><a href="https://www.amazon.com/Desbloquea-tu-Pasi%C3%B3n-preguntas-descubrir-ebook/dp/B08L5V6J8B">Haz clic aquí para obtenerlo en Amazon por $14,99.</a></li>
            <li><strong>El manifiesto de las almas creativas</strong><br/>Un manifiesto es un texto sugestivo, corto y emocionante que te anima a hacer algo. Si es bien recitado, funciona como una especie de hechizo que pone tu mente en modo «manos a la obra».<br/>En alejandroluis.com utilizamos El manifiesto de las almas creativas como ese «embrujo» que te dices a ti mismo para entender que el camino hacia tu felicidad pasa por la vía de la creatividad.<br/><a href="https://alejandroluis.com/manifiesto/">Haz clic aquí para descargarlo totalmente gratis.</a></li>
          </ul>
          <h3>¿Quieres que yo te ayude personalmente?</h3>
          <p>Cuando tenemos un problema de PQAs, lo más difícil es conseguir a alguien que entienda por lo que estamos pasando. Que no nos diga que nos «relajemos y ya» y que, por el contrario, nos ayude a conseguir soluciones.</p>
          <p>Tras escribir este artículo hace más de un año, recibí numerosos mensajes de personas con problemas como el tuyo que buscaban ayuda para «desenmarañar» su mente. Para volver a ser quienes eran antes de caer víctimas de sus pensamientos.</p>
          <p>Para apoyarlos, creé un método de preguntas-respuestas que se adaptan fácilmente a cualquiera que sea tu situación, y llevarlo a cabo lleva aproximadamente 2 horas en una reunión presencial (en Madrid) o una videollamada,</p>
          <p>El precio de esta sesión es de $30. Si te interesa, escríbeme un correo a soyalejandroluis1@gmail.com o ve a mi página de contacto. En tu mensaje, cuéntame resumidamente tu historia y yo te responderé explicándote cómo es el proceso.</p>
          <a href="https://alejandroluis.com/contacto/">Ir a página de contacto</a>
          <p>Los resultados han sido geniales hasta ahora. Escríbeme y veamos si podemos formar buen equipo para empezar a poner tu mente en orden.</p>
          <h3>EXPERIMENTO</h3>
          <p><strong>*Redoble de tambores*</strong></p>
          <p>Esto es algo que me emociona anunciar: voy a hacer mi primer experimento con otras personas y quiero que ustedes sean parte.</p>
          <p>¿De qué se trata?</p>
          <p>El nuevo curso Detox Mental sigue siendo muy nuevo y todavía no tengo suficiente información como para saber si funciona como me gustaría. Necesito personas que lo prueben y respondan una serie de preguntas que yo les haré para determinar qué cosas hay que añadir, qué cosas hay que mejorar, y qué cosas hay que eliminar por completo de cara a una versión 2.0.</p>
          <p>El trato es simple: este es un curso que normalmente vale $30 y se lo voy a dar gratis a las primeras 3 personas que se comprometan a hacer el experimento conmigo. Debo aclarar que son 30 días de compromiso (lo que considero el tiempo mínimo para ver algún cambio en tus PQAs) y que, además de toda la ayuda que yo brindaré, como si fuera un asesorado común y corriente, necesito ayuda de ustedes también para pulir este curso y que sirva para ayudar a muchas otras personas.</p>
          <p>Esta oportunidad está siendo publicada primeramente en mi Instagram, exclusivamente para mis seguidores y sin ningún tipo de publicidad que personas externas puedan ver. Si estás aquí porque hiciste clic en el enlace de mis historias, buenísimo: puede que estés justo a tiempo para formar parte del experimento.</p>
          <p>Esto seguirá siendo así desde el sábado 30/04/22 hasta el lunes 02/05/22. A partir de ese día, este post volverá a su estado normal con publicidad en Instagram y Facebook, y si no tengo a las tres personas que necesito, los cupos estarán abiertos para todo el mundo.</p>
          <p>Para formar parte, escríbeme a soyalejandroluis1@gmail.com o déjame un mensaje en mi página de contacto. Esto va a ser divertido.</p>
          <h3>Conclusiones</h3>
          <p>Los 5 pasos para liberarte de los pensamientos que te atormentan son:</p>
          <ol>
            <li>Toma distancia: tú NO eres tu mente.</li>
            <li>Reconoce: tus pensamientos no pueden hacerte daño… Si no se lo permites.</li>
            <li>Comprende: todo pensamiento muere si no lo alimentas con tu atención.</li>
            <li>Ármate: aprende a administrar tu atención utilizando la quietud como arma principal.</li>
            <li>Mata: practica todo lo que necesites hasta que te conviertas en un implacable exterminador de PQAs.</li>
          </ol>
          <p><strong>Importante:</strong></p>
          <ul>
            <li>Tus emociones controlan tus pensamientos y tus PQAs son señales que te piden a gritos que tomes acción. ¿Qué cosa deberías estar haciendo que podría aliviar tu tormento? Esa es la pregunta que debes hacerte constantemente.</li>
            <li>Lee. Escucha. Piensa. Escribe. Usa tu creatividad. Todas estas acciones te acercarán a tu objetivo de liberar tu mente de pensamientos que te atormentan y mientras más las practiques, más rápido y mejor saldrás de esta situación.</li>
            <li>No subestimes la falta de control que tienes sobre tu mente</li>
            <li>Saber dirigir nuestra atención es una de las habilidades más difíciles de desarrollar en la actualidad.</li>
            <li>A pesar de esto es posible mejorar y conseguir «distancia» de nuestros pensamientos.</li>
            <li>Tú no eres tu mente. Asimismo, tú no eliges tus pensamientos, pero sí decides si sobreviven o no.</li>
            <li>En mi caso, lo que pudo convertirse en un trauma terminó en una excelente práctica para mi fortaleza mental y lo mejor es que no necesité grandes esfuerzos ni intervenciones médicas para lograrlo.</li>
            <li>En mi opinión, todos debemos aprender cómo funciona nuestra propia mente y desarrollar prácticas y herramientas para controlarla cuando sea necesario.</li>
            <li>Empieza por no juzgar lo que pasa por tu cabeza y empezarás a ver resultados positivos. Menos estrés, menos ansiedad, más felicidad, más tranquilidad, más libertad.</li>
            <li>Entiende tus pensamientos y no les des más importancia de la que tienen. Tu salud mental se verá beneficiada a partir del día en que empieces a hacerlo.</li>
            <li>Haz uso de estos conocimientos y las recomendaciones expuestas en el artículo y en menos tiempo del que imaginas volverás a vivir libre de los pensamientos que te atormentan.</li>
          </ul>
        </section>
      </main>
      <footer className="article-footer">
        <p>Artículo original por Alejandro Luis | <a href="https://alejandroluis.com" target="_blank" rel="noopener noreferrer">alejandroluis.com</a></p>
      </footer>
    </div>
  );
}

export default Article;