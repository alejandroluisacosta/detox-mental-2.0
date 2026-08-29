import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';
import {
  validateImageFile,
  prepareImageForUpload,
  MAX_UPLOAD_BYTES,
} from '../../utils/journalImage.js';
import { JOURNAL_TOPIC_IDS } from '../../data/journalTopics.js';
import { getTopicsFadeEdges } from '../../utils/journalTopicsFade.js';
import JournalSummaryBanner from '../../Components/JournalSummaryBanner/JournalSummaryBanner.jsx';
import JournalConfirmModal from '../../Components/JournalConfirmModal/JournalConfirmModal.jsx';
import './Journal.css';

const MAX_SELECTED_TOPICS = 3;

const Journal = () => {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const { t, topicLabel } = useLocale();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const topicsRef = useRef(null);
  const [text, setText] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [fadeEdges, setFadeEdges] = useState({ left: false, right: false });

  const canUseImages = status === 'ready' && !!user;
  const busy = saving || transcribing;
  const topicLimitReached = selectedTopics.length >= MAX_SELECTED_TOPICS;

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const updateFadeEdges = () => {
    const el = topicsRef.current;
    if (!el) return;
    const next = getTopicsFadeEdges(el);
    setFadeEdges((prev) =>
      prev.left === next.left && prev.right === next.right ? prev : next
    );
  };

  useEffect(() => {
    resizeTextarea();
  }, [text]);

  useEffect(() => {
    const el = topicsRef.current;
    if (!el) return undefined;

    updateFadeEdges();
    const resizeObserver = new ResizeObserver(updateFadeEdges);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleTextChange = (e) => setText(e.target.value);

  const clearComposer = () => {
    setText('');
    setSelectedTopics([]);
  };

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((item) => item !== topic);
      }
      if (prev.length >= MAX_SELECTED_TOPICS) return prev;
      return [...prev, topic];
    });
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      emitToast(t(validation.messageKey));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
  };

  const transcribeImage = async () => {
    if (!imageFile || busy) return;

    setTranscribing(true);
    try {
      const prepared = await prepareImageForUpload(imageFile);
      if (prepared.size > MAX_UPLOAD_BYTES) {
        throw new Error(t('journal.imageTooLarge'));
      }

      const formData = new FormData();
      formData.append('image', prepared, 'journal-image.jpg');

      const res = await apiFetch('/auth/me/journal-entries/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || t('journal.transcribeFailed'));
      }

      const transcribed = typeof data.text === 'string' ? data.text : '';
      setText((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${transcribed}` : transcribed));
      clearImage();
      emitToast(t('journal.transcribeSuccess'));
    } catch (err) {
      console.error('[journal transcribe]', err);
      emitToast(
        err.messageKey ? t(err.messageKey) : err.message || t('journal.transcribeFailed'),
      );
    } finally {
      setTranscribing(false);
    }
  };

  const saveEntry = async () => {
    const content = text.trim();
    if (!content || busy) return;

    setSaving(true);
    try {
      const res = await apiFetch('/auth/me/journal-entries', {
        method: 'POST',
        body: { content, topics: selectedTopics },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t('journal.saveFailed'));
      }
      clearComposer();
      emitToast(t('journal.saveSuccess'));
    } catch (err) {
      console.error('[journal POST]', err);
      emitToast(err.message || t('journal.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = () => {
    if (!text.trim() || busy || status === 'loading') return;

    if (!user) {
      setShowGuestModal(true);
      return;
    }

    saveEntry();
  };

  const handleGuestDiscard = () => {
    clearComposer();
    setShowGuestModal(false);
  };

  const handleGuestLogin = () => {
    setShowGuestModal(false);
    navigate('/login');
  };

  return (
    <div className="journal-page">
      <Navigation />
      <main className="journal-page__main">
        <JournalSummaryBanner />
        <h1 className="journal-page__prompt">{t('journal.prompt')}</h1>

        <div className="journal-page__composer">
          <div
            ref={topicsRef}
            onScroll={updateFadeEdges}
            className={`journal-page__topics${
              fadeEdges.left ? ' journal-page__topics--fade-left' : ''
            }${fadeEdges.right ? ' journal-page__topics--fade-right' : ''}`}
            role="group"
            aria-label={t('journal.topicsLabel')}
            style={{
              '--topic-cols': Math.max(1, Math.ceil(JOURNAL_TOPIC_IDS.length / 2)),
            }}
          >
            {JOURNAL_TOPIC_IDS.map((topic) => {
              const selected = selectedTopics.includes(topic);
              const disabled = busy || (!selected && topicLimitReached);
              return (
                <button
                  key={topic}
                  type="button"
                  className={`journal-page__topic-chip${selected ? ' journal-page__topic-chip--selected' : ''}`}
                  onClick={() => toggleTopic(topic)}
                  disabled={disabled}
                  aria-pressed={selected}
                >
                  {topicLabel(topic)}
                </button>
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            className="journal-page__textarea"
            value={text}
            onChange={handleTextChange}
            placeholder={t('journal.placeholder')}
            aria-label={t('journal.textLabel')}
            disabled={busy}
          />

          {canUseImages && (
            <div className="journal-page__scan">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="journal-page__file-input"
                id="journal-image-input"
                onChange={handleImageSelected}
                disabled={busy}
              />
              {!imagePreviewUrl ? (
                <button
                  type="button"
                  className="journal-page__scan-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                >
                  {t('journal.scan')}
                </button>
              ) : (
                <div className="journal-page__scan-preview">
                  <img
                    src={imagePreviewUrl}
                    alt={t('journal.scanPreviewAlt')}
                    className="journal-page__scan-image"
                  />
                  {transcribing ? (
                    <p
                      className="journal-page__scan-status"
                      role="status"
                      aria-live="polite"
                    >
                      {t('journal.transcribing')}
                    </p>
                  ) : (
                    <div className="journal-page__scan-actions">
                      <button
                        type="button"
                        className="journal-page__scan-button"
                        onClick={transcribeImage}
                        disabled={busy}
                      >
                        {t('journal.transcribe')}
                      </button>
                      <button
                        type="button"
                        className="journal-page__scan-button journal-page__scan-button--secondary"
                        onClick={clearImage}
                        disabled={busy}
                      >
                        {t('journal.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="journal-page__complete-button"
            onClick={handleComplete}
            disabled={!text.trim() || busy || status === 'loading'}
          >
            {saving ? t('journal.saving') : t('journal.complete')}
          </button>
          <Link
            to="/journal/history"
            className="journal-page__history-link"
            aria-label={t('journal.viewHistory')}
          >
            <span className="journal-page__history-icon" aria-hidden="true" />
          </Link>
        </div>
      </main>

      {showGuestModal && (
        <JournalConfirmModal
          labelledById="journal-guest-modal-title"
          title={t('journal.guestTitle')}
          text={t('journal.guestText')}
          onClose={() => setShowGuestModal(false)}
          primary={{ label: t('journal.guestLogin'), onClick: handleGuestLogin }}
          secondary={{
            label: t('journal.guestContinue'),
            onClick: handleGuestDiscard,
          }}
          closeText={t('journal.close')}
        />
      )}
    </div>
  );
};

export default Journal;
