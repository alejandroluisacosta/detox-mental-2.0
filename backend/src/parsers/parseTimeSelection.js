export function parseTimeSelection(userMessage) {
  const match = userMessage.trim().match(/^(\d+)\b/);
  if (!match) return null;

  const value = Number(match[1]);

  if (value === 2 || value === 5 || value === 15) {
    return value;
  }

  return null;
}
