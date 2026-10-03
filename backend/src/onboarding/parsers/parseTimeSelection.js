const TOKEN_TO_MINUTES = {
  2: 2,
  two: 2,
  dos: 2,
  5: 5,
  five: 5,
  cinco: 5,
  15: 15,
  fifteen: 15,
  quince: 15,
};

const TIME_TOKEN_RE = /\b(15|2|5|two|dos|five|cinco|fifteen|quince)\b/gi;

export function parseTimeSelection(userMessage) {
  if (typeof userMessage !== "string") return null;

  const found = new Set();
  for (const match of userMessage.matchAll(TIME_TOKEN_RE)) {
    const minutes = TOKEN_TO_MINUTES[match[1].toLowerCase()];
    if (minutes) found.add(minutes);
  }

  if (found.size === 1) return [...found][0];
  return null;
}
