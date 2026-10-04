import { useLocale } from '../../Context/LocaleContext.jsx';
import {
  introductionParagraphs,
  isBlankIntroduction,
} from '../../utils/meditationFrontMatter.js';
import './MeditationFrontMatter.css';

const MeditationFrontMatter = ({ introduction = '' }) => {
  const { t } = useLocale();

  if (isBlankIntroduction(introduction)) return null;

  const paragraphs = introductionParagraphs(introduction);
  return (
    <section
      className="meditation-front-matter meditation-front-matter--print"
      aria-hidden="true"
    >
      <h1 className="meditation-front-matter__print-heading">
        {t('meditations.introductionHeading')}
      </h1>
      {paragraphs.map((paragraph, index) => (
        <p
          key={paragraph.length > 0 ? paragraph : `p-${index}`}
          className="meditation-front-matter__paragraph"
        >
          {paragraph}
        </p>
      ))}
    </section>
  );
};

export default MeditationFrontMatter;
