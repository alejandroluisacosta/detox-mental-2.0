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
Generate the weekly journal reflection **on user click** during a limited Sunday window, persist **one row per user per ISO week**, and produce **summary + best quote + Socratic prompt in a single LLM call**. Full design: `docs/weekly-journal-summary.md`.

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
