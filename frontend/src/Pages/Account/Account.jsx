import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { useSessions } from '../../Context/SessionsContext.jsx';
import { formatLocaleDate } from '../../utils/locale.js';
import './Account.css';

const TOTAL_SESSIONS = 15;

const buildMemberSince = (createdAt, locale, t) => {
  if (!createdAt) return t('account.memberSinceUnknown');
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return t('account.memberSinceUnknown');
  const month = formatLocaleDate(date, locale, { month: 'long' });
  const year = formatLocaleDate(date, locale, { year: 'numeric' });
  return t('account.memberSince', { month, year });
};

const Account = () => {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const { sessions } = useSessions();
  const { locale, t } = useLocale();

  useEffect(() => {
    if (status !== 'ready') return;
    if (!user) navigate('/login', { replace: true });
  }, [status, user, navigate]);

  const memberSinceLabel = useMemo(
    () => buildMemberSince(user?.created_at, locale, t),
    [user, locale, t],
  );
  const sessionRows = useMemo(() => {
    const unlocked = new Set(
      sessions.filter((session) => !session.isBlocked).map((session) => session.id),
    );
    return Array.from({ length: TOTAL_SESSIONS }, (_, i) => {
      const id = i + 1;
      return { id, unlocked: unlocked.has(id) };
    });
  }, [sessions]);

  if (status === 'loading' || !user) return null;

  return (
    <div className='account-page'>
      <main className='account-page__content'>
        <h1 className='account-page__title'>{t('account.title')}</h1>
        <section className='account-page__panel'>
          <p className='account-page__email'>{user.email}</p>
          <p className='account-page__member-since'>{memberSinceLabel}</p>
        </section>

        <section className='account-page__panel'>
          <h2 className='account-page__subtitle'>{t('account.unlockedSessions')}</h2>
          <ul className='account-page__sessions-list'>
            {sessionRows.map((session) => (
              <li
                key={session.id}
                className={`account-page__session${session.unlocked ? ' account-page__session--unlocked' : ''}`}
              >
                {t('account.session', { id: session.id })}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className='account-page__footer-nav'>
        <button type='button' className='account-page__footer-button' onClick={() => navigate('/')}>
          {t('account.home')}
        </button>
      </footer>
    </div>
  );
};

export default Account;
