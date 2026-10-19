import { useLocale } from '../../Context/LocaleContext.jsx';
import OnboardingSlideshow from '../OnboardingSlideshow/OnboardingSlideshow.jsx';

export const JOURNAL_ONBOARDING_SEEN_KEY = 'journalOnboardingSeen';

const SLIDE_IDS = ['journal', 'history', 'summary', 'meditations'];

const JournalOnboarding = ({ onClose }) => {
  const { t } = useLocale();

  const slides = SLIDE_IDS.map((id) => ({
    id,
    title: t(`journalOnboarding.${id}.title`),
    body: t(`journalOnboarding.${id}.body`),
    alt: t(`journalOnboarding.${id}.alt`),
  }));

  const welcome = {
    title: t('journalOnboarding.welcome.title'),
    message: t('journalOnboarding.welcome.message'),
    start: t('journalOnboarding.welcome.start'),
  };

  const labels = {
    dialog: t('journalOnboarding.dialogLabel'),
    module: t('journalOnboarding.module'),
    step: (current, total) => t('journalOnboarding.step', { current, total }),
    skip: t('journalOnboarding.skip'),
    back: t('journalOnboarding.back'),
    next: t('journalOnboarding.next'),
    finish: t('journalOnboarding.finish'),
    goTo: (n) => t('journalOnboarding.goTo', { n }),
  };

  return (
    <OnboardingSlideshow
      slides={slides}
      clipBase="/onboarding/journal"
      welcome={welcome}
      labels={labels}
      onClose={onClose}
    />
  );
};

export default JournalOnboarding;
