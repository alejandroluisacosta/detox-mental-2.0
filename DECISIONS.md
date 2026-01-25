### 2026-01-25 — Backend deployment pattern for Vercel

**Decision:**  
Use a **serverless HTTP-style handler** for production deployment on Vercel while keeping an **Express-based backend** for local development.

**Why this option was chosen:**  
Vercel functions are **serverless**: they are invoked per request and do not persist in memory between calls. This requires a stateless, single-call architecture, which we emulate with a lightweight handler (`chatController`). Express is **overkill** for deployment in this context but is kept for local development to maintain a persistent, debuggable environment.

**Why obvious alternatives were rejected:**  
- **Keeping only the Express server:** Would fail on Vercel because the server cannot stay running in a serverless environment.  
- **Deploying a full backend elsewhere:** Adds operational overhead and deviates from the goal of a **minimal, showcase-ready deployment**.
