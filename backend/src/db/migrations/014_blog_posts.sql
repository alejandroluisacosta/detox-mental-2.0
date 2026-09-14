-- =====================================================
-- Migration 014: Personal blog posts
-- Adds published/draft articles for /alejandroluis/blog
-- and seeds two mock posts for the initial categories.
-- =====================================================

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    category VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    author_id UUID,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_blog_posts_author_id
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published')),
    CONSTRAINT blog_posts_category_check CHECK (
        category IN ('personal-development', 'technology')
    ),
    CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT blog_posts_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT blog_posts_body_not_empty CHECK (LENGTH(TRIM(body)) > 0)
);

CREATE INDEX idx_blog_posts_published_at
    ON blog_posts (published_at DESC)
    WHERE status = 'published';

CREATE INDEX idx_blog_posts_category
    ON blog_posts (category)
    WHERE status = 'published';

CREATE TRIGGER trigger_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO blog_posts (
    id,
    slug,
    title,
    excerpt,
    body,
    category,
    status,
    published_at
) VALUES (
    '7c8f1a2e-4b9d-4c31-9a55-0d1e2f3a4b5c',
    'la-atencion-es-un-voto',
    'La atención es un voto',
    'Cada vez que miras un pensamiento, un mensaje o una persona, estás votando por el tipo de mente que quieres tener mañana.',
    $post1$Cada vez que prestas atención a algo, estás votando.

No es una metáfora suave. Es literal: tu mente se construye con aquello que alimentas. Si pasas la tarde reviviendo una discusión, mañana será más fácil volver a ella. Si pasas la tarde escribiendo, mañana será más fácil sentarte a escribir.

## El voto silencioso

Nadie anuncia estos votos. Ocurren en la cola del supermercado, en los tres minutos antes de dormir, en el instante en que desbloqueas el teléfono «solo un segundo».

> Lo que consumes te construye. ¿Qué estás construyendo?

Esa pregunta no pide una respuesta brillante. Pide honestidad. Si el 80% de tu atención se va a estímulos que te dejan inquieto, no es extraño que tu vida interior se sienta inquieta.

## Tres prácticas pequeñas

1. **Nombrar el voto.** Cuando notes que estás rumiando, dilo en voz baja: «estoy votando por la rumia». El nombre abre una grieta.
2. **Cambiar de urna.** No hace falta meditar una hora. Un minuto mirando por la ventana ya es otro candidato.
3. **Repetir mañana.** Un voto no gana una elección. Una secuencia de votos sí.

El desarrollo personal no empieza cuando lees el libro correcto. Empieza cuando dejas de fingir que tu atención es gratuita.
$post1$,
    'personal-development',
    'published',
    '2026-08-12 10:00:00+00'
), (
    '9d0e2b3f-5c0e-4d42-8b66-1e2f3a4b5c6d',
    'el-telefono-no-es-el-enemigo',
    'El teléfono no es el enemigo',
    'La tecnología no te roba la vida por magia. Lo hace cuando la usas como refugio automático contra el silencio.',
    $post2$Hay un género entero de ensayos que tratan al teléfono como un villano. Es cómodo: si el aparato es el culpable, tú quedas libre.

Yo no lo veo así.

## Una herramienta con hambre

El teléfono es extraordinario. Cabe en el bolsillo y contiene bibliotecas, mapas, conversaciones con personas que quiero. También está diseñado para pedir otro toque, otra ronda, otra notificación.

Esa tensión no se resuelve tirando el aparato al mar. Se resuelve aprendiendo a usarlo como herramienta, no como anestesia.

## La prueba del silencio

Si cada hueco del día se llena solo —el semáforo, el ascensor, la cama—, el teléfono dejó de ser una herramienta. Se volvió el lugar al que huyes cuando aparece un segundo de quietud.

Eso no es un problema técnico. Es un hábito emocional.

## Una regla que sí uso

Cuando abro una app, nombro para qué. «Voy a responder a Ana». «Voy a leer este artículo». Si no puedo nombrar el para qué, cierro la pantalla.

Suena infantil. Funciona precisamente por eso: obliga a votar antes de que el diseño vote por ti.

La tecnología no tiene que ser tu enemiga. Tiene que dejar de ser tu escondite.
$post2$,
    'technology',
    'published',
    '2026-09-02 09:30:00+00'
);
