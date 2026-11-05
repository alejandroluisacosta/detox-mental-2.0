import CompassIcon from '../CompassIcon/CompassIcon.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { compassAcceptedKey, compassTagKey } from '../../utils/compass.js';
import './CompassSuggestions.css';

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const PendingCard = ({ suggestion, busy, onAccept, onEdit, onDismiss, t }) => {
  const isRemove = suggestion.action === 'remove';
  const text = isRemove ? suggestion.targetContent : suggestion.content;

  return (
    <>
      <span className="compass-suggestions__tag">{t(compassTagKey(suggestion))}</span>
      {suggestion.action === 'update' && suggestion.targetContent ? (
        <p className="compass-suggestions__replaces">
          <span className="compass-suggestions__replaces-label">
            {t('summary.compassReplaces')}
          </span>{' '}
          <span className="compass-suggestions__replaces-text">{suggestion.targetContent}</span>
        </p>
      ) : null}
      <p
        className={`compass-suggestions__text${
          isRemove ? ' compass-suggestions__text--removed' : ''
        }`}
      >
        {text}
      </p>
      <div className="compass-suggestions__actions">
        <button
          type="button"
          className="compass-suggestions__button compass-suggestions__button--fill"
          onClick={() => onAccept(suggestion)}
          disabled={busy}
        >
          {isRemove ? t('summary.compassRemove') : t('summary.compassAccept')}
        </button>
        {!isRemove ? (
          <button
            type="button"
            className="compass-suggestions__button compass-suggestions__button--line"
            onClick={() => onEdit(suggestion)}
            disabled={busy}
          >
            {t('summary.compassEdit')}
          </button>
        ) : null}
        <button
          type="button"
          className="compass-suggestions__button compass-suggestions__button--text"
          onClick={() => onDismiss(suggestion)}
          disabled={busy}
        >
          {isRemove ? t('summary.compassKeep') : t('summary.compassDismiss')}
        </button>
      </div>
    </>
  );
};

/** "For your Compass": the summary's suggestions, each pending, accepted, or dismissed. */
const CompassSuggestions = ({ suggestions, busyId, onAccept, onEdit, onDismiss }) => {
  const { t } = useLocale();
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;

  return (
    <section className="compass-suggestions" aria-labelledby="compass-suggestions-title">
      <div className="compass-suggestions__intro">
        <h2 id="compass-suggestions-title" className="compass-suggestions__heading">
          <CompassIcon className="compass-suggestions__icon" />
          {t('summary.compassHeading')}
        </h2>
        <p className="compass-suggestions__lead">{t('summary.compassLead')}</p>
      </div>
      <ul className="compass-suggestions__list">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id} className="compass-suggestions__card">
            {suggestion.status === 'accepted' ? (
              <p className="compass-suggestions__resolved" role="status">
                <span className="compass-suggestions__check">
                  <CheckIcon />
                </span>
                {t(compassAcceptedKey(suggestion.action))}
              </p>
            ) : suggestion.status === 'dismissed' ? (
              <p className="compass-suggestions__dismissed" role="status">
                {t('summary.compassDismissed')}
              </p>
            ) : (
              <PendingCard
                suggestion={suggestion}
                busy={busyId === suggestion.id}
                onAccept={onAccept}
                onEdit={onEdit}
                onDismiss={onDismiss}
                t={t}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CompassSuggestions;
