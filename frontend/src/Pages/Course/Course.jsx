import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import './Course.css';
import BlockedSessionModal from '../../Components/BlockedSessionModal/BlockedSessionModal';
import { sessionsData } from '../../data';


const Course = () => {
    const [openBlockedSessionModal, setOpenBlockedSessionModal] = useState(false);
    const [sessions, setSessions] = useState(sessionsData);
    const selectedSession = useRef(null);
    const navigate = useNavigate();

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
            <h1 className='sessions-title'>Detox Mental</h1>
            <p className='sessions-subtitle'>30 días para limpiar tu mente</p>
            <div className="sessions-container">
                {sessions.map((session, index) => (
                    <div key={index} className='session' onClick={() => handleGoToSession(session.id)}>
                        {session.isBlocked && <div className='session__blocked-layer'></div>}
                        <img src={session.img} className='session__image' alt={`Imagen de lección ${session.id}`}/>
                        <h2 className='session__header'>{`Sesión ${session.id}:`}</h2>
                        <h2 className='session__title'>{session.title}</h2>
                        <p className='session__description'>{session.description}</p>
                        <button className={`session__button${session.isBlocked ? ' session__button--blocked' : ''}`}>{session.isBlocked ? 'DESBLOQUEAR' : 'ESCUCHAR'}</button>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default Course;