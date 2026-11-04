import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CompassIcon from '../../Components/CompassIcon/CompassIcon.jsx';
import JournalConfirmModal from '../../Components/JournalConfirmModal/JournalConfirmModal.jsx';
import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import SummaryCommentModal from '../../Components/SummaryCommentModal/SummaryCommentModal.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useLocale } from '../../Context/LocaleContext.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';
import { COMPASS_ITEM_MAX_CHARS } from '../../utils/compass.js';
import './JournalCompass.css';

const DEFAULT_LIMITS = { goal: 3, memory: 15, chars: COMPASS_ITEM_MAX_CHARS };

const SECTIONS = [
  {
    kind: 'goal',
    listKey: 'goals',
    headingKey: 'compass.goals',
    helpKey: 'compass.goalsHelp',
    helpEmptyKey: 'compass.goalsHelp',
    examples: ['compass.goalExample1', 'compass.goalExample2', 'compass.goalExample3'],
    addKey: 'compass.addGoal',
    fullKey: 'compass.goalsFull',
    editKey: 'compass.editGoal',
    removeKey: 'compass.removeGoal',
    addTitleKey: 'compass.addGoalTitle',
    fieldKey: 'compass.goalField',
    placeholderKey: 'compass.goalPlaceholder',
    deleteTitleKey: 'compass.deleteGoalTitle',
  },
  {
    kind: 'memory',
    listKey: 'memories',
    headingKey: 'compass.memories',
    helpKey: 'compass.memoriesHelp',
    helpEmptyKey: 'compass.memoriesHelpEmpty',
    examples: [
      'compass.memoryExample1',
      'compass.memoryExample2',
      'compass.memoryExample3',
      'compass.memoryExample4',
    ],
    addKey: 'compass.addMemory',
    fullKey: 'compass.memoriesFull',
    editKey: 'compass.editMemory',
    removeKey: 'compass.removeMemory',
    addTitleKey: 'compass.addMemoryTitle',
    fieldKey: 'compass.memoryField',
    placeholderKey: 'compass.memoryPlaceholder',
    deleteTitleKey: 'compass.deleteMemoryTitle',
  },
];

const sectionFor = (kind) => SECTIONS.find((section) => section.kind === kind);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M5 7h14" />
    <path d="M10 7V5h4v2" />
    <path d="M7 7l1 13h8l1-13" />
  </svg>
);

