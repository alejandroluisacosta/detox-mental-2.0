import { useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './EnterCodeModal.css'

const EnterCodeModal = ({ selectedSessionId, handleUnblockSession, setOpenEnterCodeModal }) => {
    const [userInput, setUserInput] = useState('');
    const [errorCount, setErrorCount] = useState(0);
    const { t } = useLocale();

    const handleCloseModal = () => { setOpenEnterCodeModal(false) }

    const handleInputChange = ({ target }) => {
        setUserInput(target.value.toUpperCase());
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const input = userInput.trim();
        const success = await handleUnblockSession(selectedSessionId, input);
        if (!success)
            setErrorCount(count => count + 1);
    }

    const formClass = [
        'enter-code-modal',
        errorCount > 0 && 'modal-incorrect-code',
        errorCount > 0 && 'shake'
    ].filter(Boolean).join(' ');

    return (
        <form className={formClass} onSubmit={handleSubmit} key={errorCount} >
            <CloseIcon handleCloseModal={handleCloseModal} />
            <label htmlFor="unblock-code-input" className="enter-code-modal__title">{t('session.code')}</label>
            {errorCount > 0 && (
                <p
                    id="unblock-code-error"
                    className="enter-code-modal__error-message"
                    role="alert"
                    aria-live="assertive"
                >
                    {t('session.wrongCode')}
                </p>
            )}
            <input
                type="text"
                id="unblock-code-input"
                className="enter-code-modal__input"
                value={userInput}
                onChange={handleInputChange}
                autoComplete="off"
                spellCheck={false}
                placeholder={t('session.codePlaceholder')}
                aria-invalid={errorCount > 0}
                aria-describedby={errorCount > 0 ? 'unblock-code-error' : undefined}
            />
            <button className="enter-code-modal__button" type="submit">{t('session.unlock')}</button>
            <p className="enter-code-modal__close-text" onClick={handleCloseModal}>{t('session.close')}</p>
        </form>
    )
}

export default EnterCodeModal;
