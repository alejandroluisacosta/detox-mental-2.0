import { Navigate, useParams } from 'react-router-dom';
import AudioPlayer from '../AudioPlayer/AudioPlayer'
import { sessionsData } from '../../data';
import './Session.css';

const Session = () => {
    const { sessionId } = useParams();
    const sessionNumber = Number(sessionId);
    const TOTAL_SESSIONS = 15;
    
    const session = sessionsData.find(session => session.id === sessionNumber);
    
    if (Number.isNaN(sessionNumber) || sessionNumber < 1 || sessionNumber > TOTAL_SESSIONS) {
        return <Navigate to='/404' replace /> 
    }
    
    return (
        <div className='session'>
            <h1 className='session__title'>{session.title}</h1>
            <img className='session__image' src={session.img} alt='Imagen de la sesión' />
            <p className='session__subtitle'>{session.description}</p>
            <AudioPlayer src={`/session_${sessionNumber}.mp3`} />  
        </div>
    )
}

export default Session;