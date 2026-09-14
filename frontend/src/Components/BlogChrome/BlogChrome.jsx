import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import './BlogChrome.css';

const BlogChrome = ({ editSlug }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="blog-chrome">
      <Link className="blog-chrome__brand" to="/alejandroluis">
        Alejandro Luis
      </Link>
      <nav className="blog-chrome__nav" aria-label="Blog">
        <Link className="blog-chrome__link" to="/alejandroluis/blog">
          Blog
        </Link>
        {isAdmin && (
          <Link className="blog-chrome__link" to="/alejandroluis/blog/new">
            Escribir
          </Link>
        )}
        {isAdmin && editSlug ? (
          <Link
            className="blog-chrome__link"
            to={`/alejandroluis/blog/${editSlug}/edit`}
          >
            Editar
          </Link>
        ) : null}
      </nav>
    </header>
  );
};

export default BlogChrome;
