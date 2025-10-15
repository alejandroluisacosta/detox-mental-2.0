import { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import './Course.css';
import BlockedSessionModal from '../../Components/BlockedSessionModal/BlockedSessionModal';
import { SessionsContext } from '../../Context/SessionsContext';
import SessionCard from '../../Components/SessionCard/SessionCard';
import Navigation from '../../Components/Navigation/Navigation';


const Course = () => {
    const [openBlockedSessionModal, setOpenBlockedSessionModal] = useState(false);
    const selectedSession = useRef(null);
    const navigate = useNavigate();
    const { sessions, setSessions } = useContext(SessionsContext)

    const handleGoToSession = (id) => {
        const sessionToOpen = sessions.find(session => session.id === id);
        if (sessionToOpen.isBlocked) {
            setOpenBlockedSessionModal(true);
            selectedSession.current = sessionToOpen;
        } else {
            navigate(`/session/${sessionToOpen.id}`);
        }
    }
    return (
        <div className='sessions-page'>
          {openBlockedSessionModal && <BlockedSessionModal setOpenBlockedSessionModal={setOpenBlockedSessionModal} setSessions={setSessions} selectedSession={selectedSession.current}/>}
          <div className='animation-overlay'>
              <video
                  src="/animations/unblock_animation.webm"
                  autoPlay
                  muted
                  playsInline
                  className="session-unblock-animation"
              />
          </div>
            <Navigation />
            <h1 className='sessions-title'>Detox Mental</h1>
            <p className='sessions-subtitle'>30 días para limpiar tu mente</p>
            <div className="sessions-container">
                {sessions.map((session, index) => (
                    <SessionCard session={session} key={index} handleGoToSession={handleGoToSession}/>
                ))}
            </div>
            <p className="course-credits">Creado con compromiso por Detox Mental™ • 2025</p>
        </div>
    )
}

export default Course;