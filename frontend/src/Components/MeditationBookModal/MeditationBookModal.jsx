import { useEffect, useId, useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './MeditationBookModal.css';

const MeditationBookModal = ({
  title = '',
  authorName = '',
  introduction = '',
  status = 'ready',
  saving = false,
  onClose,
  onSave,
}) => {
  const { t } = useLocale();
  const headingId = useId();
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftAuthorName, setDraftAuthorName] = useState(authorName);
  const [draftIntroduction, setDraftIntroduction] = useState(introduction);

  useEffect(() => {
    setDraftTitle(title);
    setDraftAuthorName(authorName);
    setDraftIntroduction(introduction);
  }, [authorName, introduction, title]);

  const trimmedTitle = draftTitle.trim();
  const trimmedAuthorName = draftAuthorName.trim();
  const trimmedIntroduction = draftIntroduction.trim();

  const isDirty =
    trimmedTitle !== title.trim() ||
    trimmedAuthorName !== authorName.trim() ||
    trimmedIntroduction !== introduction.trim();

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape' || saving) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  const handleSave = () => {
    if (saving || !isDirty) return;

    const patch = {};
    if (trimmedTitle !== title.trim()) patch.title = trimmedTitle;
    if (trimmedAuthorName !== authorName.trim()) patch.authorName = trimmedAuthorName;
    if (trimmedIntroduction !== introduction.trim()) patch.introduction = trimmedIntroduction;
    onSave?.(patch);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        className="meditation-book-modal modal-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <CloseIcon handleCloseModal={handleClose} />
        <h2 id={headingId} className="meditation-book-modal__title">
          {t('meditations.bookModalTitle')}
        </h2>
        {status === 'loading' ? <p>{t('meditations.frontMatterLoading')}</p> : null}
        {status === 'error' ? (
          <p role="alert">{t('meditations.frontMatterLoadFailed')}</p>
        ) : null}
        {status === 'ready' ? (
          <>
            <label className="meditation-book-modal__field">
              <span className="meditation-book-modal__label">{t('meditations.bookTitleLabel')}</span>
              <input
                type="text"
                className="meditation-book-modal__input"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                disabled={saving}
              />
            </label>
            <label className="meditation-book-modal__field">
              <span className="meditation-book-modal__label">{t('meditations.bookAuthorLabel')}</span>
              <input
                type="text"
                className="meditation-book-modal__input"
                value={draftAuthorName}
                onChange={(event) => setDraftAuthorName(event.target.value)}
                disabled={saving}
              />
            </label>
            <h3 className="meditation-book-modal__section-heading">
              {t('meditations.introductionHeading')}
            </h3>
            <textarea
              className="meditation-book-modal__text"
              value={draftIntroduction}
              onChange={(event) => setDraftIntroduction(event.target.value)}
              aria-label={t('meditations.introductionLabel')}
              placeholder={t('meditations.introductionPlaceholder')}
              disabled={saving}
            />
            <button
              type="button"
              className="meditation-book-modal__save"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving
                ? t('meditations.introductionSaving')
                : t('meditations.introductionSave')}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MeditationBookModal;
