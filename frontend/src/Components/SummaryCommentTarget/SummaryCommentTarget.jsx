import './SummaryCommentTarget.css';

const SummaryCommentTarget = ({
  as = 'p',
  className,
  text,
  disabled = false,
  commented = false,
  commentMarkAlt,
  onComment,
  ariaLabel,
}) => {
  const Tag = as;
  const mark = commented ? (
    <img
      src="/icons/note.svg"
      alt={commentMarkAlt}
      className="summary-comment-target__mark"
    />
  ) : null;

  const body = disabled ? (
    text
  ) : (
    <button
      type="button"
      className="summary-comment-target"
      onClick={() => onComment?.(text)}
      aria-label={ariaLabel}
    >
      {text}
    </button>
  );

  return (
    <div
      className={[
        'summary-comment-target-wrap',
        commented && 'summary-comment-target-wrap--marked',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Tag className={className}>{body}</Tag>
      {mark}
    </div>
  );
};

export default SummaryCommentTarget;
