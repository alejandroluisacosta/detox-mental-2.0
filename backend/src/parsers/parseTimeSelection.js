function parseTimeSelection(userMessage) {
  const normalized = userMessage.toLowerCase();

  if (normalized.includes("2")) return 2;
  if (normalized.includes("5")) return 5;
  if (normalized.includes("15")) return 15;

  return null;
}