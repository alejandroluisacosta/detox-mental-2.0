import { useEffect, useId, useRef, useState } from 'react';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { formatLocaleDate } from '../../utils/locale.js';
import { nextIndexAfterSwipe } from '../../utils/journalMemory.js';
import './JournalMemorySheet.css';

// Edge drags move at a third of the finger so the stack feels bounded.
const EDGE_RESISTANCE = 3;

const JournalMemorySheet = ({ memory, onClose }) => {
  const { locale, t } = useLocale();
  const titleId = useId();
  const closeRef = useRef(null);
  const dragStartRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const { entries } = memory;
  const total = entries.length;

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const dateLabel = formatLocaleDate(`${memory.date}T00:00:00Z`, locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const handlePointerDown = (event) => {
    if (total < 2) return;
    dragStartRef.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (dragStartRef.current === null) return;
    const delta = event.clientX - dragStartRef.current;
    const atEdge = (delta > 0 && index === 0) || (delta < 0 && index === total - 1);
    setDrag(atEdge ? delta / EDGE_RESISTANCE : delta);
  };

  const handlePointerEnd = () => {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;
    setDragging(false);
    setIndex((current) => nextIndexAfterSwipe(current, drag, total));
    setDrag(0);
  };

  return (
    <div className="journal-memory-sheet">
      <div
        className="journal-memory-sheet__scrim"
        data-testid="journal-memory-sheet-scrim"
        onClick={onClose}
      />
      <section
        className="journal-memory-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="journal-memory-sheet__grabber" aria-hidden="true" />
        <header className="journal-memory-sheet__header">
          <div className="journal-memory-sheet__heading">
            <p className="journal-memory-sheet__label">
              {t(`journalMemory.title.${memory.horizon}`)}
            </p>
            <h2 id={titleId} className="journal-memory-sheet__date">
              {dateLabel}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="journal-memory-sheet__close"
            aria-label={t('journalMemory.close')}
            onClick={onClose}
          >
            <span className="journal-memory-sheet__close-icon" aria-hidden="true" />
          </button>
        </header>

        <div
          className={`journal-memory-sheet__viewport${
            total > 1 ? ' journal-memory-sheet__viewport--swipeable' : ''
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div
            className={`journal-memory-sheet__track${
              dragging ? ' journal-memory-sheet__track--dragging' : ''
            }`}
            style={{ transform: `translateX(calc(${-index} * (100% - 18px) + ${drag}px))` }}
          >
            {entries.map((entry, i) => (
              <article
                key={entry.id}
                className="journal-memory-sheet__card"
                aria-hidden={i === index ? undefined : 'true'}
              >
                <p className="journal-memory-sheet__time">
                  {formatLocaleDate(entry.createdAt, locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="journal-memory-sheet__content">{entry.content}</p>
              </article>
            ))}
          </div>
        </div>

        {total > 1 && (
          <div className="journal-memory-sheet__pager">
            <div className="journal-memory-sheet__dots">
              {entries.map((entry, i) => (
                <button
                  key={entry.id}
                  type="button"
                  className="journal-memory-sheet__dot-button"
                  aria-label={t('journalMemory.showEntry', { current: i + 1, total })}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => setIndex(i)}
                >
                  <span
                    className={`journal-memory-sheet__dot${
                      i === index ? ' journal-memory-sheet__dot--active' : ''
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="journal-memory-sheet__count">
              {t('journalMemory.count', { current: index + 1, total })}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default JournalMemorySheet;
