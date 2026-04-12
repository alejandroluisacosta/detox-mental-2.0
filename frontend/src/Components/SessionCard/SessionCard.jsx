import './SessionCard.css'
import { useSessions } from '../../Context/SessionsContext.jsx';

const SessionCard = ({ session, index, handleGoToSession }) => {
    const { sessionsLoading } = useSessions();

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
            <img src={session.img} className='session-card__image' alt={`Imagen de sesión ${session.id}`}/>
            <h2 className='session-card__header'>{`Sesión ${session.id}:`}</h2>
            <h2 className='session-card__title'>{session.title}</h2>
            <p className='session-card__description'>{session.description}</p>
            <button className={`session-card__button${session.isBlocked ? ' session-card__button--blocked' : ''}`}>{session.isBlocked ? 'DESBLOQUEAR' : 'ESCUCHAR'}</button>
        </div>
    )
}

export default SessionCard;