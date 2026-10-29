### 2026-01-25 — Backend deployment pattern for Vercel

**Decision:**  
Use a **serverless HTTP-style handler** for production deployment on Vercel while keeping an **Express-based backend** for local development.

**Why this option was chosen:**  
Vercel functions are **serverless**: they are invoked per request and do not persist in memory between calls. This requires a stateless, single-call architecture, which we emulate with a lightweight handler (`chatController`). Express is **overkill** for deployment in this context but is kept for local development to maintain a persistent, debuggable environment.

**Why obvious alternatives were rejected:**  
- **Keeping only the Express server:** Would fail on Vercel because the server cannot stay running in a serverless environment.  
- **Deploying a full backend elsewhere:** Adds operational overhead and deviates from the goal of a **minimal, showcase-ready deployment**.

### 2026-01-28 — Onboarding route gate as first-touch enforcement

**Decision:**  
Introduce a **global onboarding route gate** (`OnboardingGate`) that conditionally redirects users to the onboarding flow based on a persistent client-side flag (`localStorage`), instead of handling onboarding logic inside individual routes or components.

**Why this option was chosen:**  
Onboarding is a **cross-cutting concern** [affects many parts at once] that applies to the entire application, not to specific pages. Centralizing the logic in a route-level gate ensures:

- A **single source of truth** for onboarding state
- Consistent behavior across all current and future routes
- No duplication of conditional checks inside individual components
- Clear architectural intent: onboarding is a **precondition** for accessing the app

**Updated 2026-10-19 — reversed:**  
Based on the latest developments of the product, onboarding no longer wraps any route; it is optional for interested users. `OnboardingGate` was removed: the educational module is reachable directly, with `/course` as its entry point, and the guided chat with Tales at `/onboarding` is offered at the end of the course's short slideshow. See the 2026-10-19 entry.

### 2026-02-01 — Separate Vercel projects for frontend and backend

**Decision:**  
Deploy **frontend** and **backend** as **separate Vercel projects**. The API entry point lives in the backend repo (`backend/api/chat.js`), not in the frontend.

**Why this option was chosen:**  
The project is small enough to deploy as a single Vercel app (frontend + API together), and the next features (user auth + DB, Stripe) don’t strictly require a dedicated backend. Keeping a separate backend deployment is **preemptive**: it preserves clear boundaries and avoids organizational cost. Putting the API in the frontend repo would have forced one of two options: **(1)** move the Vercel root above both directories and use a single `package.json` / `package-lock.json` for frontend and backend, conflating dependencies; **(2)** move backend code into the frontend directory. (1) was undesirable for organization; (2) was worse and was discarded.

Additional upsides:
- Independent scaling and env/secrets per project
- Frontend-only deploys don’t touch the backend
- Backend remains easy to move to another host later

**Why obvious alternatives were rejected:**  
- **Single deployment with API in frontend:** Would require either merging dependencies (one root, one package.json) or nesting backend inside frontend; both hurt structure and clarity.  
- **Keeping API in frontend with shared root:** Conflating frontend and backend dependencies in one `package.json` was not acceptable.

**Downsides (accepted):**
- Two projects to configure and monitor
- CORS and `VITE_CHAT_API_URL` must be kept in sync
- Response shape must match between Express (local) and serverless handler (Vercel) so the frontend works in both environments

### 2026-04-04 — Authentication layer (passwordless, JWT cookies, SPA)

**Decision:**  
Implement **passwordless authentication** for Detox Mental: magic links by email, **PostgreSQL** for users and token rows, **JWT** sessions delivered as **HTTP-only cookies**, **Resend** for mail, and a small **Express** surface (`/auth/*`, `/auth/me`) integrated with the existing backend—while the **chat** path may remain **serverless** on Vercel where applicable.

**Design choices (why we chose them):**

