import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlogChrome from '../../Components/BlogChrome/BlogChrome.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { BLOG_CATEGORIES } from '../../data/blogCategories.js';
import {
  BLOG_REVIEW_SAMPLE_IMAGE_SRC,
  BLOG_REVIEW_SAMPLE_POST,
  isBlogPreviewReview,
} from '../../data/blogPreviewReview.js';
import {
  altTextFromFileName,
  MAX_BLOG_IMAGE_BYTES,
  prepareBlogImageForUpload,
  validateBlogImageFile,
} from '../../utils/blogImage.js';
import { suggestBlogSlug } from '../../utils/blogSlug.js';
import {
  wrapMarkdownEmphasis,
  wrapMarkdownImage,
  wrapMarkdownLink,
} from '../../utils/markdownFormat.js';
import './BlogComposer.css';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: BLOG_CATEGORIES[0],
  status: 'draft',
};

const PREVIEW_FORM = {
  title: BLOG_REVIEW_SAMPLE_POST.title,
  slug: BLOG_REVIEW_SAMPLE_POST.slug,
  excerpt: BLOG_REVIEW_SAMPLE_POST.excerpt,
  body: BLOG_REVIEW_SAMPLE_POST.body,
  category: BLOG_REVIEW_SAMPLE_POST.category,
  status: 'draft',
};

