import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './BlogChrome.css';

const BlogChrome = ({ editSlug }) => {
  const { user } = useAuth();
  const { t } = useLocale();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="blog-chrome">
      <Link className="blog-chrome__brand" to="/alejandroluis">
        Alejandro Luis
      </Link>
      <nav className="blog-chrome__nav" aria-label={t('blog.nav')}>
        <Link className="blog-chrome__link" to="/alejandroluis/blog">
          {t('blog.title')}
        </Link>
        {isAdmin && (
          <Link className="blog-chrome__link" to="/alejandroluis/blog/new">
            {t('blog.write')}
          </Link>
        )}
        {isAdmin && editSlug ? (
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
