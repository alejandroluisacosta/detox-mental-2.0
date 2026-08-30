import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiFetch } from '../api/client.js';
import { JOURNAL_TOPIC_IDS } from '../data/journalTopics.js';
import { useAuth } from './AuthContext.jsx';
import { useLocale } from './LocaleContext.jsx';

const JournalTopicsContext = createContext(null);

export const JournalTopicsProvider = ({ children }) => {
  const { user, status: authStatus } = useAuth();
  const { t } = useLocale();
  const [customTopics, setCustomTopics] = useState([]);
  const [status, setStatus] = useState('idle');

  const loadTopics = useCallback(async () => {
    if (!user) {
      setCustomTopics([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    try {
      const res = await apiFetch('/auth/me/journal-topics');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || t('journal.topicsLoadFailed'));
      }
      setCustomTopics(Array.isArray(data.topics) ? data.topics : []);
      setStatus('ready');
    } catch (err) {
      console.error('[journal-topics GET]', err);
      setCustomTopics([]);
      setStatus('error');
    }
  }, [t, user]);

  useEffect(() => {
    if (authStatus === 'loading') return;
    loadTopics();
  }, [authStatus, loadTopics]);

  const allTopics = useMemo(
    () => [...JOURNAL_TOPIC_IDS, ...customTopics.map((topic) => topic.name)],
    [customTopics],
  );

  const createTopic = useCallback(
    async (name) => {
      const res = await apiFetch('/auth/me/journal-topics', {
        method: 'POST',
        body: { name },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || t('journal.topicCreateFailed'));
      }
      const topic = data.topic;
      if (topic?.id && topic?.name) {
        setCustomTopics((prev) => [...prev, topic]);
      }
      return topic;
    },
    [t],
  );

  const renameTopic = useCallback(
    async (topicId, name) => {
      const res = await apiFetch(`/auth/me/journal-topics/${topicId}`, {
        method: 'PATCH',
        body: { name },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || t('journal.topicRenameFailed'));
      }
      const topic = data.topic;
      if (topic?.id && topic?.name) {
        setCustomTopics((prev) =>
          prev.map((item) => (item.id === topic.id ? topic : item)),
        );
      }
      return topic;
    },
    [t],
  );

  const value = useMemo(
    () => ({
      customTopics,
      allTopics,
      status,
      createTopic,
      renameTopic,
    }),
    [allTopics, createTopic, customTopics, renameTopic, status],
  );

  return (
    <JournalTopicsContext.Provider value={value}>
      {children}
    </JournalTopicsContext.Provider>
  );
};

export const useJournalTopics = () => {
  const ctx = useContext(JournalTopicsContext);
  if (!ctx) {
    throw new Error('useJournalTopics must be used within a JournalTopicsProvider');
  }
  return ctx;
};