const BlogComposer = () => {
  const { slug: routeSlug } = useParams();
  const isEdit = Boolean(routeSlug);
  const navigate = useNavigate();
  const { user, status: authStatus } = useAuth();
  const { t, blogCategoryLabel } = useLocale();
  const isAdmin = user?.role === 'admin';
  const isPreviewReview = isBlogPreviewReview();
  const canCompose = isAdmin || isPreviewReview;

  const [form, setForm] = useState(isPreviewReview ? PREVIEW_FORM : EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [loading, setLoading] = useState(isEdit && !isPreviewReview);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  const bodyRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (authStatus !== 'ready') return undefined;
    if (isPreviewReview) {
      setForm(PREVIEW_FORM);
      setNotFound(false);
      setLoading(false);
      return undefined;
    }
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
  }, [authStatus, isAdmin, isEdit, isPreviewReview, routeSlug]);

  useLayoutEffect(() => {
    if (!pendingSelection || !bodyRef.current) return;
    bodyRef.current.focus();
    bodyRef.current.setSelectionRange(pendingSelection.start, pendingSelection.end);
    setPendingSelection(null);
  }, [pendingSelection, form.body]);

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugEdited) {
        next.slug = suggestBlogSlug(value);
      }
      return next;
    });
  };

  const applyBodyFormat = (kind, extras = {}) => {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const current = textarea.value;
    const result =
      kind === 'image'
        ? wrapMarkdownImage(current, start, end, extras.url, extras.alt)
        : kind === 'link'
          ? wrapMarkdownLink(current, start, end)
          : wrapMarkdownEmphasis(current, start, end, kind === 'bold' ? '**' : '*');
    updateField('body', result.value);
    setPendingSelection({ start: result.selectionStart, end: result.selectionEnd });
  };

  const insertImageMarkdown = (url, alt) => {
    applyBodyFormat('image', { url, alt });
  };

  const handleImageButtonClick = () => {
    if (uploadingImage) return;
    if (isPreviewReview) {
      insertImageMarkdown(BLOG_REVIEW_SAMPLE_IMAGE_SRC, 'image');
      return;
    }
    imageInputRef.current?.click();
  };

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !isAdmin || uploadingImage) return;

    const validation = validateBlogImageFile(file);
    if (!validation.valid) {
      setError(t(validation.messageKey));
      return;
    }

    setUploadingImage(true);
    setError(null);
    try {
      const prepared = await prepareBlogImageForUpload(file);
      if (prepared.size > MAX_BLOG_IMAGE_BYTES) {
        throw new Error(t('blog.imageTooLarge'));
      }
      const formData = new FormData();
      formData.append('image', prepared, file.name || 'image.jpg');
      const res = await apiFetch('/blog/admin/images', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.image?.url) {
        throw new Error(data.message || t('blog.imageUploadFailed'));
      }
      insertImageMarkdown(data.image.url, altTextFromFileName(file.name));
    } catch (err) {
      setError(err.messageKey ? t(err.messageKey) : err.message || t('blog.imageUploadFailed'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBodyKeyDown = (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      applyBodyFormat('bold');
    } else if (key === 'i') {
      event.preventDefault();
      applyBodyFormat('italic');
    } else if (key === 'k') {
      event.preventDefault();
      applyBodyFormat('link');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin || isPreviewReview || saving) return;

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
        throw new Error(data.message || t('blog.saveFailed'));
      }
      if (!data.post?.slug) {
        throw new Error(t('blog.saveFailed'));
      }
      const nextPath =
        data.post.status === 'draft'
          ? `/alejandroluis/blog/${data.post.slug}/edit`
          : `/alejandroluis/blog/${data.post.slug}`;
      navigate(nextPath);
    } catch (err) {
      setError(err.message || t('blog.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const showComposer = authStatus === 'ready' && canCompose && !notFound;

  return (
    <div className="blog-composer">
      <BlogChrome editSlug={isEdit && isAdmin ? routeSlug : undefined} />
      <main className="blog-composer__main">
        {authStatus === 'loading' || loading ? (
          <LoadingStatus>{t('blog.loadingComposer')}</LoadingStatus>
        ) : !showComposer ? (
          <div className="blog-composer__missing">
            <h1 className="blog-composer__title">{t('blog.notFound')}</h1>
            <p className="blog-composer__copy">{t('blog.notFoundCopy')}</p>
          </div>
        ) : (
          <form className="blog-composer__form" onSubmit={handleSubmit}>
            <h1 className="blog-composer__title">
              {isEdit && !isPreviewReview ? t('blog.editTitle') : t('blog.newTitle')}
            </h1>
            {isPreviewReview ? (
              <p className="blog-composer__banner" role="status">
                {t('blog.previewReview')}
              </p>
            ) : null}
            <label className="blog-composer__label" htmlFor="blog-title">
              {t('blog.fieldTitle')}
            </label>
            <input
              id="blog-title"
              className="blog-composer__input"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              required
            />
            <label className="blog-composer__label" htmlFor="blog-slug">
              {t('blog.fieldSlug')}
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
              {t('blog.fieldCategory')}
            </label>
            <select
              id="blog-category"
              className="blog-composer__input"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
            >
              {BLOG_CATEGORIES.map((slug) => (
                <option key={slug} value={slug}>
                  {blogCategoryLabel(slug)}
                </option>
              ))}
            </select>
            <label className="blog-composer__label" htmlFor="blog-excerpt">
              {t('blog.fieldExcerpt')}
            </label>
            <textarea
              id="blog-excerpt"
              className="blog-composer__textarea blog-composer__textarea--short"
              value={form.excerpt}
              onChange={(event) => updateField('excerpt', event.target.value)}
            />
            <label className="blog-composer__label" htmlFor="blog-body">
              {t('blog.fieldBody')}
            </label>
            <p className="blog-composer__hint">{t('blog.formatHint')}</p>
            <div className="blog-composer__format" role="toolbar" aria-label={t('blog.formatLabel')}>
              <button
                type="button"
                className="blog-composer__format-button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyBodyFormat('bold')}
              >
                {t('blog.formatBold')}
              </button>
              <button
                type="button"
                className="blog-composer__format-button blog-composer__format-button--italic"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyBodyFormat('italic')}
              >
                {t('blog.formatItalic')}
              </button>
              <button
                type="button"
                className="blog-composer__format-button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyBodyFormat('link')}
              >
                {t('blog.formatLink')}
              </button>
              <button
                type="button"
                className="blog-composer__format-button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleImageButtonClick}
                disabled={uploadingImage}
              >
                {uploadingImage ? t('blog.imageUploading') : t('blog.formatImage')}
              </button>
            </div>
            <input
              ref={imageInputRef}
              className="blog-composer__file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelected}
              tabIndex={-1}
              aria-hidden="true"
            />
            <textarea
              id="blog-body"
              ref={bodyRef}
              className="blog-composer__textarea"
              value={form.body}
              onChange={(event) => updateField('body', event.target.value)}
              onKeyDown={handleBodyKeyDown}
              required
            />
            <fieldset className="blog-composer__status">
              <legend className="blog-composer__label">{t('blog.fieldStatus')}</legend>
              <label className="blog-composer__choice">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={() => updateField('status', 'draft')}
                />
                {t('blog.statusDraft')}
              </label>
              <label className="blog-composer__choice">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === 'published'}
                  onChange={() => updateField('status', 'published')}
                />
                {t('blog.statusPublished')}
              </label>
            </fieldset>
            {error ? (
              <p className="blog-composer__error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="blog-composer__submit"
              disabled={saving || isPreviewReview}
            >
              {saving ? t('blog.saving') : t('blog.save')}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default BlogComposer;