- **Magic links (no passwords):** Frictionless, modern sign-in that matches the **UX-focused** positioning of the product; avoids password storage, reset flows, and related support burden.
- **JWT in an HTTP-only cookie (not `localStorage`):** The browser sends the session on API calls automatically; JS cannot read the token, which **reduces XSS risk** compared to bearer tokens in storage.
- **Store only a hash (HMAC) of the magic link token in the DB; never the raw token:** Limits damage if the DB is leaked; the **HMAC uses `MAGIC_LINK_SECRET`**, stronger than an unkeyed hash against offline guessing.
- **Encode email (and a nonce) inside the raw magic link token:** Lets verification recover identity **without** an `email` column on `magic_link_tokens`, keeping the table minimal while keeping tokens high-entropy.
- **Create the `users` row only after a successful `/auth/verify`, not on `/auth/login`:** Ensures accounts exist only after **proof of email access**; avoids creating users from login spam alone.
- **Generic JSON response for `POST /auth/login`:** **Anti-enumeration**—attackers cannot use the login endpoint to learn whether an email is registered.
- **Cookie settings (HttpOnly, `Secure` in production, `SameSite=Lax`, path `/`, max-age, optional `Domain`):** Balance security and usability; `Secure` aligns with HTTPS in prod; `Lax` works with same-site navigation patterns used by the app. [This decision was made with more reliance on AI than the others. It needs to be further reviewed to fully understand the implications of using a different approach. Kept as it for time management reasons].
- **CORS: allow a single explicit `FRONTEND_ORIGIN` with `credentials: true`:** Required for the SPA to send cookies on **cross-origin** requests to the API during local dev and deployed setups.
- **`GET /auth/me` protected by middleware:** The SPA **cannot read** the HTTP-only cookie; a lightweight **session bootstrap** call lets the UI know who is logged in after refresh or new tabs **without** duplicating secrets client-side.
- **Resend + `API_PUBLIC_URL` (or equivalent) for magic link URLs:** Emails must point at the **real API** host per environment so links work from any device; configuration stays in env, not hardcoded.
- **Auth-related UI in the shared `Navigation` menu (login / email / logout):** Keeps **one** global navigation pattern instead of a second floating control; reduces layout clutter while auth is still lightweight.
- **`requireAuth` loads the user from the DB and rejects soft-deleted users (`deleted_at`):** JWT alone is not enough. Server-side checks enforce **account state** and align with the product’s soft-delete model.

### 2026-04-04 — Magic link email HTML kept inline in the backend

**Decision:**  
Keep the **magic link email** as **HTML with inline styles** implemented in **`email.service.js`** (template strings), without separate template files or an email framework/inliner pipeline.

**Why this option was chosen:**  
Only **one** transactional email exists today, and it is **unlikely to change often**. Extracting templates or adding **MJML / inlining** would introduce **dependencies and build complexity** disproportionate to the need. Inline styles are the **norm for HTML email** because many clients ignore external or embedded stylesheets.

**Why obvious alternatives were deferred:**  
Separate `.html` files improve readability but still require **inlined CSS in the final payload** unless we add tooling. Revisit if the number of templates grows or marketing owns ongoing email design.

### 2026-04-25 — Navigation changed from floating circle to scroll-aware options bar

**Decision:**  
Replace the previous **floating circular navigation button** with a unified **options bar** that combines navigation and authentication entry points. The bar appears on scroll-up (bottom on mobile, top on desktop), with menu access on the left and auth state (`Login` / user email) on the right.

**Why this option was chosen:**  
Adding authentication made the previous interaction model less intuitive: putting `Login` inside the old floating menu felt hidden and awkward, while trying a separate login circle/icon created visual clutter—especially on mobile, where no placement felt clean. After UX/UI review, we consolidated both concerns into a single component to improve discoverability, reduce competing floating controls, and keep the primary actions in one predictable place.

**Why obvious alternatives were rejected:**  
- **Keep circle nav and add login inside it:** Authentication entry felt secondary and hard to discover.  
- **Keep circle nav and add separate login icon/button:** Increased UI clutter and weakened hierarchy, particularly on small screens.  
- **Place login elsewhere ad hoc (header/footer only):** Created inconsistent patterns across pages and split related actions.

