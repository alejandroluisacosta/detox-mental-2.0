import { useEffect, useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon.jsx';
import './SummaryCommentModal.css';

const SummaryCommentModal = ({
  quotedText,
  title,
  placeholder,
  addLabel,
  cancelLabel,
  labelledById,
  onClose,
  onAdd,
}) => {
  const [note, setNote] = useState('');
  const trimmed = note.trim();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
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
        <blockquote className="summary-comment-modal__quote">
          {quotedText}
        </blockquote>
        <label className="summary-comment-modal__label" htmlFor="summary-comment-note">
          {placeholder}
        </label>
        <textarea
          id="summary-comment-note"
          className="summary-comment-modal__textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={placeholder}
          rows={5}
        />
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
