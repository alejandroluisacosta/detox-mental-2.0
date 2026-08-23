import './LoadingStatus.css';

const LoadingStatus = ({ children }) => (
  <div className="loading-status" role="status" aria-live="polite">
    <span className="loading-status__spinner" aria-hidden="true" />
    <p className="loading-status__text">{children}</p>
  </div>
);

export default LoadingStatus;
