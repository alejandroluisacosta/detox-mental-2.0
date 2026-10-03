import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './BlockedSession.css'

const BlockedSession = () => {
    const navigate = useNavigate();
    const { t } = useLocale();

    return (
        <div className="blocked-session">
            <h2 className="blocked-session__title">{t('session.blockedTitle')}</h2>
            <p className="blocked-session__text">{t('session.blockedCheat')}</p>
            <img className="blocked-session__image" src='/images/skeptical.webp' alt={t('session.blockedImageAlt')}/>
            <p className="blocked-session__text">{t('session.blockedQuote')}</p>
            <p className="blocked-session__text">{t('session.blockedOtherWays')}</p>
            <p className="blocked-session__text">{t('session.blockedTryHarder')}</p>
            <button className="blocked-session__button" onClick={() => navigate('/course')}>{t('session.backToCourse')}</button>
        </div>
    )
}

export default BlockedSession;
