import './MeditationPrintCover.css';

const MeditationPrintCover = ({ title, author, years, children }) => (
  <>
    <section className="meditation-print-cover">
      <div className="meditation-print-cover__center">
        <h1 className="meditation-print-cover__title">{title}</h1>
        {author != null ? (
          <p className="meditation-print-cover__author">{author}</p>
        ) : null}
      </div>
      {years != null ? <p className="meditation-print-cover__years">{years}</p> : null}
    </section>
    <div
      data-slot="meditation-print-introduction"
      className="meditation-print-cover__introduction-slot"
    >
      {children}
    </div>
  </>
);

export default MeditationPrintCover;
