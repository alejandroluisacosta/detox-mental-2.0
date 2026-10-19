import './OnboardingHelpButton.css';

// "?" button that reopens a module's onboarding slideshow from its page.
const OnboardingHelpButton = ({ ref, label, pulse = false, onClick }) => (
  <button
    ref={ref}
    type="button"
    className={`onboarding-help-button${pulse ? ' onboarding-help-button--pulse' : ''}`}
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    ?
  </button>
);

export default OnboardingHelpButton;
