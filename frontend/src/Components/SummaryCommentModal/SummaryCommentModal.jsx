import { useEffect, useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon.jsx';
import './SummaryCommentModal.css';

const DEFAULT_MAX_LENGTH = 1000;

/**
 * Text sheet shared by summary comments and Compass items.
 * Optional: `replaces` ({ label, text }) shows the text being replaced,
 * `fieldLabel` makes the field label visible, and `maxLength` adds a counter.
 */
const SummaryCommentModal = ({
  quotedText,
  replaces,
  title,
  fieldLabel,
  placeholder,
  addLabel,
  cancelLabel,
  labelledById,
  fieldId = 'summary-comment-note',
  initialNote = '',
  maxLength,
  onClose,
  onAdd,
}) => {
  const [note, setNote] = useState(initialNote);
  const trimmed = note.trim();
  const limit = maxLength ?? DEFAULT_MAX_LENGTH;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay summary-comment-modal__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="summary-comment-modal modal-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
      >
        <CloseIcon handleCloseModal={onClose} />
        <h2 id={labelledById} className="summary-comment-modal__title">
          {title}
        </h2>
        {quotedText ? (
          <p className="summary-comment-modal__quote">{quotedText}</p>
        ) : null}
        {replaces ? (
          <div className="summary-comment-modal__replaces">
            <span className="summary-comment-modal__caption">{replaces.label}</span>
            <p className="summary-comment-modal__replaces-text">{replaces.text}</p>
          </div>
        ) : null}
        <label
          className={
            fieldLabel
              ? 'summary-comment-modal__caption summary-comment-modal__caption--field'
              : 'summary-comment-modal__label'
          }
          htmlFor={fieldId}
        >
          {fieldLabel || placeholder}
        </label>
        <textarea
          id={fieldId}
          className={`summary-comment-modal__textarea${
            maxLength ? ' summary-comment-modal__textarea--counted' : ''
          }`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={placeholder}
          maxLength={limit}
          rows={4}
        />
        {maxLength ? (
          <span className="summary-comment-modal__counter" aria-live="polite">
            {note.length} / {maxLength}
          </span>
        ) : null}
        <button
          type="button"
          className="summary-comment-modal__button"
          onClick={() => {
            if (!trimmed) return;
            onAdd(trimmed);
          }}
          disabled={!trimmed}
        >
          {addLabel}
        </button>
        <button
          type="button"
          className="summary-comment-modal__button summary-comment-modal__button--secondary"
          onClick={onClose}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
};

export default SummaryCommentModal;
