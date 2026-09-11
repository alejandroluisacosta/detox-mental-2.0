import './SummaryCommentTarget.css';

const SummaryCommentTarget = ({
  as = 'p',
  className,
  text,
  disabled = false,
  onComment,
  ariaLabel,
}) => {
  const Tag = as;

  if (disabled) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <button
      type="button"
      className={['summary-comment-target', className].filter(Boolean).join(' ')}
      onClick={() => onComment?.(text)}
      aria-label={ariaLabel}
    >
      {text}
    </button>
  );
};

export default SummaryCommentTarget;
