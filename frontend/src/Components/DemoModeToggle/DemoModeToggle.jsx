import { useDemoMode } from '../../Context/DemoModeContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './DemoModeToggle.css';

const DemoModeToggle = () => {
  const { demoMode, toggleDemoMode } = useDemoMode();
  const { t } = useLocale();

  return (
    <button
      type="button"
      className={`demo-mode-toggle${demoMode ? ' demo-mode-toggle--active' : ''}`}
      onClick={toggleDemoMode}
      role="switch"
      aria-checked={demoMode}
      aria-label={demoMode ? t('demo.disable') : t('demo.enable')}
    >
      <span className="demo-mode-toggle__label">DEMO</span>
      <span className="demo-mode-toggle__box" aria-hidden="true" />
    </button>
  );
};

export default DemoModeToggle;
