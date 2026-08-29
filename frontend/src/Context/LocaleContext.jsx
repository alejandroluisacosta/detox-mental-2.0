import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate, translateTopic } from '../utils/translate.js';
import {
  applyDocumentLocale,
  parseLocale,
  readStoredLocale,
  setRequestLocale,
  writeStoredLocale,
} from '../utils/locale.js';

const LocaleContext = createContext(null);

export const LocaleProvider = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState(() =>
    parseLocale(initialLocale ?? readStoredLocale()),
  );

  useEffect(() => {
    setRequestLocale(locale);
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale) => {
    const resolved = writeStoredLocale(nextLocale);
    setRequestLocale(resolved);
    applyDocumentLocale(resolved);
    setLocaleState(resolved);
  }, []);

  const t = useCallback((key, values) => translate(locale, key, values), [locale]);
  const topicLabel = useCallback(
    (topicId) => translateTopic(locale, topicId),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      topicLabel,
    }),
    [locale, setLocale, t, topicLabel],
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
