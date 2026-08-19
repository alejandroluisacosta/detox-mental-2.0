import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useSessions } from '../../Context/SessionsContext.jsx';
import './Account.css';

const TOTAL_SESSIONS = 15;

function buildMemberSince(createdAt) {
  if (!createdAt) return 'Miembro desde: --';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Miembro desde: --';
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
  const year = new Intl.DateTimeFormat('es-ES', { year: 'numeric' }).format(date);
  return `Miembro desde: ${month} de ${year}.`;
}

export default function Account() {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const { sessions } = useSessions();

  useEffect(() => {
    if (status !== 'ready') return;
    if (!user) navigate('/login', { replace: true });
  }, [status, user, navigate]);

  const memberSinceLabel = useMemo(() => buildMemberSince(user?.created_at), [user]);
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
        <h1 className='account-page__title'>Mi Cuenta</h1>
        <section className='account-page__panel'>
          <p className='account-page__email'>{user.email}</p>
          <p className='account-page__member-since'>{memberSinceLabel}</p>
        </section>

        <section className='account-page__panel'>
          <h2 className='account-page__subtitle'>Sesiones desbloqueadas</h2>
          <ul className='account-page__sessions-list'>
            {sessionRows.map((session) => (
              <li
                key={session.id}
                className={`account-page__session${session.unlocked ? ' account-page__session--unlocked' : ''}`}
              >
                Sesión {session.id}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className='account-page__footer-nav'>
        <button type='button' className='account-page__footer-button' onClick={() => navigate('/')}>
          INICIO
        </button>
      </footer>
    </div>
  );
}
