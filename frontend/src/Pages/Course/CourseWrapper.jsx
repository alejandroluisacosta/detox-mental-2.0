import { useEffect, useRef, useState } from 'react';
import RewardOfferModal from '../../Components/RewardOfferModal/RewardOfferModal';
import CourseOnboarding, {
  COURSE_ONBOARDING_SEEN_KEY,
} from '../../Components/CourseOnboarding/CourseOnboarding.jsx';
import { isPromoEnabled } from '../../data/promoConfig.js';
import Course from './Course';
import './Course.css';

const COURSE_REWARD_OFFER_STORAGE_KEY = 'courseRewardOfferSeen';
const ONBOARDING_DELAY_MS = 500;

export default function CourseWithIntro() {
  const helpButtonRef = useRef(null);
  const [showRewardOfferModal, setShowRewardOfferModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(COURSE_ONBOARDING_SEEN_KEY) !== null,
  );
  const [pulseHelp, setPulseHelp] = useState(false);

  // Let first-time visitors see the sessions before the slideshow fades in over them.
  useEffect(() => {
    if (localStorage.getItem(COURSE_ONBOARDING_SEEN_KEY) !== null) return undefined;
    const timer = setTimeout(() => setShowOnboarding(true), ONBOARDING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // The reward offer must not stack on top of the first-visit slideshow.
  useEffect(() => {
    if (
      !isPromoEnabled() ||
      !onboardingDone ||
      localStorage.getItem(COURSE_REWARD_OFFER_STORAGE_KEY) !== null
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      localStorage.setItem(COURSE_REWARD_OFFER_STORAGE_KEY, '');
      setShowRewardOfferModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onboardingDone]);

  const closeOnboarding = () => {
    // Point first-time visitors to where the slideshow went; replays stay quiet.
    if (localStorage.getItem(COURSE_ONBOARDING_SEEN_KEY) === null) setPulseHelp(true);
    localStorage.setItem(COURSE_ONBOARDING_SEEN_KEY, 'true');
    setShowOnboarding(false);
    setOnboardingDone(true);
    helpButtonRef.current?.focus();
  };

  const openOnboarding = () => {
    setPulseHelp(false);
    setShowOnboarding(true);
  };

  return (
    <>
      <Course
        helpButtonRef={helpButtonRef}
        pulseHelp={pulseHelp}
        onOpenOnboarding={openOnboarding}
      />
      {showOnboarding && <CourseOnboarding onClose={closeOnboarding} />}
      {isPromoEnabled() && showRewardOfferModal && (
        <RewardOfferModal
          setOpenRewardOfferModal={setShowRewardOfferModal}
        />
      )}
    </>
  );
}
