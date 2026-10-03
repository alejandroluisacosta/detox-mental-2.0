import { useEffect, useId, useMemo, useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import {
  bookTitleFieldIsDirty,
  bookTitleForField,
  bookTitlePatchFromDraft,
} from '../../utils/meditationBookTitle.js';
import './MeditationBookModal.css';

const MeditationBookModal = ({
  title = '',
  authorName = '',
  introduction = '',
  titleUsesDefault = true,
  status = 'ready',
  saving = false,
  onClose,
  onPdfAction,
}) => {
  const { t } = useLocale();
  const headingId = useId();
  const defaultTitle = t('meditations.title');
  const savedFrontMatter = useMemo(
    () => ({ title, titleUsesDefault }),
    [title, titleUsesDefault],
  );
  const [draftTitle, setDraftTitle] = useState(() =>
    bookTitleForField(savedFrontMatter, defaultTitle),
  );
  const [draftAuthorName, setDraftAuthorName] = useState(authorName);
  const [draftIntroduction, setDraftIntroduction] = useState(introduction);

  useEffect(() => {
    setDraftTitle(bookTitleForField(savedFrontMatter, defaultTitle));
    setDraftAuthorName(authorName);
    setDraftIntroduction(introduction);
  }, [authorName, defaultTitle, introduction, savedFrontMatter]);

  const trimmedAuthorName = draftAuthorName.trim();
  const trimmedIntroduction = draftIntroduction.trim();

  const isDirty =
    bookTitleFieldIsDirty(draftTitle, savedFrontMatter, defaultTitle) ||
    trimmedAuthorName !== authorName.trim() ||
    trimmedIntroduction !== introduction.trim();

  const buildPatch = () => {
    const patch = {};
    const titlePatch = bookTitlePatchFromDraft(draftTitle, savedFrontMatter, defaultTitle);
    if (titlePatch) {
      patch.title = titlePatch.title;
    }
    if (trimmedAuthorName !== authorName.trim()) {
      patch.authorName = trimmedAuthorName;
    }
    if (trimmedIntroduction !== introduction.trim()) {
      patch.introduction = trimmedIntroduction;
    }
    return patch;
  };

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

  const handlePdfClick = () => {
    if (saving) return;
    if (!isDirty) {
      onPdfAction?.(null);
      return;
    }
    const patch = buildPatch();
    if (Object.keys(patch).length === 0) {
      onPdfAction?.(null);
      return;
    }
    onPdfAction?.(patch);
  };

  const pdfButtonLabel = isDirty
    ? t('meditations.bookSaveAndPdf')
    : t('meditations.bookPdf');

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
                aria-label={t('meditations.bookTitleLabel')}
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
                aria-label={t('meditations.bookAuthorLabel')}
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
              onClick={handlePdfClick}
              disabled={saving}
            >
              {saving ? t('meditations.introductionSaving') : pdfButtonLabel}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MeditationBookModal;
