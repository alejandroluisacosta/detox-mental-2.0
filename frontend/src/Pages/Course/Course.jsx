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
    {id: 5,title: 'Sufrimiento imaginario', description: 'El tormento del ser humano', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
    {id: 6,title: 'Emoción + Pensamiento', description: 'La clave. El truco. El secreto', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
    {id: 7,title: 'La utilidad de los PQAs', description: 'Y no lo dudes: la tienen', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
    {id: 8,title: 'La raíz de tus PQSs', description: '"Emoción atendida, emoción superada"', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
    {id: 9,title: 'Cómo se mata un pensamiento', description: 'Aprende a asesinarlos sin piedad', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
    {id: 10,title: 'Quietud', description: 'Aprende a reconocer tus PQSs', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
    {id: 11,title: 'Meditar sin meditar', description: '8 herramientas para tu salud mental', img: '/images/marcus.jpg', isBlocked: true, unblockQuestion: 'Describe en menos de 300 palabras los pensamientos que te atormentan / sabotean actualmente.'},
]

const Course = () => {
    const [openModal, setOpenModal] = useState(false);
    const [sessions, setSessions] = useState([...originalSessions]);
    const selectedSession = useRef(null);
    const navigate = useNavigate();

    const handleGoToSession = (id) => {
        const sessionToOpen = sessions.find(session => session.id === id);
        if (sessionToOpen.isBlocked) {
            setOpenModal(true);
            selectedSession.current = sessionToOpen;
        } else {
            <Navigate to={`${sessionToOpen.id}`} />
        }
    }

    return (
        <div className='sessions-page'>
            {openModal && <BlockedSessionModal setOpenModal={setOpenModal} setSessions={setSessions} selectedSession={selectedSession.current}/>}
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