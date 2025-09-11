import './SessionCard.css'

const SessionCard = ({ session, index, handleGoToSession }) => {
    return (
        <div key={index} className='session-card' onClick={() => handleGoToSession(session.id)}>
            {session.isBlocked && <div className='session-card__blocked-layer'></div>}
            <img src={session.img} className='session-card__image' alt={`Imagen de sesión ${session.id}`}/>
            <h2 className='session-card__header'>{`Sesión ${session.id}:`}</h2>
            <h2 className='session-card__title'>{session.title}</h2>
            <p className='session-card__description'>{session.description}</p>
            <button className={`session-card__button${session.isBlocked ? ' session-card__button--blocked' : ''}`}>{session.isBlocked ? 'DESBLOQUEAR' : 'ESCUCHAR'}</button>
        </div>
    )
}

export default SessionCard;