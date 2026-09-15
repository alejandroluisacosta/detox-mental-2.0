import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BlogChrome from '../../Components/BlogChrome/BlogChrome.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { BLOG_CATEGORIES } from '../../data/blogCategories.js';
import { formatLocaleDate } from '../../utils/locale.js';
import './Blog.css';

const formatPostDate = (iso, locale) =>
  formatLocaleDate(iso, locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) || '';

const Blog = () => {
  const { user, status: authStatus } = useAuth();
  const { locale, t, blogCategoryLabel } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get('category') || '';
  const selectedCategory = BLOG_CATEGORIES.includes(rawCategory) ? rawCategory : '';
  const isAdmin = user?.role === 'admin';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (authStatus !== 'ready') return undefined;

    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      setError(false);
      try {
        const path = isAdmin
          ? '/blog/admin/posts'
          : selectedCategory
            ? `/blog/posts?category=${encodeURIComponent(selectedCategory)}`
            : '/blog/posts';
        const res = await apiFetch(path);
        if (!res.ok) {
          throw new Error('load-failed');
        }
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data.posts) ? data.posts : [];
        setPosts(
          isAdmin && selectedCategory
            ? list.filter((post) => post.category === selectedCategory)
            : list,
        );
      } catch {
        if (!cancelled) {
          setPosts([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [authStatus, isAdmin, selectedCategory, retryCount]);

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
        <h1 className="blog-index__title">{t('blog.title')}</h1>
        <div
          className="blog-index__filters"
          role="group"
          aria-label={t('blog.categoriesLabel')}
        >
          <button
            type="button"
            className={`blog-index__filter${selectedCategory === '' ? ' blog-index__filter--active' : ''}`}
            aria-pressed={selectedCategory === ''}
            onClick={() => selectCategory('')}
          >
            {t('blog.allCategories')}
          </button>
          {BLOG_CATEGORIES.map((slug) => (
            <button
              key={slug}
              type="button"
              className={`blog-index__filter${selectedCategory === slug ? ' blog-index__filter--active' : ''}`}
              aria-pressed={selectedCategory === slug}
              onClick={() => selectCategory(slug)}
            >
              {blogCategoryLabel(slug)}
            </button>
          ))}
        </div>

        {loading || authStatus !== 'ready' ? (
          <LoadingStatus>{t('blog.loading')}</LoadingStatus>
        ) : error ? (
          <div className="blog-index__error">
            <p>{t('blog.loadFailed')}</p>
            <button
              type="button"
              className="blog-index__retry"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              {t('blog.retry')}
            </button>
          </div>
        ) : posts.length === 0 ? (
          <p className="blog-index__empty">{t('blog.empty')}</p>
        ) : (
          <ul className="blog-index__feed">
            {posts.map((post) => {
              const href =
                post.status === 'draft'
                  ? `/alejandroluis/blog/${post.slug}/edit`
                  : `/alejandroluis/blog/${post.slug}`;
              return (
                <li key={post.id || post.slug}>
                  <Link className="blog-index__card" to={href}>
                    <span className="blog-index__meta">
                      <span className="blog-index__date">
                        {formatPostDate(post.publishedAt || post.createdAt, locale)}
                      </span>
                      <span className="blog-index__category">
                        {blogCategoryLabel(post.category)}
                      </span>
                    </span>
                    <h2 className="blog-index__card-title">{post.title}</h2>
                    {post.status === 'draft' ? (
                      <p className="blog-index__draft">{t('blog.draft')}</p>
                    ) : null}
                    {post.excerpt ? (
                      <p className="blog-index__excerpt">{post.excerpt}</p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Blog;
