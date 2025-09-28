import { useState } from 'react';
import './BlockedSessionModal.css';
import EnterCodeModal from '../EnterCodeModal/EnterCodeModal';
import ComingSoonModal from '../ComingSoonModal/ComingSoonModal';
import CloseIcon from '../CloseIcon/CloseIcon';
import { codes } from '../../data';

const BlockedSessionModal = ({ setOpenBlockedSessionModal, selectedSession, setSessions }) => {
    const [openEnterCodeModal, setOpenEnterCodeModal] = useState(false);
    const [openComingSoonModal,  setOpenComingSoonModal] = useState(false);

    const handleCloseBlockedSessionModal = () => { setOpenBlockedSessionModal(false) }

    const handleUnblockSession = (id, code) => {
        if (codes[selectedSession.id] === code) {
            setSessions(prev => prev.map(session => {
                let returnValue = {...session}
                if (session.id === id && codes[selectedSession.id] === code) {
                    returnValue.isBlocked = false;
                }
                return returnValue;
                }))
            setOpenBlockedSessionModal(false);
            return true;
        } else {
            return false;
        }
    }

    return (    
        <>
            {openEnterCodeModal && <EnterCodeModal selectedSessionId={selectedSession.id} handleUnblockSession={handleUnblockSession} setOpenEnterCodeModal={setOpenEnterCodeModal}/>}
            {openComingSoonModal && <ComingSoonModal setOpenComingSoonModal={setOpenComingSoonModal}/>}
            <div className="blocked-session-modal modal-fade-in">
                <CloseIcon handleCloseModal={handleCloseBlockedSessionModal} />
                <h3 className="blocked-session-modal__title">Desbloquear sesión #{selectedSession ? selectedSession.id : 0}</h3>
                <p className="blocked-session-modal__text">Opción 1 (Gratis):</p>
                <p className="blocked-session-modal__text">Escríbenos a <strong>detoxmental4@gmail.com</strong> respondiéndo a la siguiente pregunta:</p>
                <p className="blocked-session-modal__text blocked-session-modal__text--question">{selectedSession ? selectedSession.unblockQuestion : 0}</p>
                <p className="blocked-session-modal__text">Nuestro equipo te dará un código para desbloquear esta sesión.</p>
                <button className="blocked-session-modal__button" onClick={() => setOpenEnterCodeModal(true)}>YA TENGO EL CÓDIGO</button>
                <hr className="blocked-session-modal__line"/>
                <p className="blocked-session-modal__text">Opción 2: Compra el curso completo (15 sesiones + 15 ejercicios) por 10€</p>
                <button className="blocked-session-modal__button blocked-session-modal__button--buy" onClick={() => setOpenComingSoonModal(true)}>COMPRAR</button>
                <span className="blocked-session-modal__close-text" onClick={handleCloseBlockedSessionModal}>Cerrar</span>
            </div>
        </>
    )
}

export default BlockedSessionModal;