import CloseIcon from '../CloseIcon/CloseIcon.jsx';
import './JournalConfirmModal.css';

const JournalConfirmModal = ({
  title,
  text,
  labelledById,
  onClose,
  primary,
  secondary,
  closeText,
}) => {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="journal-confirm-modal modal-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
      >
        <CloseIcon handleCloseModal={onClose} />
        <h2 id={labelledById} className="journal-confirm-modal__title">
          {title}
        </h2>
        <p className="journal-confirm-modal__text">{text}</p>
        <button
          type="button"
          className="journal-confirm-modal__button"
          onClick={primary.onClick}
          disabled={primary.disabled}
        >
          {primary.label}
        </button>
        <button
          type="button"
          className="journal-confirm-modal__button journal-confirm-modal__button--secondary"
          onClick={secondary.onClick}
          disabled={secondary.disabled}
        >
          {secondary.label}
        </button>
        {closeText ? (
          <button
            type="button"
            className="journal-confirm-modal__close-text"
            onClick={onClose}
          >
            {closeText}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default JournalConfirmModal;
