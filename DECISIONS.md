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
