import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import CloseIcon from '../../Components/CloseIcon/CloseIcon.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';
import './Journal.css';

const Journal = () => {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const textareaRef = useRef(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    // Keep the growing composer (textarea end + actions) pinned in view.
    requestAnimationFrame(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
  };

  const clearComposer = () => {
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const saveEntry = async () => {
    const content = text.trim();
    if (!content || saving) return;

    setSaving(true);
    try {
      const res = await apiFetch('/auth/me/journal-entries', {
        method: 'POST',
        body: { content },
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
    if (!text.trim() || saving || status === 'loading') return;

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
          <textarea
            ref={textareaRef}
            className="journal-page__textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="Escribe aquí..."
            aria-label="Texto del diario"
            disabled={saving}
          />
          <button
            type="button"
            className="journal-page__complete-button"
            onClick={handleComplete}
            disabled={!text.trim() || saving || status === 'loading'}
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
