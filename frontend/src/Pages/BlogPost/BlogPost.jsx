import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import BlogChrome from '../../Components/BlogChrome/BlogChrome.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import {
  BLOG_REVIEW_SAMPLE_POST,
  BLOG_REVIEW_SAMPLE_SLUG,
  isBlogPreviewReview,
} from '../../data/blogPreviewReview.js';
import { resolveBlogImageSrc } from '../../utils/blogImageSrc.js';
import { formatLocaleDate } from '../../utils/locale.js';
import './BlogPost.css';

const markdownComponents = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    <img src={resolveBlogImageSrc(src)} alt={alt || ''} {...props} />
  ),
};

const formatPostDate = (iso, locale) =>
  formatLocaleDate(iso, locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) || '';

const BlogPost = () => {
  const { slug } = useParams();
  const { locale, t, blogCategoryLabel } = useLocale();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      setError(false);
      setNotFound(false);
      setPost(null);

      if (isBlogPreviewReview() && slug === BLOG_REVIEW_SAMPLE_SLUG) {
        setPost(BLOG_REVIEW_SAMPLE_POST);
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch(`/blog/posts/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data.post) {
            setPost(data.post);
          } else {
            setNotFound(true);
          }
          return;
        }
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        setError(true);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [slug, retryCount]);

  return (
    <div className="blog-post">
      <BlogChrome editSlug={post?.slug} />
      <main className="blog-post__main">
        {loading ? (
          <LoadingStatus>{t('blog.loadingPost')}</LoadingStatus>
        ) : error ? (
          <div className="blog-post__missing">
            <h1 className="blog-post__title">{t('blog.postLoadFailed')}</h1>
            <button
              type="button"
              className="blog-post__retry"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              {t('blog.retry')}
            </button>
          </div>
        ) : notFound || !post ? (
          <div className="blog-post__missing">
            <h1 className="blog-post__title">{t('blog.notFound')}</h1>
            <p className="blog-post__missing-copy">{t('blog.notFoundCopy')}</p>
            <Link className="blog-post__back" to="/alejandroluis/blog">
              {t('blog.back')}
            </Link>
          </div>
        ) : (
          <article className="blog-post__article">
            <p className="blog-post__category">{blogCategoryLabel(post.category)}</p>
            <h1 className="blog-post__title">{post.title}</h1>
            {post.publishedAt ? (
              <p className="blog-post__date">{formatPostDate(post.publishedAt, locale)}</p>
            ) : null}
            <div className="blog-post__body">
              <ReactMarkdown components={markdownComponents}>{post.body}</ReactMarkdown>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default BlogPost;
