import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { resolveSummaryAvailability } from '../../utils/summaryAvailability.js';
import './JournalSummaryBanner.css';

/**
 * Soft alert when the weekly summary can be created.
 * Hidden for guests, while loading, or when creation is not available.
 */
const JournalSummaryBanner = () => {
  const { user, status } = useAuth();
  const { t } = useLocale();
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    if (status !== 'ready' || !user) {
      setCanCreate(false);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiFetch('/auth/me/journal-summaries/current');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCanCreate(resolveSummaryAvailability(data).canCreate);
        }
      } catch {
        if (!cancelled) setCanCreate(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [status, user]);

  if (!canCreate) return null;

  return (
    <div className="journal-summary-banner" role="status">
      <p className="journal-summary-banner__text">
        {t('summary.bannerText')}
      </p>
      <Link to="/journal/summary" className="journal-summary-banner__link">
        {t('summary.bannerLink')}
      </Link>
    </div>
  );
};

export default JournalSummaryBanner;