### 2026-05-01 — Backend API domain moved from `*.vercel.app` to `api.detoxmental.es`

**Decision:**  
Serve the backend API from a first-party custom subdomain (`api.detoxmental.es`) instead of the default Vercel domain (`detox-mental-backend.vercel.app`), and point frontend API calls/magic-link URLs to that domain.

**Why this option was chosen:**  
In production we hit authentication instability: `/auth/me` returned unauthorized states because the auth cookie was not being sent consistently from the frontend origin to the backend origin. Although part of the observed errors appeared as CORS issues, the core risk was cross-site cookie behavior between `www.detoxmental.es` and `*.vercel.app`. We considered relaxing cookie policy (`SameSite=None; Secure`) to keep the old domain, but that path is brittle long-term because third-party cookie handling continues to tighten across browsers. Moving the API to `api.detoxmental.es` makes frontend and backend first-party under the same registrable domain (`detoxmental.es`), improving cookie reliability and reducing auth/session regressions.

**Why obvious alternatives were rejected:**  
- **Keep `*.vercel.app` and switch to `SameSite=None`:** Could work short-term, but depends on third-party cookie behavior and is vulnerable to browser privacy changes.  

**Operational implications (accepted):**
- Need DNS + Vercel domain management for `api.detoxmental.es`
- Need stricter env coordination (`FRONTEND_ORIGIN`, `API_PUBLIC_URL`, frontend `VITE_API_URL`)
- Must redeploy both projects when domain/env wiring changes

### 2026-08-01 — Weekly journal summary: on-demand generation, not cron

**Decision:**  
Generate the weekly journal reflection **on user click** during a limited Sunday window, persist **one row per user per ISO week**, and produce **summary + best quote + Socratic prompt in a single LLM call**. Summaries must not use clinical language, mood scores, or diagnosis-like framing.

**Why this option was chosen:**  
- The product goal is a **ritual** (user is present), not a batch report emailed into the void.
- The repo has **no job runner / Vercel cron** today; on-demand fits the current Express-on-Vercel model.
- One HF `chatCompletion` keeps us closer to the **20s `maxDuration`** budget than three sequential calls.
- Persisting the result makes re-opening the page cheap and prevents repeat spend / prompt drift for the same week.

**Why obvious alternatives were rejected:**  
- **Cron / precompute for every user:** Requires new infra and pays for users who never open the summary.
- **Three separate model calls (one per section):** Simpler prompts, but higher latency and timeout risk on Vercel.
- **Client-only window gate (like promo):** Fine for UX copy, insufficient for creation authorization; server must enforce.
- **Regenerate freely:** Undermines the “once a week” scarcity and increases cost/abuse surface.

**What would trigger revisiting:**  
Persistent timeouts, desire for push/email reminders, or a multi-week archive/compare product surface.

**Updated 2026-09-02:** The Sunday window and “regenerate freely is rejected” parts of this decision are superseded by the 2026-09-02 update on the 2026-08-09 entry. On-demand generation, one row per ISO week, and a single LLM call still stand.

### 2026-08-09 — Summary create gating moved to the SPA; POST upserts

**Decision:**  
`GET /auth/me/journal-summaries/current` returns raw `summary` + `window` + `entryCount`. The SPA derives create availability (including hiding summaries with `createdAt < window.opensAt` while the window is open). `POST /current` no longer returns `403`/`409`; it generates from the week’s entries and **upserts** (refreshing `created_at`). A temporary **Regenerar** button on the summary page calls the same POST for testing.

**Why this option was chosen:**  
- Mid-week test regenerations must not block the next Sunday create CTA.
- One POST path for create and regenerate keeps the backend a pure generator.
- Removing the Regenerar button later restores one-create-per-window UX without backend changes.

**Why this revisits 2026-08-01:**  
That decision required server-side window enforcement and rejected free regenerate. Product/testing needs temporarily override that; the SPA still presents the Sunday ritual. Re-add server `403`/`409` if abuse or cost becomes a problem.

**Operational implications (accepted):**  
An authenticated client can call POST outside the window (cost/abuse surface). Acceptable while Regenerar exists for testing.

