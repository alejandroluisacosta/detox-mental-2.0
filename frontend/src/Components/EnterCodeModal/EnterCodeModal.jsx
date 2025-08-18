import { useState } from 'react';
import './EnterCodeModal.css'

const EnterCodeModal = ({ selectedSessionId, handleUnblockSession }) => {
    const [userInput, setUserInput] = useState('');
    const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);

    const handleInputChange = ({ target }) => {
        setUserInput(target.value.toUpperCase());
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const input = userInput.trim();
        setIsCodeIncorrect(!handleUnblockSession(selectedSessionId, input));
    }

    return (
        <form className={`enter-code-modal ${isCodeIncorrect ? 'shake' : ''}`} onSubmit={handleSubmit} onAnimationEnd={() => setIsCodeIncorrect(false)}>
            <img className="enter-code-modal__close-icon" src='/icons/close.svg' alt="Cerrar pantalla de sesión bloqueada" />
            <label htmlFor="unblock-code-input" className="enter-code-modal__title">CÓDIGO</label>
            {isCodeIncorrect && <p className='enter-code-modal__error-message'>Código incorrecto</p>}
            <input type="text" id="unblock-code-input" className="enter-code-modal__input" value={userInput} onChange={handleInputChange}/>
            <button className="enter-code-modal__button" type="submit">DESBLOQUEAR</button>
            <p className="enter-code-modal__close-text">Cerrar</p>
        </form>
    )
}

export default EnterCodeModal;