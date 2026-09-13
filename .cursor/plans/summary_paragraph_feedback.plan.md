---
name: Summary paragraph feedback
overview: 'Add click-to-comment on weekly summary paragraphs and a one-shot revision per fresh generation (max 4 Hugging Face calls per week), rewriting the whole summary JSON from entries + previous summary + comments.'
todos:
  - id: schema-quota
    content: 'Add feedback_count migration, map it in the service, reset on fresh upsert, add reviseWeeklySummary, document schema'
    status: completed
  - id: revise-llm
    content: Blank-line paragraph rule on generate; buildRevisionMessages + generateWeeklySummaryRevision; POST /current/revise with validation and quota
    status: completed
  - id: summary-ui
    content: 'Paragraph split helper, comment target + modal, queue/send on JournalSummary, availability + en/es copy, demo local slot'
    status: completed
  - id: tests-docs
    content: 'Prompt, availability, UI, and paragraph tests; architecture + db README; note migration apply'
    status: completed
isProject: true
---

# Weekly summary paragraph feedback

Keep the existing JSON summary. Add annotatable blocks on `/journal/summary`, queue comments, and send them to a new revise endpoint that produces a replacement summary of the same shape. No text selection, no comment history.

Implemented on branch `cursor/summary-paragraph-feedback-e4b8`, PR https://github.com/alejandroluisacosta/detox-mental-2.0/pull/89.

## Current product updates (after the original plan)

Treat these as current product truth if you continue this work:

- Comments are **per paragraph**, not one per section. Each This week paragraph can have its own note. A second tap on the same passage edits that note.
- The note icon sits on the **corner of the commented paragraph**, close to the text, including Socrates and Machiavelli. Not on the section heading.
- Revise validation accepts multiple `summaryText` comments (unique by passage), cap 20.
- Comment modal quote is capped (~250–300px) and scrolls so the modal stays on screen on mobile.
- Do not vendor `lavish-axi`. Keep the existing JSON schema and React rendering.

## Product rules

- Fresh create/regenerate stays **2 per week** (`generation_count`).
- Each displayed summary may be revised **once** (`feedback_count` 0 or 1). Regenerating resets the feedback slot. Max **4** model calls per week.
- Send replaces the stored summary. Unsent comments are discarded after a successful send **and** when the user starts Regenerar.
- Revise prompt input: this week’s entries, the current summary JSON, and the submitted comments. Tell the model this is **revision 1 of generation N of 2**, not a new summary from scratch.
- Rewrite the **whole JSON**. Quote / Socrates / Machiavelli are one click target each. The long reflection is split on blank lines into clickable paragraphs. Topic chips are not annotatable. No text selection.

```mermaid
flowchart TD
  read[User reads summary]
  click[Click paragraph or section]
  queue[Queue comment]
  send[Send comments]
  revise[POST current/revise]
  show[Replace displayed summary]
  regen[POST current regenerate]
  read --> click --> queue --> send --> revise --> show
  show --> click
  show --> regen
  regen --> show
```

## Backend

**Schema.** Add [`backend/src/db/migrations/012_journal_summary_feedback_count.sql`](backend/src/db/migrations/012_journal_summary_feedback_count.sql): `feedback_count INTEGER NOT NULL DEFAULT 0` with `CHECK (feedback_count IN (0, 1))`. Document it in [`backend/src/db/README.md`](backend/src/db/README.md).

**Persistence.** In [`journalSummaries.service.js`](backend/src/journalSummaries/journalSummaries.service.js):

- Map `feedbackCount` on the summary.
- Fresh upsert already increments `generation_count`; also set `feedback_count = 0` on that update.
- New `reviseWeeklySummary(...)` `UPDATE ... SET` content fields, `feedback_count = 1`, `created_at = NOW()` `WHERE generation_count` row exists `AND feedback_count = 0`. Return null if the slot is spent.

**Quota / GET.** Keep `quota.limit = 2` as **fresh** generations in [`summaryWeek.js`](backend/src/journalSummaries/summaryWeek.js). `canRegenerate` stays `generation_count < 2`. `canRevise` is `Boolean(summary) && summary.feedbackCount === 0` in [`frontend/src/utils/summaryAvailability.js`](frontend/src/utils/summaryAvailability.js). Hide Regenerar when fresh quota is spent even if a revision remains; hide comment targets / Send when `canRevise` is false.

