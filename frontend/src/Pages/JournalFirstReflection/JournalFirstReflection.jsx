import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { readFirstReflection } from '../../utils/firstReflection.js';
import { splitSummaryParagraphs } from '../../utils/summaryParagraphs.js';
// The preview renders the weekly summary's sections, so it shares its styles.
import '../JournalSummary/JournalSummary.css';
import './JournalFirstReflection.css';

const Paragraphs = ({ text, className }) =>
  splitSummaryParagraphs(text).map((paragraph, index) => (
    <p key={index} className={className}>
      {paragraph}
    </p>
  ));

const JournalFirstReflection = () => {
  const { t } = useLocale();
  const [reflection] = useState(() => readFirstReflection());

  return (
    <div className="journal-page journal-page--summary">
      <Navigation />
      <main className="journal-page__main journal-summary__main">
        <header className="journal-summary__header">
          <h1 className="journal-summary__title">{t('firstReflection.title')}</h1>
        </header>

        {!reflection ? (
          <div className="journal-summary__empty">
            <p>{t('firstReflection.empty')}</p>
            <Link to="/journal" className="journal-summary__action-link">
              {t('firstReflection.write')}
            </Link>
          </div>
        ) : (
          <>
            <p className="first-reflection__lead">{t('firstReflection.lead')}</p>

            <div className="journal-summary__result">
              <section className="journal-summary__section">
                <h2 className="journal-summary__heading journal-summary__heading--this-week">
                  {t('firstReflection.yourEntry')}
                </h2>
                {Array.isArray(reflection.mainTopics) && reflection.mainTopics.length > 0 && (
                  <ul className="journal-summary__topics" aria-label={t('summary.mainTopics')}>
                    {reflection.mainTopics.map((topic) => (
                      <li key={topic} className="journal-summary__topic-chip">
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
                <Paragraphs text={reflection.summaryText} className="journal-summary__body" />
              </section>

              <section className="journal-summary__section">
                <h2 className="journal-summary__heading">{t('summary.bestQuote')}</h2>
                <blockquote className="journal-summary__quote">{reflection.bestQuote}</blockquote>
              </section>

              <section className="journal-summary__section">
                <h2 className="journal-summary__heading journal-summary__heading--socratic">
                  <img
                    src="/images/socrates.webp"
                    alt={t('summary.socratesAlt')}
                    className="journal-summary__avatar"
                  />
                  {t('summary.socraticHeading')}
                </h2>
                <Paragraphs text={reflection.socraticText} className="journal-summary__socratic" />
              </section>

              <section className="journal-summary__section">
                <h2 className="journal-summary__heading journal-summary__heading--machiavelli">
                  <img
                    src="/images/machiavelli.webp"
                    alt={t('summary.machiavelliAlt')}
                    className="journal-summary__avatar"
                  />
                  {t('summary.machiavelliHeading')}
                </h2>
                <Paragraphs
                  text={reflection.machiavelliText}
                  className="journal-summary__machiavelli"
                />
              </section>
            </div>

            <div className="first-reflection__cta">
              <p className="journal-summary__lead">{t('firstReflection.cta')}</p>
              <Link
                to="/login"
                className="journal-summary__write-button first-reflection__signup"
              >
                {t('firstReflection.signup')}
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default JournalFirstReflection;
