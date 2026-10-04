export const bookTitleForField = (frontMatter, defaultTitle) => {
  if (frontMatter?.titleUsesDefault !== false) {
    return defaultTitle;
  }
  return typeof frontMatter?.title === 'string' ? frontMatter.title : '';
};

export const bookTitleFieldIsDirty = (draftTitle, frontMatter, defaultTitle) => {
  const savedDisplay = bookTitleForField(frontMatter, defaultTitle);
  const draft = typeof draftTitle === 'string' ? draftTitle.trim() : '';
  return draft !== savedDisplay.trim();
};

export const bookTitlePatchFromDraft = (draftTitle, frontMatter, defaultTitle) => {
  if (!bookTitleFieldIsDirty(draftTitle, frontMatter, defaultTitle)) {
    return null;
  }
  const trimmed = typeof draftTitle === 'string' ? draftTitle.trim() : '';
  return { title: trimmed, titleUsesDefault: false };
};
