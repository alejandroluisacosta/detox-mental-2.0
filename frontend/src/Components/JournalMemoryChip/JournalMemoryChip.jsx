import { useLocale } from '../../Context/LocaleContext.jsx';
import './JournalMemoryChip.css';

// Small "1y" / "1m" pill that opens the entries written on this day in the past.
const JournalMemoryChip = ({ ref, horizon, seen = false, onOpen }) => {
  const { t } = useLocale();
  const isYear = horizon === '1y';

  return (
    <button
      ref={ref}
      type="button"
      className={`journal-memory-chip${seen ? ' journal-memory-chip--seen' : ''}`}
      onClick={onOpen}
      aria-label={t(isYear ? 'journalMemory.openYear' : 'journalMemory.openMonth')}
      aria-haspopup="dialog"
    >
      <span className="journal-memory-chip__pill">
        <span className="journal-memory-chip__icon" aria-hidden="true" />
        <span>{t(isYear ? 'journalMemory.chipYear' : 'journalMemory.chipMonth')}</span>
      </span>
    </button>
  );
};

export default JournalMemoryChip;
