import { useState } from 'react';
import './BlockedSessionModal.css';
import EnterCodeModal from '../EnterCodeModal/EnterCodeModal';
import ComingSoonModal from '../ComingSoonModal/ComingSoonModal';
import CloseIcon from '../CloseIcon/CloseIcon';
import { codes } from '../../data';

const BlockedSessionModal = ({ setOpenBlockedSessionModal, setIsSessionUnblocked, selectedSession, setSessions }) => {
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
            setIsSessionUnblocked(true);
            return true;
        } else {
            return false;
        }
    }

    return (    
        <>
            {openEnterCodeModal && 
            <div className='modal-overlay modal-overlay--layer-2'>
                <EnterCodeModal selectedSessionId={selectedSession.id} handleUnblockSession={handleUnblockSession} setOpenEnterCodeModal={setOpenEnterCodeModal}/>
            </div>}
            {openComingSoonModal && <ComingSoonModal setOpenComingSoonModal={setOpenComingSoonModal}/>}
            <div className='modal-overlay'>
                <div className="blocked-session-modal modal-fade-in">
                    <CloseIcon handleCloseModal={handleCloseBlockedSessionModal} />
                    <h3 className="blocked-session-modal__title">Desbloquear sesión #{selectedSession ? selectedSession.id : 0}</h3>
                    <p className="blocked-session-modal__text"><strong>Compra el curso completo</strong> (15 sesiones + 15 ejercicios) por 15€</p>
                    <button className="blocked-session-modal__button" onClick={() => setOpenComingSoonModal(true)}>COMPRAR</button>
                    <hr className="blocked-session-modal__line"/>
                    <p className="blocked-session-modal__text">Alternativa gratis:</p>
                    <p className="blocked-session-modal__text">Escríbenos a <strong>detoxmental4@gmail.com</strong> respondiéndo a la siguiente pregunta:</p>
                    <p className="blocked-session-modal__text blocked-session-modal__text--question">{selectedSession ? selectedSession.unblockQuestion : 0}</p>
                    <p className="blocked-session-modal__text">Nuestro equipo te dará un código para desbloquear esta sesión.</p>
                    <button className="blocked-session-modal__button blocked-session-modal__button--buy" onClick={() => setOpenEnterCodeModal(true)}>YA TENGO EL CÓDIGO</button>
                    <span className="blocked-session-modal__close-text" onClick={handleCloseBlockedSessionModal}>Cerrar</span>
                </div>
            </div>
        </>
    )
}

export default BlockedSessionModal;