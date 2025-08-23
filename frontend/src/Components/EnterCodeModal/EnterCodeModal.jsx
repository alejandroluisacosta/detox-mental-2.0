import { useState } from 'react';
import './EnterCodeModal.css'

const EnterCodeModal = ({ selectedSessionId, handleUnblockSession }) => {
    const [userInput, setUserInput] = useState('');
    const [errorCount, setErrorCount] = useState(0);

    const handleInputChange = ({ target }) => {
        setUserInput(target.value.toUpperCase());
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const input = userInput.trim();
        const success = handleUnblockSession(selectedSessionId, input);
        if (!success)
            setErrorCount(count => count + 1);
    }

    const formClass = [
        'enter-code-modal',
        errorCount > 0 && 'enter-code-modal--incorrect-code',
        errorCount > 0 && 'shake'
    ].filter(Boolean).join(' ');

    return (
        <form className={formClass} onSubmit={handleSubmit} key={errorCount} >
            <img className="enter-code-modal__close-icon" src='/icons/close.svg' alt="Cerrar pantalla de sesión bloqueada" />
            <label htmlFor="unblock-code-input" className="enter-code-modal__title">CÓDIGO</label>
            {errorCount > 0 && <p className='enter-code-modal__error-message' role='alert' aria-live='assertive'>Código incorrecto</p>}
            <input type="text" id="unblock-code-input" className="enter-code-modal__input" value={userInput} onChange={handleInputChange}/>
            <button className="enter-code-modal__button" type="submit">DESBLOQUEAR</button>
            <p className="enter-code-modal__close-text">Cerrar</p>
        </form>
    )
}

export default EnterCodeModal;