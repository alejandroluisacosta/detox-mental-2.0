# Weekly Journal Summary — Feature Design

**Status:** V1 in progress (implementation on branch; Sunday window bypassed for local testing)  
**Module:** Journaling (`/journal`)  
**Product intent:** Turn saved writings into a weekly self-reflection ritual, not just storage.

---

## 1. Problem

Users can write and store journal entries (including transcribed handwriting), but the app currently offers little reason to return to that material. Without a reflection loop, journaling risks feeling like a dump rather than a mirror.

## 2. Goal (v1)

Once per week, during a limited time window, a logged-in user can generate an AI-powered weekly reflection with four sections:

1. **Weekly summary** — plain-language overview of what they wrote and the main topics.
2. **Best quote** — one sentence (or short passage) from their own writing that deserves to be seen again.
3. **Socratic prompt** — one question or piece of advice in a Socratic style that invites further thinking (not therapy, not diagnosis).
4. **Machiavellian challenge** — one practical strategic observation that tests whether the user's behavior supports their stated goal.

## 3. User experience

### Happy path

1. User journals during the week (existing `/journal` flow).
2. On **Sunday, 12:00–18:00** (local product timezone — see open decisions), the app surfaces an alert/CTA: *“Tu resumen semanal está disponible.”*
3. User opens `/journal/summary`.
4. If no summary exists for the current week yet:
   - Page shows a create CTA.
   - User clicks → loading screen (reuse Thoughts Test loading pattern) while the backend generates.
   - Results render in four sections on the same page.
5. If a summary already exists for that week:
   - Page shows the stored result (no re-generation in v1).

### Outside the window

- `/journal/summary` remains reachable (or optionally linked from history), but:
  - No “available for creation” alert.
  - Create button disabled / replaced with copy explaining next window.
  - If a prior summary exists, user can still **read** it (recommended — otherwise missing Sunday loses the value).

### Empty / edge cases

| Case | Behavior |
|---|---|
| Not logged in | Same pattern as journal history: prompt login |
| Zero entries in the week | Do not call the model; show empty state asking them to write first |
| Very few / very short entries | Still allow generation; prompt should ask model to be honest about sparse material |
| Generation fails / timeout | Loading ends with error toast + retry (if still inside window and no row stored) |
| User deletes an entry after summary | Summary stays as a snapshot of that week (do not invalidate) |

## 4. Scope boundaries (v1)

**In scope**
- On-demand generation (user click), not a background cron
- Persist one summary per user per week
- Four structured outputs from the model
- Availability window for *creation*
- Journal-module page + in-app CTA during the window
- Auth-required API under existing `/auth/me/...` patterns

**Out of scope (later)**
- Push/email reminders that the window is open
- Regenerating or editing summaries
- Multi-week archive UI / comparison across weeks
- Paid-role gating (journal is auth-only today; keep that unless product decides otherwise)
- Including Thoughts Test `localStorage` journals (they are not in Postgres)
- Streaming tokens, async job queues, or webhooks
- Clinical language, mood scores, or “diagnosis-like” framing

## 5. Architecture (fits current stack)

Stack today: React/Vite frontend, Express backend on Vercel (`maxDuration: 20`), Postgres via `pg`, Hugging Face `InferenceClient` for LLM/vision, JWT cookie auth.

```
[Journal pages]
    │ CTA when window open
    ▼
[/journal/summary]
    │ GET availability + existing summary
    │ POST generate (once)
    ▼
[auth routes + requireAuth]
    │
    ├─ list week entries (date-range query on journal_entries)
    ├─ enforce Sunday window (server)
    ├─ enforce uniqueness (one summary / user / week)
    └─ HF chatCompletion → parse JSON → persist → return
```

### Why on-demand (not cron)

- No job runner / Vercel cron exists today.
- Generation only when the user is present matches the ritual UX and avoids paying for unused summaries.
- Server still enforces the time window and uniqueness so the client cannot bypass limits.

### Timeout risk

Backend Vercel `maxDuration` is **20s**. Mitigation for v1:

- Cap total input characters (e.g. newest-first truncate to ~8–12k chars).
- Prefer **one** model call that returns all four sections as structured JSON (one round-trip).
- Keep output short (summary paragraphs + one quote + one Socratic item + one Machiavellian challenge).
- If timeouts appear in practice, revisit: faster/smaller model, raise `maxDuration`, or async generation.

