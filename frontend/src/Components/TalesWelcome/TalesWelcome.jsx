import './TalesWelcome.css';

// Tales greets the user like in his test chats: a typing indicator, then his message.
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
        <p className="tales-welcome__message">{message}</p>
      </div>
    </div>
  </div>
);

export default TalesWelcome;