**Updated 2026-09-02 — reversed:**  
Daily use made the Sunday window a pain: summaries were wanted before the weekend, and stretching or moving the window was technically complex. The window is gone, so there is nothing for the SPA to derive from a clock. `GET /current` now returns a `quota` block instead of `window`, and `POST /current` enforces a hard limit of 2 generations per ISO week server-side (`429` on the third), restoring the server-side enforcement this entry had waived. The temporary Regenerar button became the product’s second generation, so the create/regenerate limit is now a real product rule; a quota that costs LLM spend cannot be enforced by the client; and the staleness heuristic (`createdAt < window.opensAt`) has no meaning without a window.

### 2026-08-19 — Split the SPA into educational and journaling modules

**Decision:**  
Separate the product into two modules behind a homepage chooser at `/`. The educational module (`/theory`, `/course`, `/session/:sessionId`, `/instructions`, `/tests`, `/test/:testId`, `/promo`) remains behind `OnboardingGate`. The journaling module (`/journal`, `/journal/history`, `/journal/summary`) and shared account/auth pages are reachable without onboarding. Each module has its own navigation; a home control returns to `/`. The former article route at `/` moves to `/theory`.

**Why this option was chosen:**  
This is a product-oriented change that comes from experimentation with the product in the past months. What originally started as an educational-only tool has evolved into a reflection one based on the results of testing the app with online advertisement. Since the journaling features are independent from the original product idea, they are separated at this point, and in the future, based on the results of further testing, the educational module might disappear altogether.

**Why this revisits 2026-01-28:**  
That decision treated onboarding as a precondition for accessing the app. The gate now guards the educational module only, so journaling can be used and advertised independently.

**Updated 2026-10-19:**  
The educational module is no longer behind `OnboardingGate`, which was removed (see the 2026-10-19 entry). The split into two modules still stands.

### 2026-08-26 — Journaling module bilingual UI with English default

**Decision:**  
Open the journaling module to an English-speaking audience with a bilingual UI, English by default and a language switch in the navigation menu. The translation layer is built in-house — a per-locale catalog and a `t()` helper behind a `LocaleProvider` — rather than adopting an i18n library, and is deliberately shaped so that migrating to one later is cheap. Journal UI copy, shared navigation/home/account chrome, journal API errors, and weekly summary generation all follow the active locale.

**Why this option was chosen:**  
Reaching an English-speaking audience had been on the roadmap for months, and implementing it forced a choice: build our own translation layer, or install an established library such as react-i18next.

The decision came down to the difference between easy and simple. Installing the library would have been the easier path, but it would have brought in machinery the product does not need yet, and every future contributor would have had to understand it. Given the modest number of strings and a single module to translate, a small catalog was the simpler thing to own.

What makes this safe is that the layer is intentionally shaped like the library we would migrate to: flat dotted keys, one plain-object catalog per locale, and a `t(key, values)` signature. Adopting react-i18next later means rewriting one file rather than touching every screen. The codebase stays simple now and prepared for growth.

**Why obvious alternatives were rejected:**  
- **react-i18next or similar:** More capability than two locales and one module justify today. Revisit rather than pre-empt.
- **Infer summary language from the journal entries:** Mixed-language weeks make this unreliable; the UI language at request time is the explicit signal.
- **Store two summary versions per week:** Extra schema and generation cost for a case regenerating already solves.

**What would trigger revisiting:**  
Adopt a real i18n library once the layer would have to grow beyond string lookup and simple placeholder substitution. The practical signals are pluralization rules, formatting or rich text inside translated sentences, a third locale, or handing the catalogs to an external translator.

**Operational implications (accepted):**  
Apply `backend/src/db/migrations/006_journal_summary_locale.sql` to each environment. Existing summary rows backfill as `es`. Generated summaries keep the language they were created in until the user regenerates them. Topic values remain stored as the existing Spanish identifiers. Educational screens remain Spanish except the shared navigation/home/account labels.

### 2026-09-16 — Blog category chips filter in memory, not via the API