## 6. Data model

New migration: `backend/src/db/migrations/004_journal_weekly_summaries.sql`

```sql
CREATE TABLE journal_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,          -- Monday of the ISO week (product timezone date)
  week_end DATE NOT NULL,            -- Sunday of that week
  period_start TIMESTAMPTZ NOT NULL, -- inclusive UTC instant used for entry query
  period_end TIMESTAMPTZ NOT NULL,   -- exclusive UTC instant
  summary_text TEXT NOT NULL,
  main_topics TEXT[] NOT NULL DEFAULT '{}',
  best_quote TEXT NOT NULL,
  best_quote_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  socratic_text TEXT NOT NULL,
  machiavelli_text TEXT,
  entry_count INTEGER NOT NULL,
  model_id TEXT,                     -- which HF model produced this
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX journal_weekly_summaries_user_created_idx
  ON journal_weekly_summaries (user_id, created_at DESC);
```

Also extend entry listing with a date-range helper (no schema change needed on `journal_entries`; `created_at` is already indexed).

**Invariant:** At most one summary row per `(user_id, week_start)`. Creation outside the window is rejected by the API even if the unique constraint would allow a late write.

## 7. API shape

Mount next to existing journal routes in `backend/src/auth/auth.routes.js`.

### `GET /auth/me/journal-summaries/current`

Returns window + week metadata + summary if present. Creation gating is
computed on the frontend from this payload (see
`frontend/src/utils/summaryAvailability.js`).

```json
{
  "weekStart": "2026-07-27",
  "weekEnd": "2026-08-02",
  "window": {
    "timezone": "Europe/Madrid",
    "open": true,
    "enforced": true,
    "opensAt": "2026-08-02T10:00:00.000Z",
    "closesAt": "2026-08-02T16:00:00.000Z"
  },
  "entryCount": 5,
  "minEntries": 2,
  "summary": null
}
```

Frontend `canCreate` = window open + no displayed (non-stale) summary +
`entryCount >= minEntries`. A summary is stale when `createdAt < window.opensAt`
while the window is open (hidden so a new week’s create CTA can appear).

### `POST /auth/me/journal-summaries/current`

- Requires auth
- Server recomputes week bounds from the current time
- Loads entries in `[period_start, period_end)`
- Calls model, validates JSON, upserts the row for `(user_id, week_start)`
  (replaces any existing summary; refreshes `created_at`)
- Returns the created/updated summary
- Errors: `422` if fewer than `minEntries` entries; `502`/`503` on generation
  failures
- Does **not** enforce the Sunday window or reject an existing summary —
  the SPA decides when to show Create vs Regenerate

### Optional later

`GET /auth/me/journal-summaries` — history list (out of scope for v1 UI, schema already supports it).

## 8. AI design

### Reuse

- `InferenceClient` + `HF_TOKEN` (same as onboarding / transcription)
- Output cleanup helpers like `normalizeLlmOutput.js` where useful
- New prompt module, e.g. `backend/src/journalSummaries/prompts.js`

### Single structured completion

Ask the model for JSON only:

```json
{
  "summary": "...",
  "mainTopics": ["...", "..."],
  "bestQuote": "...",
  "socratic": "...",
  "machiavelli": "..."
}
```

Prompt responsibilities:

| Section | Instruction sketch |
|---|---|
| Summary | Evidence-based philosophical reflection: recognize healthy insight and earnestness when present; flag supported incongruities; use user’s language (Spanish); no clinical labels |
| Main topics | 2–5 short labels; may align with existing chips (`work`, `interpersonal`, …) but can be freer |
| Best quote | Must be a **verbatim or near-verbatim** excerpt from the provided entries; prefer the week's central insight, tension, or moment of honesty; never invent |
| Socratic | One precise question or statement that pushes from what the user already understands; expose a real contradiction if present, otherwise the strongest unanswered implication; no invented tension, no lectures, no “you should”, no diagnosis |
| Machiavellian | One practical strategic observation about whether behavior matches stated goals; recognize coherent strategy when evidence supports it; no forced mismatch, no manipulation advice |

Also pass entry ids + timestamps so the backend can optionally attach `best_quote_entry_id` by matching the quote substring; if no match, store quote text and leave FK null.

### Safety / product voice

