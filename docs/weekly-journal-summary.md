# Weekly Journal Summary — Feature Design

**Status:** V1 released. Sunday window replaced by a 2-per-week generation quota.  
**Module:** Journaling (`/journal`)  
**Product intent:** Turn saved writings into a weekly self-reflection ritual, not just storage.

---

## 1. Problem

Users can write and store journal entries (including transcribed handwriting), but the app currently offers little reason to return to that material. Without a reflection loop, journaling risks feeling like a dump rather than a mirror.

## 2. Goal (v1)

Once per week, a logged-in user can generate an AI-powered weekly reflection with four sections:

1. **Weekly summary** — plain-language overview of what they wrote and the main topics.
2. **Best quote** — one sentence (or short passage) from their own writing that deserves to be seen again.
3. **Socratic prompt** — one question or piece of advice in a Socratic style that invites further thinking (not therapy, not diagnosis).
4. **Machiavellian challenge** — one practical strategic observation that tests whether the user's behavior supports their stated goal.

## 3. User experience

### Happy path

1. User journals during the week (existing `/journal` flow).
2. User opens `/journal/summary` whenever they want.
3. If no summary exists for the current quota week yet:
   - Page shows remaining quota and a create CTA (when there are at least 2 entries in the last 7 days).
   - User clicks → 30s countdown ritual (then optional “Still loading” overtime) while the backend generates.
   - Results render in four sections on the same page.
4. If a summary already exists for that week:
   - Page shows the stored result.
   - A regenerate button is available while quota remains (second generation overwrites the stored row).

### After the weekly quota is spent

- `/journal/summary` remains reachable.
- The remaining-generations counter reads as exhausted until next Monday 00:00 Europe/Madrid.
- Create and regenerate CTAs are hidden.
- The stored summary stays readable.

### Empty / edge cases

| Case | Behavior |
|---|---|
| Not logged in | Same pattern as journal history: prompt login |
| Zero entries in the last 7 days | Do not call the model; show empty state asking them to write first |
| Very few / very short entries | Still allow generation; prompt should ask model to be honest about sparse material |
| Generation fails / timeout | Loading restarts the 30s ritual (up to 3 attempts). After that, the page shows “please try later”. |
| User deletes an entry after summary | Summary stays as a snapshot of that week (do not invalidate) |

## 4. Scope boundaries (v1)

**In scope**
- On-demand generation (user click), not a background cron
- Persist one summary per user per week (second generation overwrites)
- Four structured outputs from the model
- Server-enforced quota of 2 generations per ISO week
- Remaining-generations counter on the summary page
- Auth-required API under existing `/auth/me/...` patterns

**Out of scope (later)**
- Push/email reminders
- Multi-week archive UI / comparison across weeks
- Paid-role gating (journal is auth-only today; keep that unless product decides otherwise)
- Including Thoughts Test `localStorage` journals (they are not in Postgres)
- Streaming tokens, async job queues, or webhooks
- Clinical language, mood scores, or “diagnosis-like” framing

## 5. Architecture (fits current stack)

Stack today: React/Vite frontend, Express backend on Vercel (`maxDuration: 60`), Postgres via `pg`, Hugging Face `InferenceClient` for LLM/vision, JWT cookie auth.

```
[Journal pages]
    │ /journal/summary
    ▼
[/journal/summary]
    │ GET availability + quota + existing summary
    │ POST generate (up to twice per week)
    ▼
[auth routes + requireAuth]
    │
    ├─ list week entries (date-range query on journal_entries)
    ├─ enforce 2 generations / ISO week (server)
    ├─ uniqueness (one stored summary / user / week; upsert on regenerate)
    └─ HF chatCompletion → parse JSON → persist → return
```

### Why on-demand (not cron)

- No job runner / Vercel cron exists today.
- Generation only when the user is present matches the ritual UX and avoids paying for unused summaries.
- Server still enforces the weekly quota and uniqueness so the client cannot bypass limits.

