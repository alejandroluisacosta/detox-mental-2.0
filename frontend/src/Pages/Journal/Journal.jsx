import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import CloseIcon from '../../Components/CloseIcon/CloseIcon.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';
import {
  validateImageFile,
  prepareImageForUpload,
  MAX_UPLOAD_BYTES,
} from './journalImage.js';
import './Journal.css';

const JOURNAL_TOPICS = [
  'Trabajo',
  'Interpersonal',
  'Reflexión',
  'Sabiduría',
  'Preocupaciones',
];

const MAX_SELECTED_TOPICS = 3;

const Journal = () => {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [text, setText] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [transcribing, setTranscribing] = useState(false);

  const canUseImages = status === 'ready' && !!user;
  const busy = saving || transcribing;
  const topicLimitReached = selectedTopics.length >= MAX_SELECTED_TOPICS;

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [text]);

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
      emitToast(validation.message);
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
        throw new Error('La imagen es demasiado grande. Prueba con una foto más ligera.');
      }

      const formData = new FormData();
      formData.append('image', prepared, 'journal-image.jpg');

      const res = await apiFetch('/auth/me/journal-entries/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'No se pudo transcribir la imagen.');
      }

      const transcribed = typeof data.text === 'string' ? data.text : '';
      setText((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${transcribed}` : transcribed));
      clearImage();
      emitToast('Texto transcrito. Revísalo antes de guardar.');
    } catch (err) {
      console.error('[journal transcribe]', err);
      emitToast(err.message || 'No se pudo transcribir la imagen.');
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
        throw new Error(data.message || 'No se pudo guardar la entrada.');
      }
      clearComposer();
      emitToast('Entrada guardada en tu diario.');
    } catch (err) {
      console.error('[journal POST]', err);
      emitToast(err.message || 'No se pudo guardar la entrada.');
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
        <h1 className="journal-page__prompt">¿Qué tienes en mente?</h1>

        <div className="journal-page__composer">
          <div
            className="journal-page__topics"
            role="group"
            aria-label="Temas del diario"
          >
            {JOURNAL_TOPICS.map((topic) => {
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
                  {topic}
                </button>
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            className="journal-page__textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="Escribe aquí..."
            aria-label="Texto del diario"
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
                  Escanear escritura a mano
                </button>
              ) : (
                <div className="journal-page__scan-preview">
                  <img
                    src={imagePreviewUrl}
                    alt="Vista previa de la página escrita a mano"
                    className="journal-page__scan-image"
                  />
                  {transcribing ? (
                    <p
                      className="journal-page__scan-status"
                      role="status"
                      aria-live="polite"
                    >
                      Transcribiendo...
                    </p>
                  ) : (
                    <div className="journal-page__scan-actions">
                      <button
                        type="button"
                        className="journal-page__scan-button"
                        onClick={transcribeImage}
                        disabled={busy}
                      >
                        Transcribir
                      </button>
                      <button
                        type="button"
                        className="journal-page__scan-button journal-page__scan-button--secondary"
                        onClick={clearImage}
                        disabled={busy}
                      >
                        Cancelar
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
            {saving ? 'GUARDANDO...' : 'COMPLETAR'}
          </button>
          <Link to="/journal/history" className="journal-page__history-link">
            Ver historial
          </Link>
        </div>
      </main>

      {showGuestModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuestModal(false);
          }}
        >
          <div
            className="journal-guest-modal modal-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="journal-guest-modal-title"
          >
            <CloseIcon handleCloseModal={() => setShowGuestModal(false)} />
            <h2 id="journal-guest-modal-title" className="journal-guest-modal__title">
              Esta entrada no se guardará
            </h2>
            <p className="journal-guest-modal__text">
              No has iniciado sesión. Si continúas, el texto se perderá al completar.
              Inicia sesión para guardarlo en tu diario.
            </p>
            <button
              type="button"
              className="journal-guest-modal__button"
              onClick={handleGuestLogin}
            >
              INICIAR SESIÓN
            </button>
            <button
              type="button"
              className="journal-guest-modal__button journal-guest-modal__button--secondary"
              onClick={handleGuestDiscard}
            >
              CONTINUAR SIN GUARDAR
            </button>
            <button
              type="button"
              className="journal-guest-modal__close-text"
              onClick={() => setShowGuestModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