const JournalCompass = () => {
  const { user, status } = useAuth();
  const { t } = useLocale();
  const [compass, setCompass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadCompass = useCallback(async () => {
    if (status !== 'ready' || !user) {
      setCompass(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/me/compass');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t('compass.loadFailed'));
      setCompass({
        goals: Array.isArray(data.goals) ? data.goals : [],
        memories: Array.isArray(data.memories) ? data.memories : [],
        limits: { ...DEFAULT_LIMITS, ...(data.limits ?? {}) },
        pendingSuggestionCount: data.pendingSuggestionCount ?? 0,
      });
    } catch (err) {
      console.error('[compass GET]', err);
      setCompass(null);
      emitToast(err.message || t('compass.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [status, t, user]);

  useEffect(() => {
    loadCompass();
  }, [loadCompass]);

  const replaceItem = (saved) =>
    setCompass((prev) => {
      if (!prev) return prev;
      const { listKey } = sectionFor(saved.kind);
      const list = prev[listKey];
      const exists = list.some((entry) => entry.id === saved.id);
      return {
        ...prev,
        [listKey]: exists
          ? list.map((entry) => (entry.id === saved.id ? saved : entry))
          : [...list, saved],
      };
    });

  const saveForm = async (content) => {
    if (!form || saving) return;
    setSaving(true);
    try {
      const res = form.item
        ? await apiFetch(`/auth/me/compass/items/${encodeURIComponent(form.item.id)}`, {
            method: 'PATCH',
            body: { content },
          })
        : await apiFetch('/auth/me/compass/items', {
            method: 'POST',
            body: { kind: form.kind, content },
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.item) {
        emitToast(data.message || t('compass.saveFailed'));
        return;
      }
      replaceItem(data.item);
      setForm(null);
    } catch (err) {
      console.error('[compass save]', err);
      emitToast(t('compass.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      const res = await apiFetch(
        `/auth/me/compass/items/${encodeURIComponent(pendingDelete.id)}`,
        { method: 'DELETE' },
      );
      if (!res.ok && res.status !== 404) {
        const data = await res.json().catch(() => ({}));
        emitToast(data.message || t('compass.deleteFailed'));
        return;
      }
      const { listKey } = sectionFor(pendingDelete.kind);
      setCompass((prev) =>
        prev
          ? { ...prev, [listKey]: prev[listKey].filter((entry) => entry.id !== pendingDelete.id) }
          : prev,
      );
      setPendingDelete(null);
    } catch (err) {
      console.error('[compass delete]', err);
      emitToast(t('compass.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const isEmpty = compass && compass.goals.length === 0 && compass.memories.length === 0;
  const pendingCount = compass?.pendingSuggestionCount ?? 0;
  const formSection = form ? sectionFor(form.kind) : null;

  return (
    <div className="journal-page journal-page--compass">
      <Navigation />
      <main className="journal-page__main journal-compass__main">
        <header className="journal-compass__header">
          <h1 className="journal-compass__title">{t('compass.title')}</h1>
          <p className="journal-compass__intro">
            {isEmpty || !compass ? t('compass.introEmpty') : t('compass.intro')}
          </p>
        </header>

        {status === 'loading' && <LoadingStatus>{t('compass.loading')}</LoadingStatus>}

        {status === 'ready' && !user && (
          <div className="journal-compass__empty">
            <p>{t('compass.guestEmpty')}</p>
            <Link to="/login" className="journal-compass__action-link">
              {t('compass.login')}
            </Link>
          </div>
        )}

        {status === 'ready' && user && loading && (
          <LoadingStatus>{t('compass.loadingItems')}</LoadingStatus>
        )}

        {status === 'ready' && user && !loading && compass && (
          <>
            {pendingCount > 0 && (
              <Link to="/journal/summary" className="journal-compass__banner">
                <CompassIcon size={22} className="journal-compass__banner-icon" />
                <span className="journal-compass__banner-text">
                  {pendingCount === 1
                    ? t('compass.bannerOne')
                    : t('compass.bannerMany', { count: pendingCount })}
                </span>
                <span className="journal-compass__banner-action">{t('compass.review')}</span>
              </Link>
            )}

            {SECTIONS.map((section) => {
              const items = compass[section.listKey];
              const limit = compass.limits[section.kind];
              const full = items.length >= limit;
              const headingId = `compass-${section.kind}-heading`;
              return (
                <section
                  key={section.kind}
                  className="journal-compass__section"
                  aria-labelledby={headingId}
                >
                  <div className="journal-compass__section-top">
                    <h2 id={headingId} className="journal-compass__heading">
                      {t(section.headingKey)}
                    </h2>
                    <span className="journal-compass__count">
                      {t('compass.count', { count: items.length, limit })}
                    </span>
                  </div>
                  <p className="journal-compass__help">
                    {t(items.length === 0 ? section.helpEmptyKey : section.helpKey)}
                  </p>

                  {items.length === 0 ? (
                    <div className="journal-compass__examples">
                      <p className="journal-compass__examples-label">
                        {t('compass.examplesLabel')}
                      </p>
                      <div className="journal-compass__chips">
                        {section.examples.map((key) => (
                          <button
                            key={key}
                            type="button"
                            className="journal-compass__chip"
                            onClick={() =>
                              setForm({ kind: section.kind, initial: t(key) })
                            }
                          >
                            {t(key)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <ul className="journal-compass__list">
                      {items.map((entry) => (
                        <li key={entry.id} className="journal-compass__item">
                          <p className="journal-compass__item-text">{entry.content}</p>
                          <button
                            type="button"
                            className="journal-compass__icon-button"
                            aria-label={t(section.editKey)}
                            onClick={() =>
                              setForm({ kind: section.kind, item: entry, initial: entry.content })
                            }
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="journal-compass__icon-button"
                            aria-label={t(section.removeKey)}
                            onClick={() => setPendingDelete(entry)}
                          >
                            <TrashIcon />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {full ? (
                    <p className="journal-compass__full">{t(section.fullKey)}</p>
                  ) : (
                    <button
                      type="button"
                      className="journal-compass__add"
                      onClick={() => setForm({ kind: section.kind, initial: '' })}
                    >
                      <PlusIcon />
                      {t(section.addKey)}
                    </button>
                  )}
                </section>
              );
            })}

            {isEmpty && <p className="journal-compass__note">{t('compass.suggestNote')}</p>}
          </>
        )}
      </main>

      {form && formSection && (
        <SummaryCommentModal
          key={form.item?.id ?? `new-${form.kind}`}
          labelledById="compass-form-title"
          fieldId="compass-form-text"
          title={form.item ? t(formSection.editKey) : t(formSection.addTitleKey)}
          fieldLabel={form.item ? t('compass.newTextField') : t(formSection.fieldKey)}
          placeholder={t(formSection.placeholderKey)}
          addLabel={t('compass.save')}
          cancelLabel={t('compass.cancel')}
          initialNote={form.initial}
          maxLength={COMPASS_ITEM_MAX_CHARS}
          onClose={() => setForm(null)}
          onAdd={saveForm}
        />
      )}

      {pendingDelete && (
        <JournalConfirmModal
          labelledById="compass-delete-title"
          title={t(sectionFor(pendingDelete.kind).deleteTitleKey)}
          text={pendingDelete.content}
          onClose={() => setPendingDelete(null)}
          primary={{
            label: t('compass.deleteConfirm'),
            onClick: confirmDelete,
            disabled: deleting,
          }}
          secondary={{
            label: t('compass.deleteCancel'),
            onClick: () => setPendingDelete(null),
            disabled: deleting,
          }}
        />
      )}
    </div>
  );
};

export default JournalCompass;
