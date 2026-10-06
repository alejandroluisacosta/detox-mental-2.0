import { useMemo } from 'react';
import { useLocale } from '../Context/LocaleContext.jsx';
import {
  getSessionAudioSrc,
  getSessions,
  getTestExtras,
  getTests,
  getTheory,
} from '../data/content/index.js';

export const useSessionsCatalog = () => {
  const { locale } = useLocale();
  return useMemo(() => getSessions(locale), [locale]);
};

export const useTestsCatalog = () => {
  const { locale } = useLocale();
  return useMemo(() => getTests(locale), [locale]);
};

export const useTestExtras = () => {
  const { locale } = useLocale();
  return useMemo(() => getTestExtras(locale), [locale]);
};

export const useTheory = () => {
  const { locale } = useLocale();
  return useMemo(() => getTheory(locale), [locale]);
};

export const useSessionAudioSrc = (sessionId) => {
  const { locale } = useLocale();
  return getSessionAudioSrc(sessionId, locale);
};