### Timeout risk

Backend Vercel `maxDuration` is **60s**. Each generate attempt aborts the model call at **45s**. Mitigation:

- Cap total input characters (newest-first truncate to ~10k chars).
- Prefer **one** model call that returns all four sections as structured JSON (one round-trip).
- Keep the summary at **400–600 words**.
- Client and server share the 45s abort; the client retries twice with a fresh loading ritual, then shows “please try later”.
- A rolling cap of 3 generate POSTs per 15 minutes blocks clients that ignore that limit.

## 6. Data model

New migration: `backend/src/db/migrations/004_journal_weekly_summaries.sql`
(`generation_count` added later by `009_journal_summary_generation_count.sql`; generate-attempt log by `010_journal_summary_generate_attempts.sql`)

```sql
CREATE TABLE journal_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,          -- Monday of the ISO week (product timezone date)
  week_end DATE NOT NULL,            -- Sunday of that week
  period_start TIMESTAMPTZ NOT NULL, -- inclusive start of the last-7-days query
  period_end TIMESTAMPTZ NOT NULL,   -- exclusive end of that query
  summary_text TEXT NOT NULL,
  main_topics TEXT[] NOT NULL DEFAULT '{}',
  best_quote TEXT NOT NULL,
  best_quote_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  socratic_text TEXT NOT NULL,
  machiavelli_text TEXT,
  entry_count INTEGER NOT NULL,
  model_id TEXT,                     -- which HF model produced this
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generation_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE (user_id, week_start)
);

CREATE INDEX journal_weekly_summaries_user_created_idx
  ON journal_weekly_summaries (user_id, created_at DESC);
```

Also extend entry listing with a date-range helper (no schema change needed on `journal_entries`; `created_at` is already indexed).

**Invariant:** At most one summary row per `(user_id, week_start)`. At most two successful generations per week; the third POST is rejected even if the unique constraint would allow an overwrite.

## 7. API shape

Mount next to existing journal routes in `backend/src/auth/auth.routes.js`.

### `GET /auth/me/journal-summaries/current`

Returns quota + week metadata + summary if present. Create vs regenerate is
computed on the frontend from this payload (see
`frontend/src/utils/summaryAvailability.js`).

```json
{
  "weekStart": "2026-07-23",
  "weekEnd": "2026-07-29",
  "quota": {
    "timezone": "Europe/Madrid",
    "limit": 2,
    "used": 0,
    "remaining": 2,
    "resetsAt": "2026-08-02T22:00:00.000Z"
  },
  "entryCount": 5,
  "minEntries": 2,
  "summary": null
}
```

Frontend `canCreate` = no displayed summary + `entryCount >= minEntries` +
`quota.remaining > 0`. `canRegenerate` = a summary exists and quota remains.

### `POST /auth/me/journal-summaries/current`

- Requires auth
- Server recomputes the quota week and the last-7-days entry window from the current time
- Rejects with `429` when `generation_count` already equals the weekly limit
  (checked before the model call; the upsert is the authoritative guard)
- Loads entries from the last 7 calendar days (`[period_start, period_end)`)
- Calls model, validates JSON, upserts the row for `(user_id, week_start)`
  (replaces any existing summary; increments `generation_count`; refreshes `created_at`)
- Returns the created/updated summary plus the inclusive `weekStart` / `weekEnd` dates of the rolling window (for the page label)
- Errors: `422` if fewer than `minEntries` entries; `429` if quota is spent;
  `502`/`503` on generation failures

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
| Summary | Evidence-based philosophical reflection, **400–600 words**; recognize healthy insight and earnestness when present; flag supported incongruities; match the active UI language; no clinical labels |
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
| Page | `frontend/src/Pages/JournalSummary/JournalSummary.jsx` |
| Loading | 30s countdown ritual (bar to 99%, three quotes), then up to 15s glowing “Still loading”; 100% only when the POST succeeded. Timeouts restart the ritual up to 3 attempts. |
| Quota | Remaining-generations counter on the summary page; Create vs Regenerar gated by `canCreate` / `canRegenerate` |
| Result layout | Four stacked sections (not a dashboard of cards): Summary → Best quote → Socratic prompt → Machiavellian challenge |
| History link | From journal header area: “Resumen” next to “Escribir” / history patterns |

