import { useNavigate } from 'react-router-dom';
import './BlockedSession.css'

const BlockedSession = () => {
    const navigate = useNavigate();

    return (
        <div className="blocked-session">
            <h2 className="blocked-session__title">Sesión bloqueada</h2>
            <p className="blocked-session__text">¿Intentando hacer trampas para escuchar la sesión?</p>
            <img className="blocked-session__image" src='/images/skeptical.webp' alt='Imagen de niño con cara escéptica'/>
            <p className="blocked-session__text">Como dijo un sabio, "hacer trampa no es necesariamente malo, pues demuestra interés e ímpetu a la hora de superar un bloqueo".</p>
            <p className="blocked-session__text">Digamos que hay otras formas de hacer trampa para ganar acceso a las sesiones bloquedadas...</p>
            <p className="blocked-session__text">Pero tendrás que esforzarte un poco más.</p>
            <button className="blocked-session__button" onClick={() => navigate('/course')}>VOLVER AL CURSO</button>
        </div>
    )
}

export default BlockedSession;