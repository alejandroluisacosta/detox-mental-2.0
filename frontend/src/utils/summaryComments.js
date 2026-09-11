/** Replace a queued comment for the same summary section, or append a new one. */
export const upsertSectionComment = (comments, next) => {
  const list = Array.isArray(comments) ? comments : [];
  const index = list.findIndex((item) => item.section === next.section);
  if (index === -1) return [...list, next];
  return list.map((item, i) =>
    i === index ? { ...item, ...next, id: item.id } : item,
  );
};
