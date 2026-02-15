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
