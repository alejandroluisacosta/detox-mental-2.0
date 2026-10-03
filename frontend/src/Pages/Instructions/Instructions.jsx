import Navigation from '../../Components/Navigation/Navigation.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './Instructions.css';

export default function Instructions() {
  const { t } = useLocale();

  return (
    <div className='instructions-page'>
      <Navigation />
      <main className='instructions-page__content'>
        <h1 className='instructions-page__title'>{t('instructions.title')}</h1>
        <p className='instructions-page__lead'>
          {t('instructions.leadBefore')} <strong>{t('instructions.theoryWord')}</strong> {t('instructions.leadAnd')} <strong>{t('instructions.courseWord')}</strong> {t('instructions.leadAfter')}
        </p>

        <section className='instructions-page__section'>
          <h2>{t('instructions.theoryHeading')}</h2>
          <p>
            {t('instructions.theoryP1')}
          </p>
          <p>
            {t('instructions.theoryP2Before')} <strong>{t('instructions.theoryP2Strong')}</strong> {t('instructions.theoryP2After')}
          </p>
          <p>
            {t('instructions.theoryP3')}
          </p>
          <p>
            {t('instructions.theoryP4Before')} <strong>{t('instructions.theoryP4Strong')}</strong> {t('instructions.theoryP4After')}
          </p>
          <p><strong>{t('instructions.theoryP5')}</strong></p>
        </section>

        <section className='instructions-page__section'>
          <h2>{t('instructions.courseHeading')}</h2>
          <p>{t('instructions.courseP1')}</p>
          <p>{t('instructions.courseP2Before')} <strong>{t('instructions.courseP2Sessions')}</strong> {t('instructions.courseP2Mid')} <strong>{t('instructions.courseP2Exercises')}</strong>.</p>
          <p>
            {t('instructions.courseP3')}
          </p>
          <p>{t('instructions.courseP4')}</p>
          <p>
            {t('instructions.courseP5Before')} <strong>{t('instructions.courseP5Three')}</strong> {t('instructions.courseP5Mid')} <strong>{t('instructions.courseP5Unlocked')}</strong>{t('instructions.courseP5After')}
          </p>
        </section>

        <section className='instructions-page__section'>
          <h3>{t('instructions.unlockHeading')}</h3>
          <h4>{t('instructions.paidHeading')}</h4>
          <p>{t('instructions.paidP1')}</p>
          <h4>{t('instructions.freeHeading')}</h4>
          <p>
            {t('instructions.freeP1Before')} <strong>{t('instructions.freeP1Code')}</strong>{t('instructions.freeP1After')}
          </p>
          <ol className='instructions-page__list'>
            <li>
              <strong>{t('instructions.unlockQuestionTitle')}</strong>
              <p>
                {t('instructions.unlockQuestionP1Before')} <strong><i>{t('instructions.unlockQuestionYour')}</i></strong> {t('instructions.unlockQuestionP1After')}
              </p>
              <p>
                {t('instructions.unlockQuestionP2')}
              </p>
            </li>
            <li>
              <strong>{t('instructions.guessTitle')}</strong>
              <p>
                {t('instructions.guessP1Before')} <strong>{t('instructions.guessP1Strong')}</strong>{t('instructions.guessP1After')}
              </p>
              <p>
                {t('instructions.guessP2')}
              </p>
            </li>
          </ol>
          <p className='instructions-page__contact'><strong>
            {t('instructions.email')}
          </strong></p>
        </section>

        <section className='instructions-page__closing'>
          <p>
            {t('instructions.closingP1')}
          </p>
          <p>
            {t('instructions.closingP2')}
          </p>
        </section>
      </main>
    </div>
  );
}
