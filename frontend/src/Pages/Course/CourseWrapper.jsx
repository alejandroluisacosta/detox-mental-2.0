import { useEffect, useState } from 'react';
import RewardOfferModal from '../../Components/RewardOfferModal/RewardOfferModal';
import Course from './Course';
import './Course.css';

const COURSE_REVEALED_STORAGE_KEY = 'courseRevealed';
const COURSE_REWARD_OFFER_STORAGE_KEY = 'courseRewardOfferSeen';

export default function CourseWithIntro() {
  const [showIntro, setShowIntro] = useState(localStorage.getItem(COURSE_REVEALED_STORAGE_KEY) === null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showRewardOfferModal, setShowRewardOfferModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 4500);
    localStorage.setItem(COURSE_REVEALED_STORAGE_KEY, '');
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      const id = requestAnimationFrame(() => setFadeIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [showIntro]);

  useEffect(() => {
    if (
      showIntro ||
      localStorage.getItem(COURSE_REWARD_OFFER_STORAGE_KEY) !== null
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      localStorage.setItem(COURSE_REWARD_OFFER_STORAGE_KEY, '');
      setShowRewardOfferModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showIntro]);

  return showIntro ? (
    <div className="intro-screen">
      <div>
        <h1 className="intro-screen__intro-image">Detox Mental</h1>
        <p className="intro-screen__subtitle">en 15 días</p>
        <img
          src="/icons/course.webp"
          alt="Ícono de curso decorativo"
          className="intro-screen__course-icon"
        />
      </div>
    </div>
  ) : (
    <>
      <div className={`course-container ${fadeIn ? 'fade-in' : ''}`}>
        <Course />
      </div>
      {showRewardOfferModal && (
        <RewardOfferModal
          setOpenRewardOfferModal={setShowRewardOfferModal}
        />
      )}
    </>
  );
}
