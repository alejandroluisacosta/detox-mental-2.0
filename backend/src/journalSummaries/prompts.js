const MAX_INPUT_CHARS = 10000;

const formatEntryBlock = (entry, index) => {
  const topics =
    Array.isArray(entry.topics) && entry.topics.length > 0
      ? entry.topics.join(', ')
      : 'sin etiquetar';
  const when = entry.createdAt
    ? new Date(entry.createdAt).toISOString()
    : 'fecha desconocida';
  return [
    `### Entrada ${index + 1}`,
    `id: ${entry.id}`,
    `fecha: ${when}`,
    `temas: ${topics}`,
    'texto:',
    entry.content,
  ].join('\n');
};

/** Newest-first truncation so recent writing is preferred under the char budget. */
export const buildEntriesPromptSection = (entries) => {
  const ordered = [...entries].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const blocks = [];
  let used = 0;
  for (const entry of ordered) {
    const block = formatEntryBlock(entry, blocks.length);
    const next = used + block.length + 2;
    if (blocks.length > 0 && next > MAX_INPUT_CHARS) break;
    blocks.push(block);
    used = next;
  }

  // Present chronologically (oldest → newest) for the model
  return blocks.reverse().join('\n\n');
};

export const buildSummaryMessages = ({ entries, weekStart, weekEnd }) => {
  const entriesSection = buildEntriesPromptSection(entries);

  const system = [
    'Eres un espejo de pensamiento para Detox Mental, una herramienta de autorreflexión.',
    'Recibes entradas de diario de una persona en español. Debes devolver SOLO un objeto JSON válido, sin markdown ni prosa alrededor.',
    'Esquema exacto:',
    '{"summary":"string","mainTopics":["string"],"bestQuote":"string","socratic":"string"}',
    'Reglas:',
    '- summary: 2–4 párrafos cortos que reflejen con neutralidad lo escrito y los temas principales. No inventes hechos. No diagnostiques. No uses jerga clínica.',
    '- mainTopics: entre 2 y 5 etiquetas cortas (pueden alinearse con Trabajo, Interpersonal, Reflexión, Sabiduría, Preocupaciones u otras precisas).',
    '- bestQuote: una frase o pasaje BREVE tomado de forma casi literal del texto del usuario. No inventes. Si hay que recortar, usa elipsis…',
    '- socratic: UNA sola pregunta o desafío al estilo de Sócrates: afilado, exigente, que obligue a examinar una creencia o contradicción. No aconsejes blandamente. No sermonees. No digas "deberías". No diagnostiques.',
    '- Todo el contenido en español.',
    '- Si el material es escaso, sé honesto en el summary sin rellenar con generalidades.',
  ].join('\n');

  const user = [
    `Semana del ${weekStart} al ${weekEnd} (Europe/Madrid).`,
    `Número de entradas incluidas: ${entries.length}.`,
    '',
    'Entradas del diario:',
    entriesSection,
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
};
