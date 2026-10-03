import { useEffect } from 'react';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './JournalImageSourceSheet.css';

const JournalImageSourceSheet = ({ onClose, onChooseCamera, onChooseLibrary }) => {
  const { t } = useLocale();
  const titleId = 'journal-image-source-sheet-title';

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const chooseCamera = () => {
    onChooseCamera();
    onClose();
  };

  const chooseLibrary = () => {
    onChooseLibrary();
    onClose();
  };

  return (
    <div
      className="modal-overlay journal-image-source-sheet__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="journal-image-source-sheet modal-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <p id={titleId} className="journal-image-source-sheet__title">
          {t('journal.imageSourceTitle')}
        </p>
        <div className="journal-image-source-sheet__actions">
          <button
            type="button"
            className="journal-image-source-sheet__option"
            onClick={chooseCamera}
            aria-label={t('journal.imageSourceCameraAria')}
          >
            <span
              className="journal-image-source-sheet__option-icon journal-image-source-sheet__option-icon--camera"
              aria-hidden="true"
            />
            <span className="journal-image-source-sheet__option-label">
              {t('journal.imageSourceCamera')}
            </span>
          </button>
          <button
            type="button"
            className="journal-image-source-sheet__option"
            onClick={chooseLibrary}
            aria-label={t('journal.imageSourceLibraryAria')}
          >
            <span
              className="journal-image-source-sheet__option-icon journal-image-source-sheet__option-icon--library"
              aria-hidden="true"
            />
            <span className="journal-image-source-sheet__option-label">
              {t('journal.imageSourceLibrary')}
            </span>
          </button>
        </div>
        <button
          type="button"
          className="journal-image-source-sheet__cancel"
          onClick={onClose}
        >
          {t('journal.imageSourceCancel')}
        </button>
      </div>
    </div>
  );
};

export default JournalImageSourceSheet;
