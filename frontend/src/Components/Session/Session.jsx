import { Navigate, useParams } from 'react-router-dom';
import AudioPlayer from '../AudioPlayer/AudioPlayer'

const Session = () => {
    const { session } = useParams();
    const sessionNumber = Number(session);
    const TOTAL_SESSIONS = 15;

    if (Number.isNaN(sessionNumber) || sessionNumber < 1 || sessionNumber > TOTAL_SESSIONS) {
        return <Navigate to='/404' replace /> 
    }

    return (
        <div className='session'>
            <h1 className='session__title'>Title</h1>
            <AudioPlayer src={`/session_${sessionNumber}.mp3`} />  
        </div>
    )
}

export default Session;