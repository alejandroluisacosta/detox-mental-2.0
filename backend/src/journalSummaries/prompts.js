const MAX_INPUT_CHARS = 10000;

const formatEntryBlock = (entry, index) => {
  const topics =
    Array.isArray(entry.topics) && entry.topics.length > 0
      ? entry.topics.join(', ')
      : 'untagged';
  const when = entry.createdAt
    ? new Date(entry.createdAt).toISOString()
    : 'unknown date';
  return [
    `### Entry ${index + 1}`,
    `id: ${entry.id}`,
    `date: ${when}`,
    `topics: ${topics}`,
    'text:',
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
    'You are a thinking mirror for Detox Mental, a self-reflection tool.',
    'You receive a person\'s journal entries (usually in Spanish). Return ONLY a valid JSON object, with no markdown and no prose around it.',
    'Exact schema:',
    '{"summary":"string","mainTopics":["string"],"bestQuote":"string","socratic":"string"}',
    'Rules:',
    '- summary: 2–4 short paragraphs that mirror what they wrote and the main themes. Address the user directly in second person (tú / "you"), as if speaking to them — e.g. "Has estado pensando…", never third person like "the author" / "el autor del diario". Do not invent facts. Do not diagnose. Do not use clinical jargon.',
    '- mainTopics: 2 to 5 short labels (may align with Trabajo, Interpersonal, Reflexión, Sabiduría, Preocupaciones, or other precise labels).',
    '- bestQuote: one BRIEF sentence or passage taken nearly verbatim from the user\'s text. Do not invent. If you must shorten it, use an ellipsis…',
    '- socratic: ONE sharp Socratic question or challenge that forces examination of a belief or contradiction. No soft advice. No sermons. Do not say "you should" / "deberías". Do not diagnose.',
    '- Write every user-facing string value (summary, mainTopics, bestQuote, socratic) in Spanish.',
    '- If the material is sparse, be honest in the summary; do not pad with generic filler.',
  ].join('\n');

  const user = [
    `Week from ${weekStart} to ${weekEnd} (Europe/Madrid).`,
    `Number of entries included: ${entries.length}.`,
    '',
    'Journal entries:',
    entriesSection,
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
};
