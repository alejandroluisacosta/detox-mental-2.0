/** Matches the revise-endpoint cap; one comment per clickable passage. */
export const MAX_QUEUED_COMMENTS = 20;

/** Stable id for a clickable summary passage. */
export const commentTargetId = (section, index = 0) => `${section}:${index}`;

/** Replace a queued comment for the same passage, or append a new one. */
export const upsertTargetComment = (comments, next) => {
  const list = Array.isArray(comments) ? comments : [];
  const index = list.findIndex((item) => item.targetId === next.targetId);
  if (index === -1) return [...list, next];
  return list.map((item, i) =>
    i === index ? { ...item, ...next, id: item.id } : item,
  );
};
