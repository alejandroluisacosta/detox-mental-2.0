# Environment Configuration Guide

## Development vs Production Flow

### Local Development (Express)
```
Frontend (Vite) → http://localhost:3000/chat → Express Router → chatControllerExpressMiddleware → chatController
```

**Environment Variable:** `VITE_CHAT_API_URL=http://localhost:3000/chat` (`.env.local`)

### Production (Vercel)
```
Frontend (Built) → /api/chat → Vercel Serverless Handler → chatController
```

**Environment Variable:** `VITE_CHAT_API_URL=/api/chat` (`.env.production`)

---

## Files Modified

1. **backend/src/routes/chat.js**
   - Changed: Import `chatControllerExpressMiddleware` instead of `chatController`
   - Reason: The router needs the Express wrapper that handles `req/res`

2. **frontend/src/Pages/Onboarding/Onboarding.jsx**
   - Added: `const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:3000/chat"`
   - Changed: All `fetch("http://localhost:3000/chat", ...)` → `fetch(CHAT_API_URL, ...)`
   - Reason: Environment-aware endpoint without conditional logic

3. **frontend/.env.local** (new)
   - `VITE_CHAT_API_URL=http://localhost:3000/chat`

4. **frontend/.env.production** (new)
   - `VITE_CHAT_API_URL=/api/chat`

---

## Vercel-Compatible API Handler (frontend/api/chat.js)

✅ **No changes needed** — Already compatible:
- Accepts `POST /api/chat`
- Stateless: receives and returns `sessionState` via body
- Calls pure `chatController` function
- No environment branching needed

---

## Running

### Dev
```bash
# Terminal 1: Backend (Express)
cd backend && npm run dev

# Terminal 2: Frontend (Vite)
cd frontend && npm run dev
```
→ Frontend reads `VITE_CHAT_API_URL=http://localhost:3000/chat` from `.env.local`

### Production
- Deploy frontend to Vercel (uses `.env.production`)
- Frontend reads `VITE_CHAT_API_URL=/api/chat`
- Calls the serverless handler at `frontend/api/chat.js`
- Both use the same `chatController` logic
