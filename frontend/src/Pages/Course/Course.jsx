import { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import './Course.css';
import BlockedSessionModal from '../../Components/BlockedSessionModal/BlockedSessionModal';
import RewardOfferModal from '../../Components/RewardOfferModal/RewardOfferModal';
import OnboardingHelpButton from '../../Components/OnboardingHelpButton/OnboardingHelpButton.jsx';
import CourseOnboarding, {
    COURSE_ONBOARDING_SEEN_KEY,
} from '../../Components/CourseOnboarding/CourseOnboarding.jsx';
import { isPromoEnabled } from '../../data/promoConfig.js';
import { SessionsContext } from '../../Context/SessionsContext';
import SessionCard from '../../Components/SessionCard/SessionCard';
import Navigation from '../../Components/Navigation/Navigation';
import Lottie from 'lottie-react';
import unblockAnimation from './unblockAnimation/unblock_animation_1.json';

const COURSE_REWARD_OFFER_STORAGE_KEY = 'courseRewardOfferSeen';
const ONBOARDING_DELAY_MS = 500;

const Course = () => {
    const [openBlockedSessionModal, setOpenBlockedSessionModal] = useState(false);
    const [isSessionUnblocked, setIsSessionUnblocked] = useState(false);
    const [showRewardOfferModal, setShowRewardOfferModal] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingDone, setOnboardingDone] = useState(
        () => localStorage.getItem(COURSE_ONBOARDING_SEEN_KEY) !== null,
    );
    const [pulseHelp, setPulseHelp] = useState(false);
    const selectedSession = useRef(null);
    const helpButtonRef = useRef(null);
    const navigate = useNavigate();
    const { sessions, setSessions, sessionsLoading } = useContext(SessionsContext)

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

    const startGuidedTour = () => {
        localStorage.setItem(COURSE_ONBOARDING_SEEN_KEY, 'true');
        navigate('/onboarding');
    };

    const openOnboarding = () => {
        setPulseHelp(false);
        setShowOnboarding(true);
    };

    const handleGoToSession = (id) => {
        if (sessionsLoading && id >= 4) return;
        const sessionToOpen = sessions.find(session => session.id === id);
        if (sessionToOpen.isBlocked) {
            setOpenBlockedSessionModal(true);
            selectedSession.current = sessionToOpen;
        } else {
            navigate(`/session/${sessionToOpen.id}`);
        }
    }

    const handleGoToInstructions = () => {
        navigate('/instructions');
    }

    return (
        <div className='sessions-page'>
          {openBlockedSessionModal && <BlockedSessionModal setOpenBlockedSessionModal={setOpenBlockedSessionModal} setIsSessionUnblocked={setIsSessionUnblocked} setSessions={setSessions} selectedSession={selectedSession.current}/>}
          {isSessionUnblocked && 
              <div className='animation-overlay animation-overlay--unblock-session'>
                  <Lottie
                    className='unblock-session-animation'
                    animationData={unblockAnimation}
                    loop={false}
                    onComplete={() => setIsSessionUnblocked(false)}
                    />
              </div>
            }
            <Navigation />
            <div className='sessions-title-row'>
                <h1 className='sessions-title'>Detox Mental</h1>
                <OnboardingHelpButton
                    ref={helpButtonRef}
                    label='Cómo funciona el curso'
                    pulse={pulseHelp}
                    onClick={openOnboarding}
                />
            </div>
            <p className='sessions-subtitle'>Limpia tu mente escribiendo</p>
            <button type='button' className='sessions-instructions-button' onClick={handleGoToInstructions}>
                <img
                    className='sessions-instructions-button__icon'
                    src='/icons/instructions.svg'
                    alt=''
                    aria-hidden='true'
                />
                INSTRUCCIONES
            </button>
            <div className="sessions-container">
                {sessions.map((session, index) => (
                    <SessionCard session={session} key={index} handleGoToSession={handleGoToSession}/>
                ))}
            </div>
            <p className="course-credits">Creado con compromiso por Detox Mental™ • 2025</p>
            {showOnboarding && (
                <CourseOnboarding onClose={closeOnboarding} onStartGuidedTour={startGuidedTour} />
            )}
            {isPromoEnabled() && showRewardOfferModal && (
                <RewardOfferModal setOpenRewardOfferModal={setShowRewardOfferModal} />
            )}
        </div>
    )
}

export default Course;