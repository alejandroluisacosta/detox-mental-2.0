import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ENTRY_GOAL_TARGETS,
  MEDITATION_GOALS,
  entriesRemaining,
  formatPagesRemaining,
  pagesRemaining,
  readMeditationProgressGoal,
  writeMeditationProgressGoal,
} from '../../utils/meditationPages.js';

const GOAL_MENU_OPTIONS = [
  MEDITATION_GOALS.BOOK,
  MEDITATION_GOALS.ENTRIES_25,
  MEDITATION_GOALS.ENTRIES_50,
];

const goalMenuLabelKey = {
  [MEDITATION_GOALS.BOOK]: 'meditations.goalBook',
  [MEDITATION_GOALS.ENTRIES_25]: 'meditations.goalEntries25',
  [MEDITATION_GOALS.ENTRIES_50]: 'meditations.goalEntries50',
};

const MeditationProgressControl = ({ entries, locale, t, visible }) => {
  const menuId = useId();
  const rootRef = useRef(null);
  const [selectedGoal, setSelectedGoal] = useState(() => readMeditationProgressGoal());
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const progressLabel = useMemo(() => {
    if (selectedGoal === MEDITATION_GOALS.BOOK) {
      const pages = pagesRemaining(entries);
      const formatted = formatPagesRemaining(pages, locale);
      return t('meditations.pagesLeft', { pages: formatted });
    }

    const target = ENTRY_GOAL_TARGETS[selectedGoal];
    const remaining = entriesRemaining(entries, target);

    if (remaining === 0) {
      if (selectedGoal === MEDITATION_GOALS.ENTRIES_25) {
        return t('meditations.entriesGoalReached25');
      }
      return t('meditations.entriesGoalReached50');
    }

    if (selectedGoal === MEDITATION_GOALS.ENTRIES_25) {
      return t('meditations.entriesLeftToward25', { count: remaining });
    }
    return t('meditations.entriesLeftToward50', { count: remaining });
  }, [entries, locale, selectedGoal, t]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      setMenuOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const selectGoal = (goal) => {
    setSelectedGoal(goal);
    writeMeditationProgressGoal(goal);
    setMenuOpen(false);
    setAnnouncement(progressLabelForGoal(goal, entries, locale, t));
  };

  if (!visible) return null;

  return (
    <div className="journal-meditations__pages-left journal-meditations__progress" ref={rootRef}>
      <button
        type="button"
        className="journal-meditations__progress-trigger"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={t('meditations.progressGoalButton')}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {selectedGoal === MEDITATION_GOALS.BOOK ? (
          <img
            src="/icons/book.svg"
            alt=""
            aria-hidden="true"
            className="journal-meditations__progress-goal-icon journal-meditations__book-icon"
          />
        ) : (
          <img
            src="/icons/target.svg"
            alt=""
            aria-hidden="true"
            className="journal-meditations__progress-goal-icon journal-meditations__target-icon"
          />
        )}
        <span className="journal-meditations__pages-left-text">{progressLabel}</span>
        {!menuOpen && (
          <img
            src="/icons/arrow_down.svg"
            alt=""
            aria-hidden="true"
            className="journal-meditations__progress-dropdown-icon"
          />
        )}
      </button>
      {menuOpen && (
        <ul id={menuId} role="menu" className="journal-meditations__progress-menu">
          {GOAL_MENU_OPTIONS.map((goal) => (
            <li key={goal} role="none">
              <button
                type="button"
                role="menuitem"
                className="journal-meditations__progress-menu-item"
                aria-current={selectedGoal === goal ? 'true' : undefined}
                onClick={() => selectGoal(goal)}
              >
                {t(goalMenuLabelKey[goal])}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p
        className="journal-meditations__progress-announcement"
        role="status"
        aria-live="polite"
      >
        {announcement}
      </p>
    </div>
  );
};

const progressLabelForGoal = (goal, entries, locale, t) => {
  if (goal === MEDITATION_GOALS.BOOK) {
    const pages = pagesRemaining(entries);
    const formatted = formatPagesRemaining(pages, locale);
    return t('meditations.pagesLeft', { pages: formatted });
  }

  const target = ENTRY_GOAL_TARGETS[goal];
  const remaining = entriesRemaining(entries, target);

  if (remaining === 0) {
    if (goal === MEDITATION_GOALS.ENTRIES_25) {
      return t('meditations.entriesGoalReached25');
    }
    return t('meditations.entriesGoalReached50');
  }

  if (goal === MEDITATION_GOALS.ENTRIES_25) {
    return t('meditations.entriesLeftToward25', { count: remaining });
  }
  return t('meditations.entriesLeftToward50', { count: remaining });
};

export default MeditationProgressControl;
