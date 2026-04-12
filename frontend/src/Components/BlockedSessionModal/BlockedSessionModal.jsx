import { useState } from 'react';
import './BlockedSessionModal.css';
import EnterCodeModal from '../EnterCodeModal/EnterCodeModal';
import ComingSoonModal from '../ComingSoonModal/ComingSoonModal';
import CloseIcon from '../CloseIcon/CloseIcon';
import { codes } from '../../data';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';

const BlockedSessionModal = ({ setOpenBlockedSessionModal, setIsSessionUnblocked, selectedSession, setSessions }) => {
    const [openEnterCodeModal, setOpenEnterCodeModal] = useState(false);
    const [openComingSoonModal,  setOpenComingSoonModal] = useState(false);

    const handleCloseBlockedSessionModal = () => { setOpenBlockedSessionModal(false) }

    const handleUnblockSession = async (id, code) => {
        if (codes[selectedSession.id] !== code) {
            return false;
        }
        setSessions((prev) =>
            prev.map((session) => {
                if (session.id === id) {
                    return { ...session, isBlocked: false };
                }
                return session;
            }),
        );
        setOpenBlockedSessionModal(false);
        setIsSessionUnblocked(true);
        try {
            const res = await apiFetch('/auth/me/unblocked-sessions', {
                method: 'POST',
                body: { sessionId: id },
            });
            if (!res.ok) throw new Error('save failed');
        } catch (err) {
            console.error('[unblock-session]', err);
            emitToast('No se pudo guardar el desbloqueo. Inténtalo de nuevo.');
        }
        return true;
    };

    return (    
        <>
            {openEnterCodeModal && 
            <div className='modal-overlay modal-overlay--layer-2'>
                <EnterCodeModal selectedSessionId={selectedSession.id} handleUnblockSession={handleUnblockSession} setOpenEnterCodeModal={setOpenEnterCodeModal}/>
            </div>}
            {openComingSoonModal && (
                <div
                    className="blocked-session-modal__coming-soon-backdrop"
                    onClick={() => setOpenComingSoonModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <ComingSoonModal setOpenComingSoonModal={setOpenComingSoonModal}/>
                    </div>
                </div>
            )}
            <div
                className='modal-overlay'
                onClick={(e) => { if (e.target === e.currentTarget) setOpenBlockedSessionModal(false) }}
            >
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