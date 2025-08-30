import { useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AudioPlayer from '../AudioPlayer/AudioPlayer'
import './Session.css';
import { SessionsContext } from '../../Context/SessionsContext';
import BlockedSession from '../BlockedSession/BlockedSession';

const Session = () => {
    const { sessionId } = useParams();
    const sessionNumber = Number(sessionId);
    const TOTAL_SESSIONS = 15;
    const { sessions } = useContext(SessionsContext)
    
    const session = sessions.find(session => session.id === sessionNumber);
    
    if (Number.isNaN(sessionNumber) || sessionNumber < 1 || sessionNumber > TOTAL_SESSIONS) {
        return <Navigate to='/404' replace /> 
    }
    return (
        <>
            {session.isBlocked ?
                <BlockedSession />
                :
                <div className='session'>
                    <p className='session__number'>{`Sesión #${session.id}`}</p>
                    <h1 className='session__title'>{session.title}</h1>
                    <img className='session__image' src={session.img} alt='Imagen de la sesión' />
                    <AudioPlayer src={`/session_${sessionNumber}.mp3`} />
                    <button className='session__unblock-activity'>DESBLOQUEAR ACTIVIDAD</button>
                </div>
            }
        </>
    )
}

export default Session;