**Decision:**  
Fetch the personal-blog article list **once** when `/alejandroluis/blog` is ready, keep it in the Blog page’s local React state, and apply category chips (`?category=`) as an in-memory filter. Do not send `GET /blog/posts?category=` (or refetch the admin list) when the reader changes a chip.

**Why this option was chosen:**  
The first blog implementation treated each chip as a new backend query. Smoke-testing that flow made it obvious those calls were too much for a small, already-loaded catalog: categorization is a client concern once the list is in the SPA. Local state on the index is enough because no other screen needs that list. Opening an article still loads by slug.

**Why obvious alternatives were rejected:**  
- **Keep per-chip API filters:** Extra latency and load for no product gain at this catalog size. The public `?category=` query can stay on the API unused by the index.  
- **Redux or a new `BlogPostsContext`:** Heavier than one page’s `useState`. Revisit only if the same list must survive Blog → article → Blog without a second fetch, or be shared with the composer.  
- **Reuse `AuthContext` / `LocaleContext`:** Those providers own session and copy, not blog posts.

**Later update (2026-10-23): the blog moved out of Detox Mental.**  
Following feedback from a trusted tech recruiter, the blog now lives on its own domain: its articles are valuable, but their scope goes beyond Detox Mental. It moved to [alejandroluis.com](https://www.alejandroluis.com) (repo `alejandroluisacosta/blog`), where all published posts are available, and the new site links back to Detox Mental (for example, from a section on its home page). Since the blog had no audience yet, it starts fresh on the new domain: the `/alejandroluis` routes were removed without redirects, the blog code was deleted from this repo, and `020_drop_blog_posts.sql` drops the table. This decision no longer applies to the app.

### 2026-09-24 — Tool-agnostic agent instructions in AGENTS.md

**Decision:**  
Move agent documentation and conventions out of `.cursor/` into three plain `AGENTS.md` files: one at the repo root, one in `frontend/`, and one in `backend/`. Delete the duplicated Cursor rule files that previously injected the same text.

**Why this option was chosen:**  
The goal of this update was to make the development of the project **tool-agnostic**, allowing me to use either Cursor, Claude Code, Codex, and similar tools—all of which load `AGENTS.md` automatically. Collapsing the scattered `.cursor/rules` and workflow docs into three files gives a single source of predefined instructions that works across tools without Cursor-specific duplication.

**Why obvious alternatives were rejected:**  
- **Keep conventions only in `.cursor/rules`:** Ties instructions to Cursor; other agents would miss them or need a separate copy.  
- **Symlinks or per-tool files (`CLAUDE.md`, etc.):** More surface area to keep in sync; one canonical file per scope is enough.

### 2026-10-03 — Frontend structure lint scripts for Firstmate

**Decision:**  
Add `frontend/scripts/checkPageComponentStructure.js` (wired into `npm run lint`) plus a small test suite and a **grandfather baseline** for pre-existing page-folder layout debt. Document in-repo that the baseline is **legacy violations only**—it must **never** grow to excuse new debt and should **shrink** when legacy folders are fixed.

**Why this option was chosen:**  
**Firstmate** (an orchestration tool from an engineer with Meta, Microsoft, and Atlassian background) runs autonomous agents against this repo. Agents had shipped extra page-level `.jsx` files beside named pages despite `frontend/AGENTS.md`. A mechanical gate fails CI on new violations while Firstmate and other agents keep layout rules honest without relying on prompt memory alone.

**Why obvious alternatives were rejected:**  
- **Prompt-only enforcement:** Already failed once (`MeditationProgressControl.jsx`-style drift).  
- **Mass refactor of legacy folders in the same change:** Out of scope; the baseline holds known debt until those pages are migrated.  
- **Eslint custom rule only:** A small Node script is easier to test in isolation and matches how this repo runs lint today.

**Downsides (accepted):**  
Extra scripts and JSON in the frontend package add a little **project bloat**. The trade-off is accepted because **Firstmate is highly beneficial** for the workflow—supervised agent lanes, PR delivery, and repeatable checks—and this gate reduces bad merges that cost more time to unwind than the tooling costs to maintain.

### 2026-10-11 — Session unlock codes verified server-side, not client-side

**Decision:**  
This is a **broken access control** fix (OWASP A01). Unlock codes used to ship in `frontend/src/data/codes.json` and were compared in the browser (`BlockedSessionModal.jsx`); the backend accepted `POST /auth/me/unblocked-sessions` for any `sessionId` 1–15 from any authenticated user with no code check at all. Any logged-in user could unlock the full paid course with one request, no code needed. Moved verification to the backend: a new `session_unlock_codes` table (migration `018_session_unlock_codes.sql`) stores `HMAC-SHA256(code, MAGIC_LINK_SECRET)` per session, keyed the same way as `magic_link_tokens` so a DB leak alone can't be brute-forced into working codes (these are 6-character codes — a bare hash would be crackable offline in seconds). `postSessionUnblock` now requires `{ sessionId, code }` and compares with `crypto.timingSafeEqual`. Anonymous (logged-out) code entry was removed — it never persisted anything, and reintroducing an unauthenticated "verify code" endpoint for it would just add a new guessable, unrated-limited target for no real benefit.

**Why this option was chosen:**  
Server-side verification is the only version of this feature that actually controls access; a client-side check is equivalent to no check, since the client is fully under the user's control. A DB table (over 14 env vars) matches the existing `user_unblocked_sessions` / migration pattern already in this schema and lets codes be rotated or revoked without a redeploy.

**Why obvious alternatives were rejected:**  
- **Plain `SHA256(code)` instead of HMAC:** Not enough on its own — these codes have low entropy (~3×10⁸ possibilities) and a fast hash is brute-forceable offline from a DB dump alone. HMAC with a secret not stored in the DB raises the bar to "DB leak + secret leak."
- **14 env vars (one per session):** Works but is harder to rotate or extend than a table, and doesn't match how the rest of this schema manages per-row data.
- **Hardcoding the seed hashes into a `.sql` migration:** The HMAC value depends on `MAGIC_LINK_SECRET`, which differs between local and production. A hash baked in for one secret would be wrong for the other, so seeding is a small script (`backend/scripts/seedSessionUnlockCodes.js`) run once per environment instead.

### 2026-10-11 — Course audio files stay unauthenticated for now

**Decision:**  
`frontend/public/session_*.mp3` remain publicly fetchable by direct URL (no auth, no signed URL) even after session-unlock codes were moved server-side above. This is the same class of problem (broken access control) and is **not fixed yet**, intentionally.

**Why this option was chosen:**  
There is currently no real demand for the course, so the cost of someone finding and downloading an unreleased session's audio is low, while fixing it properly (authenticated streaming or signed, expiring URLs instead of static files in `public/`) adds real backend complexity for no current payoff. This is a deliberate, written scope cut, not an oversight.

**Why obvious alternatives were rejected:**  
- **Fix it now alongside the unlock-code change:** Rejected to keep that change scoped to one access-control bug at a time (TDD-friendly, reviewable diff) and because the infra cost isn't justified yet.
- **Leave it undocumented:** Rejected — an unprotected, unauthenticated resource should never be silently "fine," even when the current risk is low. Revisit this before monetizing the course further or once it has real paying users.

### 2026-10-17 — Postgres-backed rate limiting for login emails, the onboarding chat and journal transcription

**Decision:**  
This is the **second major vulnerability** found in the app: **no rate limiting** on any endpoint (OWASP API4, unrestricted resource consumption, which includes "denial of wallet"). `POST /auth/login` sent a Resend email on every request, so anyone could email-bomb an address or burn the whole Resend quota, locking real users out of logging in. Added a shared limiter (`rate_limit_events` table, migration `019_rate_limit_events.sql`; `backend/src/rateLimit/`) and applied it first to login: per email (3 per 15 min, 5 per day), per IP (10 per hour) and globally (90 per day, just under Resend's free tier of 100). IPs and emails are stored only as HMAC hashes (same keyed approach as `magic_link_tokens`). Over the limit returns `429`. If the limit check hits a database error, no email is sent (fail closed) and the usual generic 200 is returned.

The same limiter was then applied to the unauthenticated onboarding chat (`POST /chat`), where each request could trigger up to two Hugging Face calls and the server trusted a client-supplied `sessionState` (a forged state could carry a huge `pqaSentence`). Limits are counted per Hugging Face call: per IP (6 per hour, 10 per day) and globally (100 per day, about 50 onboardings). When a limit is hit, onboarding does **not** break: it degrades silently to a canned challenge question and `"medium"` clarity, so the user still finishes. A database error is treated as "limit hit" (fail closed). The client-supplied sentence must also be a single sentence of at most 300 characters, otherwise the state resets to `PQA_PROMPT` with no model call. `chatController` denies LLM calls by default unless an entrypoint passes `allowLlmCall`, so a forgotten wire can't spend money.

The limiter was finally applied to the authenticated journal image transcription (`POST /auth/me/journal-entries/transcribe`), where each request is a Hugging Face vision call and any logged-in account could loop it. The limit is **3 transcriptions per user per day**, keyed by user id (not hashed, since it is neither an IP nor an email), and can be raised if users ask. The check runs after the upload is validated and before the model call, so invalid uploads (missing, too large, wrong type, bad signature) return `400` and do not count. Over the limit returns a localized `429` (`en`/`es`) and makes no Hugging Face call; the Journal page already shows `data.message`. A database error is treated as "limit hit" (fail closed). With this, every endpoint that spends money on Resend or Hugging Face is rate limited.

**Why this option was chosen:**  
Two goals: keep quota-limited services (Resend, Hugging Face) **available to real users** during an attack, and keep **costs bounded** no matter what an attacker does. The backend runs on Vercel serverless, so in-memory counters would be per-instance and useless. Postgres counters generalize the existing `journal_summary_generate_attempts` pattern and add no dependency. For the chat, falling back to canned output (instead of an error) keeps onboarding usable while the global cap stays a hard cost ceiling.

**Why obvious alternatives were rejected:**  
- **In-memory limiter (e.g. `express-rate-limit` default store):** Each serverless instance keeps its own counters, so the limit is effectively not enforced.  
- **Return an error when the chat limit is hit:** Would break onboarding for real users during an attack, which is the harm this change is meant to prevent.  
- **Plain-text IPs/emails in the table:** Unnecessary personal data; hashing keeps the table GDPR-friendly.

**Downsides (accepted):**  
- Once the 90/day global cap is reached, a legitimate user's first request of the day also gets a `429` (the Login page message mentions the server being busy). This trades availability for a hard cost ceiling.  
- Count-then-insert is not atomic, so concurrent requests can slightly overshoot a limit.  
- A request blocked by the email limit still counts against that IP's hourly allowance, because the IP is checked first.  
- Chat limits are per IP, not per user (the chat is unauthenticated), so people sharing an IP share the allowance. Once the 100/day global cap is reached, everyone gets the canned fallback until the window passes.
- Transcription has no global cap, only the per-user limit, so total spend scales with the number of accounts. Someone who creates many accounts can still multiply it by 3 per day each; account creation is gated by the login limits above. A global cap can be added if this becomes a problem.  
- A fail-closed database error shows the user the "daily limit" message even though they have not reached it.

### 2026-10-19 — Quick slideshow onboarding for both modules; the guided chat becomes optional

**Decision:**  
Each module now opens with a short first-visit slideshow (`OnboardingSlideshow`). Tales welcomes the user, then a few slides show the module's main features with short clips recorded from the real app and one-line descriptions, so the whole tour takes under a minute. The journaling tour covers writing, History, Summary and Meditations. The education tour covers the article, the audio course, the exercises, the thoughts tests, unlocking sessions and the secret characters, and ends by offering the long guided chat with Tales at `/onboarding`. That chat is now optional and opens with a short "Detox Mental" title instead of the previous 14-second intro. Each tour is shown once per browser (`journalOnboardingSeen`, `courseOnboardingSeen`), and a "?" button on the module page replays it.

**Why this option was chosen:**  
After receiving feedback from several users, it was clear that the previous onboarding was too long for a first-time visitor. People found it interesting, but it had too much text, and they were not willing to spend a few minutes going through it before getting into the course. The slideshows let a new visitor quickly see what each module is about, and those who want more can still take the guided chat.

**Why this revisits 2026-01-28 and 2026-08-19:**  
Those entries made onboarding a precondition for the educational module. A mandatory multi-minute chat was what made first visits stall, so the gate is removed and the long onboarding becomes an option.

**Downsides (accepted):**  
- The recorded clips (about 1 MB per device set in each module) must be re-recorded when the screens they show change.
- "Seen" is stored per browser, not per account, so a user on a new device sees the tour again.

### 2026-10-29 — Anonymous first-entry reflection for new visitors

**Decision:**  
A visitor who is not signed in can write one entry on `/journal` and get a **first reflection** on it: a preview of the weekly summary, written from that single entry. The guest modal offers it next to logging in, with the disclosure that the text is sent to an AI provider and is not stored by us. The new public endpoint `POST /journal/first-reflection` accepts 200–3,000 characters, makes one Hugging Face call with a first-entry variant of the summary prompt (smaller token budget), returns the result and **stores nothing**. Only the reflection is kept, in the visitor's browser (`localStorage`, 7 days), and shown at `/journal/first-reflection` with an invitation to create an account. The entry itself is lost: it is not carried into the account after sign-up.

Cost is bounded by the shared Postgres limiter: **30 reflections per day globally** (the spend ceiling) and **2 per IP per day** (so one visitor cannot use up the day). Length is validated before the limiter, so invalid requests never count. A limiter database error refuses the request (fail closed), and `FIRST_REFLECTION_DISABLED=true` turns the endpoint off. Errors are logged by code only, never with the request body or the provider's message, since either can carry the visitor's text.

**Why this option was chosen:**  
Detox Mental started from an article I wrote in 2021, which became the Education module. In mid-2026 I built the Journaling module for myself, as the app's only real user, and that made the product something I can fully stand behind. The overarching goal of the product is to be my portfolio as a Software / Product Developer: proof of what I can build. A conversation with a trusted recruiter made it clear that having other people use the app is too relevant to leave aside. New visitors will mostly arrive from LinkedIn, through blog articles that link to Detox Mental, and a curious reader should be able to write something quick and see what the app does. Requiring an account before the first entry is exactly the friction that loses them.

Each reflection costs a Hugging Face call, so the feature was designed with security in mind from the start rather than patched later: a hard daily ceiling, input bounds, no stored data from people without an account, and an off switch.

**Why obvious alternatives were rejected:**  
- **Keep the login wall:** Safest for cost, but it hides the product's core experience from the visitors this is for.  
- **Store anonymous entries on the server and attach them after sign-up:** Would survive the browser switch that magic links often cause (for example, LinkedIn's in-app browser versus the mail app), but it means holding mental-health writing from strangers with no account, needs an expiry job, and opens a way to push text into someone else's journal. The first entry is not worth that.  
- **Reuse the weekly summary as is:** It needs at least 2 entries from the last 7 days, and a "weekly summary" of one entry would be misleading. The preview says plainly what it is.  
- **A CAPTCHA from day one:** Adds a dependency and friction for real visitors. The global cap already bounds the cost; a CAPTCHA can be added if the rate-limit records show abuse.

**Downsides (accepted):**  
- Once the 30 per day are used, every visitor gets the "used up, create an account" message until the window passes. This trades availability for a hard cost ceiling.  
- IP limits are weak (shared mobile IPs, VPNs, IPv6), so people behind one IP share the 2 per day, and a determined person can spread across IPs. Only the global cap is a real bound.  
- Someone can still use the endpoint as a free model, within the summary's JSON shape and the daily cap.

**Also in this change:** authenticated journal entries are now capped at 10,000 characters (previously only Express's 100 KB body limit), which bounds what each weekly summary sends to the model.
