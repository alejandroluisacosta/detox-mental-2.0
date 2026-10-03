import { useState, useEffect, useContext } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import AudioPlayer from '../AudioPlayer/AudioPlayer'
import './Session.css';
import { SessionsContext } from '../../Context/SessionsContext';
import { useLocale } from '../../Context/LocaleContext.jsx';
import BlockedSession from '../BlockedSession/BlockedSession';
import ExerciseModal from '../ExerciseModal/ExerciseModal';
import Lottie from 'lottie-react';
import unblockAnimation from './unblockAnimation/unblock_animation.json';
import { answersMatch } from '../../utils/exerciseAnswers.js';
import { getSessionAudioSrc } from '../../data/content/index.js';

const Session = () => {
    const [revealSession, setRevealSession] = useState(false);
    const [openExerciseModal, setOpenExerciseModal] = useState(false);
    const [isExerciseUnblocked, setIsExerciseUnblocked] = useState(false);
    const { sessionId } = useParams();
    const sessionNumber = Number(sessionId);
    const TOTAL_SESSIONS = 15;
    const { sessions, setSessions } = useContext(SessionsContext);
    const navigate = useNavigate();
    const { locale, t } = useLocale();
    
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
        if (answersMatch(session.exercise.answers, answer)) {
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
                    <img className='session__go-back' src='/images/arrow_back.svg' alt={t('session.backAlt')} onClick={() => navigate('/course')} />
                    <p className='session__number'>{t('session.number', { id: session.id })}</p>
                    <h1 className='session__title'>{session.title}</h1>
                    <img className='session__image' src={session.img} alt={t('session.imageAlt')} />
                    <AudioPlayer src={getSessionAudioSrc(sessionNumber, locale)} />
                    <button className='session__unblock-activity' onClick={() => setOpenExerciseModal(true)}>
                        <img src="/icons/lock.svg" alt={t('session.lockAlt')} className="session__lock-icon" />
                        {t('session.exercise')}
                    </button>
                </div>
            }
        </>
    )
}

export default Session;
