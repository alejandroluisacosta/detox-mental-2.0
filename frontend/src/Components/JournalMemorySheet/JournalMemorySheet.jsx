import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { formatLocaleDate } from '../../utils/locale.js';
import { snapMemoryIndex } from '../../utils/journalMemory.js';
import './JournalMemorySheet.css';

const TITLE_ID = 'journal-memory-sheet-title';
const DATE_OPTIONS = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // The memory date is a UTC calendar date; never shift it into the viewer's zone.
  timeZone: 'UTC',
};

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');

// Bottom sheet with a swipeable stack of the entries written on one past day.
const JournalMemorySheet = ({ memory, onClose }) => {
  const { t, locale } = useLocale();
  const closeRef = useRef(null);
  const startXRef = useRef(0);
  const dragRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const entries = memory.entries;
  const count = entries.length;
  const isYear = memory.horizon === '1y';
  const dateLabel = capitalize(
    formatLocaleDate(`${memory.date}T00:00:00.000Z`, locale, DATE_OPTIONS),
  );

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const setDragOffset = (value) => {
    dragRef.current = value;
    setDrag(value);
  };

  const handlePointerDown = (event) => {
    if (count < 2 || (event.pointerType === 'mouse' && event.button !== 0)) return;
    startXRef.current = event.clientX;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety; the drag still works without it.
    }
    setDragOffset(0);
    setDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    const delta = event.clientX - startXRef.current;
    const pastEdge = (delta > 0 && index === 0) || (delta < 0 && index === count - 1);
    setDragOffset(pastEdge ? delta / 3 : delta);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setIndex(snapMemoryIndex({ index, count, drag: dragRef.current }));
    setDragOffset(0);
    setDragging(false);
  };

  return (
    <div className="journal-memory-sheet">
      <div
        className="journal-memory-sheet__scrim"
        data-testid="journal-memory-sheet-scrim"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="journal-memory-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
      >
        <div className="journal-memory-sheet__grabber" aria-hidden="true" />
        <div className="journal-memory-sheet__header">
          <div className="journal-memory-sheet__heading">
            <p className="journal-memory-sheet__eyebrow">
              {t(isYear ? 'journalMemory.labelYear' : 'journalMemory.labelMonth')}
            </p>
            <h2 id={TITLE_ID} className="journal-memory-sheet__title">
              {dateLabel}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="journal-memory-sheet__close"
            onClick={onClose}
            aria-label={t('journalMemory.close')}
          >
            <span className="journal-memory-sheet__close-icon" aria-hidden="true" />
          </button>
        </div>

        <div
          className={`journal-memory-sheet__viewport${
            count > 1 ? ' journal-memory-sheet__viewport--swipeable' : ''
          }`}
          data-testid="journal-memory-sheet-viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className={`journal-memory-sheet__track${
              dragging ? ' journal-memory-sheet__track--dragging' : ''
            }`}
            style={{ '--memory-index': index, '--memory-drag': `${drag}px` }}
          >
            {entries.map((entry, i) => (
              <article
                key={entry.id}
                className="journal-memory-sheet__card"
                aria-hidden={i !== index}
                inert={i !== index}
              >
                <p className="journal-memory-sheet__text">{entry.content}</p>
              </article>
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="journal-memory-sheet__nav">
            <div className="journal-memory-sheet__dots">
              {entries.map((entry, i) => (
                <button
                  key={entry.id}
                  type="button"
                  className="journal-memory-sheet__dot"
                  onClick={() => setIndex(i)}
                  aria-label={t('journalMemory.showEntry', { current: i + 1, total: count })}
                  aria-current={i === index ? 'true' : undefined}
                >
                  <span
                    className={`journal-memory-sheet__dot-mark${
                      i === index ? ' journal-memory-sheet__dot-mark--active' : ''
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="journal-memory-sheet__counter" aria-live="polite">
              {t('journalMemory.counter', { current: index + 1, total: count })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalMemorySheet;
