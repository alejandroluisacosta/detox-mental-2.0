import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import DemoModeToggle from '../../Components/DemoModeToggle/DemoModeToggle.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { getDemoEntries } from '../../data/demoJournal.js';
import { emitToast } from '../../lib/toastBus.js';
import { formatLocaleDate } from '../../utils/locale.js';
import './JournalMeditations.css';

const MEDITATIONS_TOPIC = 'meditations';

const formatEntryDate = (iso, locale, unknownLabel) => {
  const formatted = formatLocaleDate(iso, locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatted || unknownLabel;
};

const filterMeditationEntries = (entries) =>
  entries
    .filter((entry) => Array.isArray(entry.topics) && entry.topics.includes(MEDITATIONS_TOPIC))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const JournalMeditations = () => {
  const { user, status } = useAuth();
  const { demoMode } = useDemoMode();
  const { locale, t } = useLocale();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const demoEntries = useMemo(
    () => (demoMode ? filterMeditationEntries(getDemoEntries(locale)) : []),
    [demoMode, locale],
  );
  const visibleEntries = demoMode ? demoEntries : entries;

  useEffect(() => {
    if (demoMode) {
      setEntries([]);
      setLoading(false);
      return undefined;
    }

    if (status !== 'ready' || !user) {
      setEntries([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const loadEntries = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/auth/me/journal-entries?topic=meditations');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || t('meditations.loadFailed'));
        }
        const data = await res.json();
        if (!cancelled) {
          setEntries(Array.isArray(data.entries) ? data.entries : []);
        }
      } catch (err) {
        console.error('[journal meditations GET]', err);
        if (!cancelled) {
          setEntries([]);
          emitToast(err.message || t('meditations.loadFailed'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [demoMode, status, t, user]);

  return (
    <div className="journal-page journal-page--meditations">
      <Navigation />
      <main className="journal-page__main journal-page__main--meditations">
        <header className="journal-meditations__header">
          <div className="journal-meditations__header-top">
            <h1 className="journal-meditations__title">{t('meditations.title')}</h1>
            <DemoModeToggle />
          </div>
          <Link to="/journal/history" className="journal-meditations__history-link">
            {t('meditations.history')}
          </Link>
        </header>

        {!demoMode && status === 'loading' && (
          <LoadingStatus>{t('meditations.loading')}</LoadingStatus>
        )}

        {!demoMode && status === 'ready' && !user && (
          <div className="journal-meditations__empty">
            <p>{t('meditations.guestEmpty')}</p>
            <Link to="/login" className="journal-meditations__action-link">
              {t('meditations.login')}
            </Link>
          </div>
        )}

        {!demoMode && status === 'ready' && user && loading && (
          <LoadingStatus>{t('meditations.loadingEntries')}</LoadingStatus>
        )}

        {!demoMode && status === 'ready' && user && !loading && visibleEntries.length === 0 && (
          <div className="journal-meditations__empty">
            <p>{t('meditations.noEntries')}</p>
            <Link to="/journal/history" className="journal-meditations__action-link">
              {t('meditations.goToHistory')}
            </Link>
          </div>
        )}

        {(demoMode || (status === 'ready' && user && !loading && visibleEntries.length > 0)) && (
          <article className="journal-meditations__compilation">
            {visibleEntries.map((entry) => (
              <section key={entry.id} className="journal-meditations__section">
                <h2 className="journal-meditations__date">
                  <time dateTime={entry.createdAt}>
                    {formatEntryDate(entry.createdAt, locale, t('meditations.unknownDate'))}
                  </time>
                </h2>
                <p className="journal-meditations__text">{entry.content}</p>
              </section>
            ))}
          </article>
        )}
      </main>
    </div>
  );
};

export default JournalMeditations;
