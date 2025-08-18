import './EnterCodeModal.css'

const EnterCodeModal = () => {
    return (
        <div className="enter-code-modal">
            <img className="enter-code-modal__close-icon" src='/icons/close.svg' alt="Cerrar pantalla de sesión bloqueada" />
            <label for="unblock-code-input" className="enter-code-modal__title">CÓDIGO</label>
            <input type="text" id="unblock-code-input" className="enter-code-modal__input" />
            <button className="enter-code-modal__button">DESBLOQUEAR</button>
            <p className="enter-code-modal__close-text">Cerrar</p>
        </div>
    )
}

export default EnterCodeModal;