- Frame as self-reflection companion, not a therapist.
- If content suggests crisis, prefer a short redirect-to-help style refusal for the Socratic section only (keep summary factual) — exact copy TBD with product.
- Never invent diary events that were not in the source text.

## 9. Frontend plan

| Piece | Approach |
|---|---|
| Route | `/journal/summary` in `App.jsx` beside existing journal routes |
| Page | `frontend/src/Pages/Journal/JournalSummary.jsx` (+ CSS in `Journal.css` or sibling) |
| Loading | Adapt `TestLoadingScreen` pattern: progress + reflective quote, but `onDone` waits for **real** `POST` (or `Promise.all` of min display time + request) |
| CTA / alert | Banner on `/journal` when frontend `canCreate` (window open, non-stale, enough entries) |
| Result layout | Four stacked sections (not a dashboard of cards): Summary → Best quote → Socratic prompt → Machiavellian challenge |
| History link | From journal header area: “Resumen” next to “Escribir” / history patterns |

Guest / auth behavior should match `JournalHistory.jsx`.

## 10. Availability window

Proposed defaults (confirm before coding):

- **Timezone:** `Europe/Madrid` (product is Spanish-first)
- **Day:** Sunday
- **Hours:** 12:00–18:00 inclusive start, exclusive end
- **Week contents:** Monday 00:00 → Sunday 24:00 in that timezone (ISO week), i.e. the week that just concluded when Sunday’s window opens

Implementation detail: pure functions in a small shared-style module on the **server** (`getCurrentWeekBounds`, `isSummaryWindowOpen`). Frontend may duplicate display helpers but must not be the authority.

Closest existing pattern: client date gate in `promoConfig.js` / `PromoGate` — reuse the *idea*, not the promo code path. Enforcement for creation must be server-side.

## 11. Suggested implementation slices

Build in thin vertical slices; each slice shippable alone.

1. **Window + status API** — `GET current` with `open` / `entryCount` / `summary`; frontend derives create availability.
2. **Summary page shell + CTA banner** — wired to GET; empty / closed / ready states.
3. **Persistence + POST without LLM** — stubbed summary text for local/dev to prove uniqueness + UX.
4. **Real LLM generation** — prompt, parse, store, loading screen tied to request.
5. **Polish** — copy, error/retry, quote attribution, basic tests.

## 12. Testing plan

- Unit: week bounds + window open/closed around DST edges (`Europe/Madrid`).
- Unit: prompt input truncation / JSON parse failure handling.
- API: create once → second create 409; outside window 403; zero entries 422.
- Frontend: states for closed / ready / loading / result / error (Vitest patterns like `Journal.test.jsx`).
- Manual: generate with a week of mixed-topic entries; verify quote appears in source text.

## 13. Locked product decisions (V1)

1. **Window:** Sunday 12:00–18:00, `Europe/Madrid`.
2. **Missed Sunday:** No late creation. Summaries remain **readable anytime** after they exist.
3. **Regeneration:** Temporary testing `REGENERAR RESUMEN` button on the summary
   page calls the same `POST /current` (upsert). Remove that button to restore
   one-create-per-window UX. Retry still applies when generation fails (no row).
4. **Minimum writing:** At least **2 entries** in the week. No minimum character count.
5. **Access:** All logged-in users (same as journal today).
6. **Socratic tone:** Sharper / challenging (tunable later).
7. **Machiavellian tone:** Practical and strategic; challenge the user's incentives without recommending manipulation.
8. **Copy language:** Bilingual UI (English default). Weekly summaries are generated in the active UI language at request time. Stored summaries keep their generated language until the user regenerates them.

### Window enforcement

`ENFORCE_SUMMARY_WINDOW` in `backend/src/journalSummaries/summaryWindow.js` is
**`true`**. The SPA uses `window.open` / `window.opensAt` for create CTA and
stale-summary hiding. The POST endpoint does not re-check the clock.
## 14. Success criteria

- Users who write during the week have a clear Sunday ritual that returns value from their own words.
- Summary feels personal (topics + quote from *their* text), not generic wellness filler.
- Socratic section produces a question the user could actually journal about next.
- Machiavellian section exposes whether the user's strategy supports their stated goal.
- Creation cannot be spammed from the product UI (one create CTA per Sunday
  window; temporary regenerate is explicit for testing).
- Experience stays within the 20s serverless budget for typical weekly volume.
