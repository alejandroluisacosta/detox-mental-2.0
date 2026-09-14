import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BlogChrome from '../../Components/BlogChrome/BlogChrome.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { apiFetch } from '../../api/client.js';
import { BLOG_CATEGORIES, blogCategoryLabel } from '../../data/blogCategories.js';
import { MOCK_BLOG_POSTS } from '../../data/blogPosts.js';
import { filterBlogPosts, mergeBlogPosts } from '../../utils/blogPosts.js';
import { formatLocaleDate } from '../../utils/locale.js';
import './Blog.css';

const formatPostDate = (iso) =>
  formatLocaleDate(iso, 'es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) || '';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const [remotePosts, setRemotePosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/blog/posts');
        if (!res.ok) {
          throw new Error('load-failed');
        }
        const data = await res.json();
        if (!cancelled) {
          setRemotePosts(Array.isArray(data.posts) ? data.posts : []);
        }
      } catch {
        if (!cancelled) setRemotePosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  const posts = useMemo(
    () => filterBlogPosts(mergeBlogPosts(remotePosts, MOCK_BLOG_POSTS), category),
    [remotePosts, category],
  );

  const selectCategory = (slug) => {
    if (!slug) {
      setSearchParams({});
      return;
    }
    setSearchParams({ category: slug });
  };

  return (
    <div className="blog-index">
      <BlogChrome />
      <main className="blog-index__main">
        <h1 className="blog-index__title">Blog</h1>
        <div
          className="blog-index__filters"
          role="group"
          aria-label="Categorías"
        >
          <button
            type="button"
            className={`blog-index__filter${category === '' ? ' blog-index__filter--active' : ''}`}
            aria-pressed={category === ''}
            onClick={() => selectCategory('')}
          >
            Todas
          </button>
          {BLOG_CATEGORIES.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={`blog-index__filter${category === item.slug ? ' blog-index__filter--active' : ''}`}
              aria-pressed={category === item.slug}
              onClick={() => selectCategory(item.slug)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingStatus>Cargando artículos…</LoadingStatus>
        ) : posts.length === 0 ? (
          <p className="blog-index__empty">No hay artículos en esta categoría.</p>
        ) : (
          <ul className="blog-index__feed">
            {posts.map((post) => (
              <li key={post.id || post.slug}>
                <Link className="blog-index__card" to={`/alejandroluis/blog/${post.slug}`}>
                  <span className="blog-index__meta">
                    <span className="blog-index__date">{formatPostDate(post.publishedAt)}</span>
                    <span className="blog-index__category">
                      {blogCategoryLabel(post.category)}
                    </span>
                  </span>
                  <h2 className="blog-index__card-title">{post.title}</h2>
                  {post.excerpt ? (
                    <p className="blog-index__excerpt">{post.excerpt}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Blog;
