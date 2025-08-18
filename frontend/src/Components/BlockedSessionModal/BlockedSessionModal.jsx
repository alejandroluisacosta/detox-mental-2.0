import './BlockedSessionModal.css';
import EnterCodeModal from '../EnterCodeModal/EnterCodeModal';

const BlockedSessionModal = ({ setOpenBlockedSessionModal, selectedSession, setSessions }) => {
    const handleCloseBlockedSessionModal = () => { setOpenBlockedSessionModal(false) }

    const handleUnblockSession = (id, code) => {
        setSessions(prev => prev.map(session => {
            let returnValue = {...session}
            if (session.id === id) {
                returnValue.isBlocked = false;
            }
            return returnValue;
            }))
        setOpenBlockedSessionModal(false);
    }

    return (
        <>
            <EnterCodeModal />
            <div className="blocked-session-modal">
                <img className="blocked-session-modal__close" src='/icons/close.svg' onClick={handleCloseBlockedSessionModal} alt="Cerrar pantalla de sesión bloqueada" />
                <h3 className="blocked-session-modal__title">Desbloquear sesión #{selectedSession ? selectedSession.id : 0}</h3>
                <p className="blocked-session-modal__text">Opción 1 (Gratis):</p>
                <p className="blocked-session-modal__text">Escríbenos a <strong>pensamientosqueatormentan@gmail.com</strong> respondiéndo a la siguiente pregunta:</p>
                <p className="blocked-session-modal__text">{selectedSession ? selectedSession.unblockQuestion : 0}</p>
                <p className="blocked-session-modal__text">Nuestro equipo te dará un código para desbloquear esta sesión.</p>
                <button className="blocked-session-modal__button" onClick={() => handleUnblockSession(selectedSession.id)}>YA TENGO EL CÓDIGO</button>
                <hr className="blocked-session-modal__line"/>
                <p className="blocked-session-modal__text">Opción 2: Compra el curso completo en Hotmart por 10€</p>
                <button className="blocked-session-modal__button">COMPRAR</button>
                <p className="blocked-session-modal__more-info">¿Qué es Hotmart?</p>
                <p className="blocked-session-modal__close-text" onClick={handleCloseBlockedSessionModal}>Cerrar</p>
                
            </div>
        </>
    )
}

export default BlockedSessionModal;