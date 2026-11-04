import { Link } from 'react-router-dom';
import CompassIcon from '../CompassIcon/CompassIcon.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './CompassNudge.css';

/** Invitation to fill Compass, shown on the summary page while it is empty. */
const CompassNudge = ({ onDismiss }) => {
  const { t } = useLocale();
  return (
    <aside className="compass-nudge" aria-labelledby="compass-nudge-title">
      <div className="compass-nudge__header">
        <span className="compass-nudge__badge">
          <CompassIcon />
        </span>
        <h2 id="compass-nudge-title" className="compass-nudge__title">
          {t('summary.nudgeTitle')}
        </h2>
      </div>
      <p className="compass-nudge__body">{t('summary.nudgeBody')}</p>
      <div className="compass-nudge__actions">
        <Link to="/journal/compass" className="compass-nudge__open">
          {t('summary.nudgeOpen')}
        </Link>
        <button type="button" className="compass-nudge__later" onClick={onDismiss}>
          {t('summary.nudgeLater')}
        </button>
      </div>
    </aside>
  );
};

export default CompassNudge;
