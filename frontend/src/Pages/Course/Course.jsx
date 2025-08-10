import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import { Navigate } from 'react';
import './Course.css';
import BlockedSessionModal from '../../Components/BlockedSessionModal/BlockedSessionModal';

const originalSessions = [
    {id: 1,title: 'Tú no eres tu mente', description: 'Y aceptarlo es el primer paso', img: '/images/socrates.jpg', isBlocked: false, unblockQuestion: null,},
    {id: 2,title: 'Cómo funcionan los pensamientos', description: 'Pista: nadie lo sabe', img: '/images/plato.webp', isBlocked: false, unblockQuestion: null,},
    {id: 3,title: 'El gimnasio de la mente', description: 'La vía rápida del Detox Mental', img: '/images/aristotle.webp', isBlocked: false, unblockQuestion: null,},
    {id: 4,title: 'Los pensamientos son inofensivos', description: 'Aunque no lo creas', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
]

const Course = () => {
    const [openModal, setOpenModal] = useState(true);
    const [sessions, setSessions] = useState([...originalSessions]);
    const selectedSession = useRef(null);
    const navigate = useNavigate();

    const handleGoToSession = (id) => {
        const sessionToOpen = sessions.find(session => session.id === id);
        if (sessionToOpen.isBlocked) {
            console.log('hayu')
            setOpenModal(true);
            selectedSession.current = sessionToOpen;
        } else {
            console.log('hey');
            <Navigate to={`${sessionToOpen.id}`} />
        }
    }

    const isSessionBlocked = (isBlocked) => {
        if (isBlocked) {
            return { backgroundColor: 'black' };
        }
        return {};
    }

    return (
        <div className='sessions-page'>
            {openModal && <BlockedSessionModal setOpenModal={setOpenModal} setSessions={setSessions} selectedSession={selectedSession.current}/>}
            <h1 className='sessions-title'>Detox Mental</h1>
            <p className='sessions-subtitle'>30 días para limpiar tu mente</p>
            <div className="sessions-container">
                {sessions.map((session, index) => (
                    <div key={index} className='session' onClick={() => handleGoToSession(session.id)} style={isSessionBlocked(session.isBlocked)}>
                        <img src={session.img} className='session__image' alt={`Imagen de lección ${session.id}`}/>
                        <h2 className='session__header'>{`Sesión ${session.id}:`}</h2>
                        <h2 className='session__title'>{session.title}</h2>
                        <p className='session__description'>{session.description}</p>
                        <button className='session__button'>ESCUCHAR</button>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default Course;