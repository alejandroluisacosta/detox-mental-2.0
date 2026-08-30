import { useEffect, useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { MAX_TOPIC_NAME_LENGTH } from '../../data/journalTopics.js';
import { validateTopicName } from '../../utils/journalTopicName.js';
import './JournalTopicNameModal.css';

const JournalTopicNameModal = ({
  title,
  initialName = '',
  submitLabel,
  existingNames = [],
  onClose,
  onSave,
  saving,
}) => {
  const { t } = useLocale();
  const [name, setName] = useState(initialName);
  const [errorKey, setErrorKey] = useState('');

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape' || saving) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;

    const result = validateTopicName({ name, existingNames });
    if (!result.valid) {
      setErrorKey(result.messageKey);
      return;
    }

    setErrorKey('');
    onSave(result.name);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="journal-topic-name-modal modal-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-topic-name-modal-title"
      >
        <CloseIcon handleCloseModal={handleClose} />
        <h2
          id="journal-topic-name-modal-title"
          className="journal-topic-name-modal__title"
        >
          {title}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="journal-topic-name-modal__field">
            <label
              htmlFor="journal-topic-name-input"
              className="journal-topic-name-modal__label"
            >
              {t('journal.topicNameLabel')}
            </label>
            <input
              id="journal-topic-name-input"
              className="journal-topic-name-modal__input"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errorKey) setErrorKey('');
              }}
              placeholder={t('journal.topicNamePlaceholder')}
              maxLength={MAX_TOPIC_NAME_LENGTH}
              autoFocus
              disabled={saving}
              autoComplete="off"
            />
          </div>
          {errorKey ? (
            <p className="journal-topic-name-modal__error" role="alert">
              {t(errorKey, { max: MAX_TOPIC_NAME_LENGTH })}
            </p>
          ) : null}
          <button
            type="submit"
            className="journal-topic-name-modal__button"
            disabled={saving}
          >
            {saving ? t('journal.topicSaving') : submitLabel}
          </button>
          <button
            type="button"
            className="journal-topic-name-modal__button journal-topic-name-modal__button--secondary"
            onClick={handleClose}
            disabled={saving}
          >
            {t('journal.cancel')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JournalTopicNameModal;
