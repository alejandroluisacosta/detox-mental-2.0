import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { isBlogPreviewReview } from '../../data/blogPreviewReview.js';
import './BlogChrome.css';

const BlogChrome = ({ editSlug }) => {
  const { user } = useAuth();
  const { t } = useLocale();
  const canWrite = user?.role === 'admin' || isBlogPreviewReview();

  return (
    <header className="blog-chrome">
      <Link className="blog-chrome__brand" to="/alejandroluis">
        Alejandro Luis
      </Link>
      <nav className="blog-chrome__nav" aria-label={t('blog.nav')}>
        <Link className="blog-chrome__link" to="/alejandroluis/blog">
          {t('blog.title')}
        </Link>
        {canWrite && (
          <Link className="blog-chrome__link" to="/alejandroluis/blog/new">
            {t('blog.write')}
          </Link>
        )}
        {canWrite && editSlug ? (
          <Link
            className="blog-chrome__link"
            to={`/alejandroluis/blog/${editSlug}/edit`}
          >
            {t('blog.edit')}
          </Link>
        ) : null}
      </nav>
    </header>
  );
};

export default BlogChrome;
