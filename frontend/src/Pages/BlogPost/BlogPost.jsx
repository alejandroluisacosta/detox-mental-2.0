import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import BlogChrome from '../../Components/BlogChrome/BlogChrome.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { apiFetch } from '../../api/client.js';
import { blogCategoryLabel } from '../../data/blogCategories.js';
import { MOCK_BLOG_POSTS } from '../../data/blogPosts.js';
import { findBlogPost } from '../../utils/blogPosts.js';
import { formatLocaleDate } from '../../utils/locale.js';
import './BlogPost.css';

const markdownComponents = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
};

const formatPostDate = (iso) =>
  formatLocaleDate(iso, 'es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) || '';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      setNotFound(false);
      setPost(null);

      try {
        const res = await apiFetch(`/blog/posts/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.post) {
            setPost(data.post);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to the local mock catalog so the page stays reviewable.
      }

      if (cancelled) return;
      const mock = findBlogPost(MOCK_BLOG_POSTS, slug);
      setPost(mock);
      setNotFound(!mock);
      setLoading(false);
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="blog-post">
      <BlogChrome editSlug={post?.slug} />
      <main className="blog-post__main">
        {loading ? (
          <LoadingStatus>Cargando artículo…</LoadingStatus>
        ) : notFound || !post ? (
          <div className="blog-post__missing">
            <h1 className="blog-post__title">No encontrado</h1>
            <p className="blog-post__missing-copy">Este artículo no existe.</p>
            <Link className="blog-post__back" to="/alejandroluis/blog">
              Volver al blog
            </Link>
          </div>
        ) : (
          <article className="blog-post__article">
            <p className="blog-post__category">{blogCategoryLabel(post.category)}</p>
            <h1 className="blog-post__title">{post.title}</h1>
            {post.publishedAt ? (
              <p className="blog-post__date">{formatPostDate(post.publishedAt)}</p>
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
