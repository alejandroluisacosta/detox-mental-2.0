import { useEffect, useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { useJournalTopics } from '../../Context/JournalTopicsContext.jsx';
import { MAX_JOURNAL_TOPICS } from '../../data/journalTopics.js';
import './JournalTopicsModal.css';

const JournalTopicsModal = ({ initialTopics, onClose, onSave, saving }) => {
  const { t, topicLabel } = useLocale();
  const { allTopics } = useJournalTopics();
  const [selectedTopics, setSelectedTopics] = useState(() =>
    Array.isArray(initialTopics) ? [...initialTopics] : [],
  );
  const topicLimitReached = selectedTopics.length >= MAX_JOURNAL_TOPICS;

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

  const toggleTopic = (topic) => {
    if (saving) return;
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((item) => item !== topic);
      }
      if (prev.length >= MAX_JOURNAL_TOPICS) return prev;
      return [...prev, topic];
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="journal-topics-modal modal-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-topics-modal-title"
      >
        <CloseIcon handleCloseModal={handleClose} />
        <h2 id="journal-topics-modal-title" className="journal-topics-modal__title">
          {t('history.topicsTitle')}
        </h2>
        <p className="journal-topics-modal__text">
          {t('history.topicsHint', { max: MAX_JOURNAL_TOPICS })}
        </p>
        <div
          className="journal-topics-modal__topics"
          role="group"
          aria-label={t('journal.topicsLabel')}
        >
          {allTopics.map((topic) => {
            const selected = selectedTopics.includes(topic);
            const disabled = saving || (!selected && topicLimitReached);
            return (
              <button
                key={topic}
                type="button"
                className={`journal-topics-modal__topic-chip${
                  selected ? ' journal-topics-modal__topic-chip--selected' : ''
                }`}
                onClick={() => toggleTopic(topic)}
                disabled={disabled}
                aria-pressed={selected}
              >
                {topicLabel(topic)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="journal-topics-modal__button"
          onClick={() => onSave(selectedTopics)}
          disabled={saving}
        >
          {saving ? t('history.topicsSaving') : t('history.topicsSave')}
        </button>
        <button
          type="button"
          className="journal-topics-modal__button journal-topics-modal__button--secondary"
          onClick={handleClose}
          disabled={saving}
        >
          {t('history.cancel')}
        </button>
      </div>
    </div>
  );
};

export default JournalTopicsModal;
