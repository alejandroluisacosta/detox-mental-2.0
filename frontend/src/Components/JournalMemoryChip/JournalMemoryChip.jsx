import { useLocale } from '../../Context/LocaleContext.jsx';
import './JournalMemoryChip.css';

const JournalMemoryChip = ({ horizon, seen, onOpen }) => {
  const { t } = useLocale();

  return (
    <button
      type="button"
      className={`journal-memory-chip${seen ? ' journal-memory-chip--seen' : ''}`}
      aria-label={t(`journalMemory.open.${horizon}`)}
      onClick={onOpen}
    >
      <span className="journal-memory-chip__pill">
        <span className="journal-memory-chip__icon" aria-hidden="true" />
        {t(`journalMemory.chip.${horizon}`)}
      </span>
    </button>
  );
};

export default JournalMemoryChip;
