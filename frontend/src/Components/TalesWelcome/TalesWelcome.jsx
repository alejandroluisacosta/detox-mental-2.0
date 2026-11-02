import '../OnboardingHelpButton/OnboardingHelpButton.css';
import './TalesWelcome.css';

const HELP_MARKER = '[?]';

// Stands in for the page's real help button, so users recognise it.
const HelpIcon = () => (
  <span className="onboarding-help-button onboarding-help-button--inline">?</span>
);

const renderMessage = (message) =>
  message.split(HELP_MARKER).flatMap((part, i) => (i === 0 ? [part] : [<HelpIcon key={i} />, part]));

// Tales greets the user like in his test chats: a typing indicator, then his message.
// A `[?]` in the message becomes the help-button icon.
// The message is always in the DOM so screen readers get it straight away.
const TalesWelcome = ({ message }) => (
  <div className="tales-welcome">
    <img src="/images/thales.webp" alt="Tales" className="tales-welcome__avatar" />
    <div className="tales-welcome__bubble">
      <strong className="tales-welcome__name">Tales:</strong>
      <div className="tales-welcome__content">
        <span className="tales-welcome__typing" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p className="tales-welcome__message">{renderMessage(message)}</p>
      </div>
    </div>
  </div>
);

export default TalesWelcome;
