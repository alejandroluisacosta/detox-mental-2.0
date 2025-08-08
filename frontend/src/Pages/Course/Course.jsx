import { useNavigate } from 'react-router-dom'
import './Course.css';
import BlockedSessionModal from '../../Components/BlockedSessionModal/BlockedSessionModal';

const sessions = [
    {title: 'Tú no eres tu mente', description: 'Y aceptarlo es el primer paso', img: '/images/socrates.jpg'},
    {title: 'Cómo funcionan los pensamientos', description: 'Pista: nadie lo sabe', img: '/images/plato.webp'},
    {title: 'El gimnasio de la mente', description: 'La vía rápida del Detox Mental', img: '/images/aristotle.webp'},
    {title: 'Los pensamientos son inofensivos', description: 'Aunque no lo creas', img: '/images/marcus.jpg'},
]

const Course = () => {
    const navigate = useNavigate();

    return (
        <div className='sessions-page'>
            <BlockedSessionModal />
            <h1 className='sessions-title'>Detox Mental</h1>
            <p className='sessions-subtitle'>30 días para limpiar tu mente</p>
            <div className="sessions-container">
                {sessions.map((session, index) => (
                    <div key={index} className='session' onClick={() => navigate(`/session/${index + 1}`)}>
                        <img src={session.img} className='session__image' alt={`Imagen de lección ${index + 1}`}/>
                        <h2 className='session__header'>{`Sesión ${index + 1}:`}</h2>
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