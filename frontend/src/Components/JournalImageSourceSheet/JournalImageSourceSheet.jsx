import { useEffect, useRef } from 'react';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './JournalImageSourceSheet.css';

const JournalImageSourceSheet = ({ anchorRef, onClose, onChooseCamera, onChooseLibrary }) => {
  const { t } = useLocale();
  const menuRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const onPointerDown = (e) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (anchorRef?.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [anchorRef, onClose]);

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
      ref={menuRef}
      id="journal-image-source-menu"
      className="journal-image-source-sheet"
      role="menu"
      aria-label={t('journal.imageSourceTitle')}
    >
      <button
        type="button"
        className="journal-image-source-sheet__option"
        role="menuitem"
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
        role="menuitem"
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
  );
};

export default JournalImageSourceSheet;
