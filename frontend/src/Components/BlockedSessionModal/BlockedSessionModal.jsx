import './BlockedSessionModal.css';

const BlockedSessionModal = () => {
    return (
        <div className="blocked-session-modal">
            <img className="blocked-session-modal__close" src='/icons/close.svg' alt="Cerrar pantalla de sesión bloqueada" />
            <h3 className="blocked-session-modal__title">Desbloquear sesión #4</h3>
            <p className="blocked-session-modal__text">Opción 1 (Gratis):</p>
            <p className="blocked-session-modal__text">Escríbenos a <strong>pensamientosqueatormentan@gmail.com</strong> respondiéndo a la siguiente pregunta:</p>
            <p className="blocked-session-modal__text">Describe en <strong>menos de 300 palabras</strong> los pensamientos que te atormentan / sabotean actualmente.</p>
            <p className="blocked-session-modal__text">Nuestro equipo te dará un código para desbloquear esta sesión.</p>
            <button className="blocked-session-modal__button">YA TENGO EL CÓDIGO</button>
            <hr className="blocked-session-modal__line"/>
            <p className="blocked-session-modal__text">Opción 2: Compra el curso completo en Hotmart por 10€</p>
            <button className="blocked-session-modal__button">COMPRAR</button>
            <p className="blocked-session-modal__more-info">¿Qué es Hotmart?</p>
            <p className="blocked-session-modal__close-text">Cerrar</p>
            
        </div>
    )
}

export default BlockedSessionModal;