import './Article.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { useTheory } from '../../utils/localizedContent.js';

const Article = () => {
    const [isWantMoreRevealed, setIsWantMoreRevealed] = useState(() => localStorage.getItem("wantMore") !== null);
    const navigate = useNavigate();
    const { t } = useLocale();
    const theory = useTheory();
    const TheoryBody = theory.Body;
    const WantMore = theory.WantMore;
    
    const revealWantMoreHandler = () => {
      setIsWantMoreRevealed(true);
      localStorage.setItem("wantMore", "")
    }

    const goToCourseHandler = () => {
      setIsWantMoreRevealed(false);

      setTimeout(() => {
        navigate('/course')
      }, 1250)
    }

    const wantMoreRevealerClasses = [
      'article__want-more-revealer',
      isWantMoreRevealed && 'hidden'
    ].filter(Boolean).join(' ');

    const wantMoreExpellerClasses = [
      'article__want-more-expeller',
      isWantMoreRevealed && 'hidden'
    ].filter(Boolean).join(' ');

    const wantMoreClasses = [
      'article__want-more',
      'fade',
      !isWantMoreRevealed && 'hidden',
    ].filter(Boolean).join(' ');

    return (
    <div className="article">
      <main className="article-content">
        <Navigation />
        <h1 className="article-content__article-title">{theory.title}</h1>
        <p className="article-content__article-subtitle">{theory.subtitle}</p>
        {TheoryBody ? <TheoryBody writtenBy={theory.writtenBy} /> : null}
        <h3 className='article__want-more-title'>{theory.wantMoreTitle}</h3>
        <button className={wantMoreRevealerClasses} onClick={() => revealWantMoreHandler()}>{t('theory.wantMore')}</button>
        <a className={wantMoreExpellerClasses} href='https://tiktok.com' >{t('theory.leave')}</a>
        <section className={wantMoreClasses}>
          {WantMore ? <WantMore /> : null}
          <button className='article__want-more__button' onClick={() => goToCourseHandler()}>{t('theory.goToCourse')}</button>
        </section>
      </main>
    </div>
  );
}

export default Article;
