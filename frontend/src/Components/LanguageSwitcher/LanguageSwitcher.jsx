import { useLocale } from '../../Context/LocaleContext.jsx';
import './LanguageSwitcher.css';

const LANGUAGE_OPTIONS = [
  { locale: 'en', flag: '🇺🇸', labelKey: 'nav.english' },
  { locale: 'es', flag: '🇪🇸', labelKey: 'nav.spanish' },
];

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLocale();

  const activeIndex = Math.max(
    LANGUAGE_OPTIONS.findIndex((option) => option.locale === locale),
    0,
  );

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={t('nav.language')}
      style={{ '--language-index': activeIndex }}
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const selected = locale === option.locale;
        const languageName = t(option.labelKey);
        return (
          <button
            key={option.locale}
            type="button"
            className={`language-switcher__option${selected ? ' language-switcher__option--active' : ''}`}
            onClick={() => setLocale(option.locale)}
            aria-pressed={selected}
            aria-label={languageName}
          >
            <span aria-hidden="true">{option.flag}</span>
            <span aria-hidden="true">{languageName}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
