import './SessionCard.css'
import { useSessions } from '../../Context/SessionsContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';

const SessionCard = ({ session, index, handleGoToSession }) => {
    const { sessionsLoading } = useSessions();
    const { t } = useLocale();

    const showLoading =
        sessionsLoading && session.id >= 4;

    return (
        <div key={index} className='session-card' onClick={() => handleGoToSession(session.id)}>
            {showLoading && (
                <div className="session-card__loading-overlay" aria-hidden>
                    <span className="session-card__spinner" />
                </div>
            )}
            {session.isBlocked && !showLoading && <div className='session-card__blocked-layer'></div>}
            <img src={session.img} className='session-card__image' alt={t('session.cardImageAlt', { id: session.id })}/>
            <h2 className='session-card__header'>{t('session.cardHeader', { id: session.id })}</h2>
            <h2 className='session-card__title'>{session.title}</h2>
            <p className='session-card__description'>{session.description}</p>
            <button className={`session-card__button${session.isBlocked ? ' session-card__button--blocked' : ''}`}>{session.isBlocked ? t('session.unlock') : t('session.listen')}</button>
        </div>
    )
}

export default SessionCard;
