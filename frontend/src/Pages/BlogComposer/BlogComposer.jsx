import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlogChrome from '../../Components/BlogChrome/BlogChrome.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { apiFetch } from '../../api/client.js';
import { BLOG_CATEGORIES } from '../../data/blogCategories.js';
import { suggestBlogSlug } from '../../utils/blogSlug.js';
import './BlogComposer.css';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: BLOG_CATEGORIES[0].slug,
  status: 'draft',
};

const BlogComposer = () => {
  const { slug: routeSlug } = useParams();
  const isEdit = Boolean(routeSlug);
  const navigate = useNavigate();
  const { user, status: authStatus } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authStatus !== 'ready') return undefined;
    if (!isAdmin) {
      setNotFound(true);
      setLoading(false);
      return undefined;
    }
    if (!isEdit) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/blog/admin/posts/${encodeURIComponent(routeSlug)}`);
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!cancelled && data.post) {
          setForm({
            title: data.post.title,
            slug: data.post.slug,
            excerpt: data.post.excerpt || '',
            body: data.post.body,
            category: data.post.category,
            status: data.post.status,
          });
          setSlugEdited(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [authStatus, isAdmin, isEdit, routeSlug]);

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugEdited) {
        next.slug = suggestBlogSlug(value);
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin || saving) return;

    setSaving(true);
    setError(null);
    try {
      const path = isEdit
        ? `/blog/admin/posts/${encodeURIComponent(routeSlug)}`
        : '/blog/admin/posts';
      const res = await apiFetch(path, {
        method: isEdit ? 'PATCH' : 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'No se pudo guardar el artículo.');
      }
      navigate(`/alejandroluis/blog/${data.post.slug}`);
    } catch (err) {
      setError(err.message || 'No se pudo guardar el artículo.');
    } finally {
      setSaving(false);
    }
  };

  const showComposer = authStatus === 'ready' && isAdmin && !notFound;

  return (
    <div className="blog-composer">
      <BlogChrome editSlug={isEdit ? routeSlug : undefined} />
      <main className="blog-composer__main">
        {authStatus === 'loading' || loading ? (
          <LoadingStatus>Cargando…</LoadingStatus>
        ) : !showComposer ? (
          <div className="blog-composer__missing">
            <h1 className="blog-composer__title">No encontrado</h1>
            <p className="blog-composer__copy">Este artículo no existe.</p>
          </div>
        ) : (
          <form className="blog-composer__form" onSubmit={handleSubmit}>
            <h1 className="blog-composer__title">
              {isEdit ? 'Editar artículo' : 'Nuevo artículo'}
            </h1>
            <label className="blog-composer__label" htmlFor="blog-title">
              Título
            </label>
            <input
              id="blog-title"
              className="blog-composer__input"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              required
            />
            <label className="blog-composer__label" htmlFor="blog-slug">
              Slug
            </label>
            <input
              id="blog-slug"
              className="blog-composer__input"
              value={form.slug}
              onChange={(event) => {
                setSlugEdited(true);
                updateField('slug', event.target.value);
              }}
              required
            />
            <label className="blog-composer__label" htmlFor="blog-category">
              Categoría
            </label>
            <select
              id="blog-category"
              className="blog-composer__input"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
            >
              {BLOG_CATEGORIES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
            <label className="blog-composer__label" htmlFor="blog-excerpt">
              Extracto
            </label>
            <textarea
              id="blog-excerpt"
              className="blog-composer__textarea blog-composer__textarea--short"
              value={form.excerpt}
              onChange={(event) => updateField('excerpt', event.target.value)}
            />
            <label className="blog-composer__label" htmlFor="blog-body">
              Artículo
            </label>
            <textarea
              id="blog-body"
              className="blog-composer__textarea"
              value={form.body}
              onChange={(event) => updateField('body', event.target.value)}
              required
            />
            <fieldset className="blog-composer__status">
              <legend className="blog-composer__label">Estado</legend>
              <label className="blog-composer__choice">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={() => updateField('status', 'draft')}
                />
                Borrador
              </label>
              <label className="blog-composer__choice">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === 'published'}
                  onChange={() => updateField('status', 'published')}
                />
                Publicado
              </label>
            </fieldset>
            {error ? (
              <p className="blog-composer__error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="blog-composer__submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default BlogComposer;
