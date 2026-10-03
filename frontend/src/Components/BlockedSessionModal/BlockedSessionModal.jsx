import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlockedSessionModal.css';
import EnterCodeModal from '../EnterCodeModal/EnterCodeModal';
import CloseIcon from '../CloseIcon/CloseIcon';
import { codes } from '../../data';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';

const BlockedSessionModal = ({ setOpenBlockedSessionModal, setIsSessionUnblocked, selectedSession, setSessions }) => {
    const navigate = useNavigate();
    const { user, status } = useAuth();
    const { t } = useLocale();
    const [openEnterCodeModal, setOpenEnterCodeModal] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

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
        if (user) {
            try {
                const res = await apiFetch('/auth/me/unblocked-sessions', {
                    method: 'POST',
                    body: { sessionId: id },
                });
                if (!res.ok) throw new Error('save failed');
            } catch (err) {
                console.error('[unblock-session]', err);
                emitToast(t('session.unlockSaveFailed'));
            }
        }
        return true;
    };

    const handlePurchase = async () => {
        if (status === 'loading' || checkoutLoading) {
            return;
        }

        if (!user) {
            emitToast(t('session.loginToBuy'));
            setOpenBlockedSessionModal(false);
            navigate('/login');
            return;
        }

        setCheckoutLoading(true);
        try {
            const res = await apiFetch('/stripe/create-checkout-session', {
                method: 'POST',
                body: {},
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.url) {
                throw new Error('checkout session failed');
            }
            window.location.assign(data.url);
        } catch (err) {
            console.error('[stripe/checkout]', err);
            emitToast(t('session.checkoutFailed'));
            setCheckoutLoading(false);
        }
    };

    return (    
        <>
            {openEnterCodeModal && 
            <div className='modal-overlay modal-overlay--layer-2'>
                <EnterCodeModal selectedSessionId={selectedSession.id} handleUnblockSession={handleUnblockSession} setOpenEnterCodeModal={setOpenEnterCodeModal}/>
            </div>}
            <div
                className='modal-overlay'
                onClick={(e) => { if (e.target === e.currentTarget) setOpenBlockedSessionModal(false) }}
            >
                <div className="blocked-session-modal modal-fade-in">
                    <CloseIcon handleCloseModal={handleCloseBlockedSessionModal} />
                    <h3 className="blocked-session-modal__title">{t('session.unlockTitle', { id: selectedSession ? selectedSession.id : 0 })}</h3>
                    <p className="blocked-session-modal__text"><strong>{t('session.buyFullCourseLead')}</strong> {t('session.buyFullCourseRest')}</p>
                    <button
                        className="blocked-session-modal__button"
                        onClick={handlePurchase}
                        disabled={status === 'loading' || checkoutLoading}
                    >
                        {checkoutLoading ? t('session.checkoutLoading') : t('session.buy')}
                    </button>
                    <hr className="blocked-session-modal__line"/>
                    <p className="blocked-session-modal__text">{t('session.freeAlternative')}</p>
                    <p className="blocked-session-modal__text">{t('session.emailQuestionBefore')} <strong>detoxmental4@gmail.com</strong> {t('session.emailQuestionAfter')}</p>
                    <p className="blocked-session-modal__text blocked-session-modal__text--question">{selectedSession ? selectedSession.unblockQuestion : 0}</p>
                    <p className="blocked-session-modal__text">{t('session.teamSendsCode')}</p>
                    <button className="blocked-session-modal__button blocked-session-modal__button--buy" onClick={() => setOpenEnterCodeModal(true)}>{t('session.haveCode')}</button>
                    <span className="blocked-session-modal__close-text" onClick={handleCloseBlockedSessionModal}>{t('session.close')}</span>
                </div>
            </div>
        </>
    )
}

export default BlockedSessionModal;