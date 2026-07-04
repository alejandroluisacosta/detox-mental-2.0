import { useState, useEffect, useContext } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import AudioPlayer from '../AudioPlayer/AudioPlayer'
import './Session.css';
import { SessionsContext } from '../../Context/SessionsContext';
import BlockedSession from '../BlockedSession/BlockedSession';
import ExerciseModal from '../ExerciseModal/ExerciseModal';
import Lottie from 'lottie-react';
import unblockAnimation from './unblockAnimation/unblock_animation.json';

const Session = () => {
    const [revealSession, setRevealSession] = useState(false);
    const [openExerciseModal, setOpenExerciseModal] = useState(false);
    const [isExerciseUnblocked, setIsExerciseUnblocked] = useState(false);
    const { sessionId } = useParams();
    const sessionNumber = Number(sessionId);
    const TOTAL_SESSIONS = 15;
    const { sessions, setSessions } = useContext(SessionsContext);
    const navigate = useNavigate();
    
    const session = sessions.find(session => session.id === sessionNumber);

    useEffect(() => {
        setTimeout(() => {
            setRevealSession(true);
        }, 10)
    }, [])

    if (Number.isNaN(sessionNumber) || sessionNumber < 1 || sessionNumber > TOTAL_SESSIONS) {
        return <Navigate to='/404' replace /> 
    }

    const handleCheckAnswer = (answer) => {
        if (session.exercise.answer === answer) {
            setIsExerciseUnblocked(true);
            return true;
        }
        return false;
    }
    
    const handleUnblockExercise = () => {
        setSessions(prev => prev.map(session => {
            if (session.id === sessionNumber) {
                return {
                    ...session,
                    exercise: {
                        ...session.exercise,
                        isBlocked: false
                    }
                }
            }
            return session
        }))
        setIsExerciseUnblocked(false);
    }

    return (
        <>
            {session.isBlocked ?
                <BlockedSession />
                :
                <div className={`session ${revealSession ? "fade-in" : ""}`}>
                    {openExerciseModal && <ExerciseModal 
                        setOpenExerciseModal={setOpenExerciseModal} 
                        exercise={session.exercise} 
                        exerciseId={sessionId} 
                        handleCheckAnswer={handleCheckAnswer}
                    />}
                    {isExerciseUnblocked &&
                        <div className='animation-overlay animation-overlay--unblock-exercise'>
                            <Lottie
                                className='unblock-exercise-animation'
                                animationData={unblockAnimation}
                                loop={false}
                                onComplete={() => handleUnblockExercise()}
                                />
                        </div>
                    }
                    <img className='session__go-back' src='/images/arrow_back.svg' alt='Ir atrás' onClick={() => navigate('/course')} />
                    <p className='session__number'>{`Sesión #${session.id}`}</p>
                    <h1 className='session__title'>{session.title}</h1>
                    <img className='session__image' src={session.img} alt='Imagen de la sesión' />
                    <AudioPlayer src={`/session_${sessionNumber}.mp3`} />
                    <button className='session__unblock-activity' onClick={() => setOpenExerciseModal(true)}>
                        <img src="/icons/lock.svg" alt="Ícono de candado" className="session__lock-icon" />
                        EJERCICIO DE LA SESION
                    </button>
                </div>
            }
        </>
    )
}

export default Session;