**Prompts.** In [`prompts.js`](backend/src/journalSummaries/prompts.js):

- Fresh system prompt: separate `summary` paragraphs with a blank line (no markdown). Existing rows without blank lines render as one paragraph target.
- New `buildRevisionMessages({ entries, weekStart, weekEnd, locale, generationCount, previousSummary, comments })`. Reuse `buildSystemPrompt`, then add revision rules: same schema; this is revision 1 of generation N of 2; address quoted passages; do not start over unless a comment requires it; keep unmentioned parts unless coherence needs a small change; blank-line paragraphs in `summary`.

User payload order: generation/revision framing, previous JSON, numbered comments (`section`, `quotedText`, `note`), then the same entries block used today.

**Generation.** Add `generateWeeklySummaryRevision` in [`journalSummaries.generation.js`](backend/src/journalSummaries/journalSummaries.generation.js) sharing the HF client, 45s timeout, and [`parseSummaryOutput`](backend/src/journalSummaries/parseSummaryOutput.js).

**HTTP.** `POST /auth/me/journal-summaries/current/revise` in [`auth.routes.js`](backend/src/auth/auth.routes.js) (`requireAuth`). Controller:

- 404 if no current-week summary.
- 429 `summary_feedback_exhausted` if `feedbackCount === 1`.
- Same 15-minute attempt cap as generate (`recordGenerateAttempt` on revise too).
- Load the rolling-week entries (do not re-require `MIN_ENTRIES_FOR_SUMMARY` if a summary already exists).
- Validate `comments`: non-empty array, cap ~10; each `note` non-empty; `section` in `summaryText | bestQuote | socraticText | machiavelliText`; optional `quotedText`.
- On success: 201 with the same `{ summary, weekStart, weekEnd }` shape as generate.

Reuse existing timeout / HF error mapping. Add keys in [`journalMessages.js`](backend/src/i18n/journalMessages.js) (English + Spanish).

## Frontend

**Pure helper.** [`frontend/src/utils/summaryParagraphs.js`](frontend/src/utils/summaryParagraphs.js) splits on blank lines. Tests next to it. Demo copy in [`demoJournal.js`](frontend/src/data/demoJournal.js) already uses `\n\n`.

**UI components** (own folders, not extra files under `Pages/JournalSummary/`):

- `SummaryCommentTarget` — keyboard-focusable control wrapping a paragraph or the quote / Socrates / Machiavelli block; disabled when `!canRevise`.
- `SummaryCommentModal` — overlay patterned on [`JournalConfirmModal`](frontend/src/Components/JournalConfirmModal/JournalConfirmModal.jsx): show the quoted excerpt, textarea, add-to-queue / cancel, Escape and overlay click to close.

[`JournalSummary.jsx`](frontend/src/Pages/JournalSummary/JournalSummary.jsx) owns the queue:

- Click target → modal with `{ section, quotedText }`.
- Queued list (truncated quote + note, remove). Hint copy when `canRevise`.
- **Send comments** when the queue is non-empty and `canRevise`; reuse the existing loading screen and retry helpers against the revise URL.
- Clear the queue on successful send and when Regenerar starts.
- Demo: local `demoFeedbackUsed`; Send runs the loading ritual and keeps the demo text; do not call the API.

Quota line stays “X of 2 summaries left” (fresh gens). Exhausted copy only when **both** regenerate and revise are spent. While fresh quota is 0 but `canRevise`, keep annotation + Send, hide Regenerar.

Bilingual strings in [`frontend/src/data/locales/en.js`](frontend/src/data/locales/en.js) and [`es.js`](frontend/src/data/locales/es.js). Prompts, comments, and code stay English.

## Tests and docs

- Prompt tests: revision framing includes generation N; comments and previous JSON present; fresh prompt requires blank-line paragraphs.
- Service/controller behavior via focused tests where the module already tests logic (`summaryWeek`, prompts, parse). Add a small test for `reviseWeeklySummary` SQL contract if practical; otherwise cover validation helpers and availability.
- Frontend: paragraph split; `canRevise`; JournalSummary click → queue → send → notes gone; regenerate clears notes; feedback-spent hides targets.
- Update [`.cursor/docs/architecture.md`](.cursor/docs/architecture.md) for the revise route. Do not edit `DECISIONS.md`.

**Handoff:** apply migration `012` on each environment (`\i backend/src/db/migrations/012_journal_summary_feedback_count.sql`).
