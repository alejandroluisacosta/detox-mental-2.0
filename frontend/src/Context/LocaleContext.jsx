import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate, translateBlogCategory, translateTopic } from '../utils/translate.js';
import {
  applyDocumentLocale,
  readStoredLocale,
  writeStoredLocale,
} from '../utils/locale.js';

const LocaleContext = createContext(null);

export const LocaleProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => readStoredLocale());

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale) => {
    setLocaleState(writeStoredLocale(nextLocale));
  }, []);

  const t = useCallback((key, values) => translate(locale, key, values), [locale]);
  const topicLabel = useCallback(
    (topicId) => translateTopic(locale, topicId),
    [locale],
  );
  const blogCategoryLabel = useCallback(
    (slug) => translateBlogCategory(locale, slug),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      topicLabel,
      blogCategoryLabel,
    }),
    [locale, setLocale, t, topicLabel, blogCategoryLabel],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx;
};
