import './UnblockSessionModal.css'

const UnblockSessionmodal = () => {
    return (
        <div className="unblock-session-modal">
            <img className="unblock-session-modal__close-icon" src='/icons/close.svg' alt="Cerrar pantalla de sesión bloqueada" />
            <label for="unblock-code-input" className="unblock-session-modal__title">CÓDIGO</label>
            <input type="text" id="unblock-code-input" className="unblock-session-modal__input" />
            <button className="unblock-session-modal__button">DESBLOQUEAR</button>
            <p className="unblock-session-modal__close-text">Cerrar</p>
        </div>
    )
}

export default UnblockSessionmodal;