Guest / auth behavior should match `JournalHistory.jsx`.

## 10. Weekly quota

Locked defaults:

- **Timezone:** `Europe/Madrid`
- **Week:** Monday 00:00 inclusive → next Monday 00:00 exclusive
- **Limit:** 2 successful generations per week
- **Reset:** next Monday 00:00 Europe/Madrid (`quota.resetsAt`)
- **Entry window:** last 7 calendar days in Europe/Madrid (today inclusive), independent of the quota week
- **Storage:** one row per `(user_id, week_start)` for the quota week; `period_start` / `period_end` store the rolling window actually summarized. The page label uses that stored range after generation, or the current rolling window when none exists.

Implementation: week bounds and quota payload live on the server
(`backend/src/journalSummaries/summaryWeek.js`). The SPA derives CTAs from
`quota.remaining` but is not the authority — `POST /current` returns `429` when
the limit is spent.

## 11. Suggested implementation slices

Build in thin vertical slices; each slice shippable alone.

1. **Quota + status API** — `GET current` with `quota` / `entryCount` / `summary`; frontend derives create/regenerate.
2. **Summary page shell** — wired to GET; empty / ready / exhausted states.
3. **Persistence + POST without LLM** — stubbed summary text for local/dev to prove quota + UX.
4. **Real LLM generation** — prompt, parse, store, loading screen tied to request.
5. **Polish** — copy, error/retry, quote attribution, basic tests.

## 12. Testing plan

- Unit: week bounds around DST edges (`Europe/Madrid`) and quota remaining arithmetic.
- Unit: prompt input truncation / JSON parse failure handling.
- API: third create in the same week 429; zero entries 422.
- Frontend: states for ready / exhausted / loading / result / error (Vitest patterns like `Journal.test.jsx`).
- Manual: generate with a week of mixed-topic entries; verify quote appears in source text.

## 13. Locked product decisions (V1)

1. **Availability:** anytime during the ISO week. No Sunday creation window.
2. **Quota:** 2 successful generations per ISO week (Monday 00:00 Europe/Madrid). The second overwrites the stored summary.
   **Entry window:** last 7 calendar days ending today, independent of that quota week.
3. **Regeneration:** `REGENERAR RESUMEN` is a product control, gated by remaining quota. Retry still applies when generation fails (failed calls do not consume quota).
4. **Minimum writing:** At least **2 entries** in the last 7 days. No minimum character count.
5. **Access:** All logged-in users (same as journal today).
6. **Socratic tone:** Sharper / challenging (tunable later).
7. **Machiavellian tone:** Practical and strategic; challenge the user's incentives without recommending manipulation.
8. **Copy language:** Bilingual UI (English default). Weekly summaries are generated in the active UI language at request time. Stored summaries keep their generated language until the user regenerates them.

### Quota enforcement

`SUMMARY_GENERATIONS_PER_WEEK` in `backend/src/journalSummaries/summaryWeek.js`
is **2**. `GET /current` returns `quota`. `POST /current` rejects a third
generation with `429` before calling the model, and the upsert refuses to
increment past the limit.

## 14. Success criteria

- Users who write during the week can generate a reflection when it is useful to them, not only on Sunday.
- Summary feels personal (topics + quote from *their* text), not generic wellness filler.
- Socratic section produces a question the user could actually journal about next.
- Machiavellian section exposes whether the user's strategy supports their stated goal.
- Creation cannot be spammed: two generations per week, enforced server-side.
- Experience stays within the 60s serverless budget; each attempt is killed at 45s.
