# 🧠 Detox Mental

Detox Mental is a guided self-reflection web app designed to help users confront and reframe destructive thought patterns.
It combines long-form educational content, an unlockable 15-session course, 15 journaling exercises, and authentication to preserve user progress.

## 🚀 Overview

This repository is a monorepo with:

- `frontend/` - React + Vite SPA (article, course, onboarding, account, instructions)
- `backend/` - Express API (auth, session unlock persistence, chat)

Core product experience includes:

- Main article introducing the Detox Mental framework
- 15-session audio/writing course
- Session unlock flow with persisted unlocked sessions per user
- Passwordless authentication via magic links

## 🛠️ Tech Stack

- **Frontend:** React, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Auth:** Magic links + JWT in HTTP-only cookies
- **Email:** Resend
- **Deployment:** Vercel (frontend and backend as separate projects)

## Repository Structure

```text
.
├─ frontend/
│  ├─ src/
│  └─ public/
├─ backend/
│  ├─ src/
│  └─ api/
├─ ROADMAP.md
├─ AUTH_ARCHITECTURE.md
└─ DECISIONS.md
```

## Local Development

### 1) Clone and install

```bash
git clone https://github.com/alejandroluisacosta/detox-mental-2.0.git
cd detox-mental-2.0

cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment variables

Set local env files at minimum:

- `backend/.env`
  - `DATABASE_URL`
  - `FRONTEND_ORIGIN=http://localhost:5173` (or your local frontend URL)
  - `JWT_SECRET`
  - `MAGIC_LINK_SECRET`
  - `RESEND_API_KEY`
  - `API_PUBLIC_URL=http://localhost:3000`
- `frontend/.env.local`
  - `VITE_API_URL=http://localhost:3000`

### 3) Run both apps

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Frontend usually runs on `http://localhost:5173`.

## Production Notes

- Frontend and backend are deployed as separate Vercel projects.
- Frontend should call backend using `VITE_API_URL`.
- Backend must define `FRONTEND_ORIGIN` with the exact frontend origin.
- If using custom domains (`www.detoxmental.es` + `api.detoxmental.es`), keep frontend/backend env vars aligned.

## Useful Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Backend

```bash
npm run dev
npm run start
```

## Documentation

- [ROADMAP.md](./ROADMAP.md) - planned milestones and future features
- [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) - auth design and decisions
- [DECISIONS.md](./DECISIONS.md) - architectural/product decisions log
- [ENV_SETUP.md](./ENV_SETUP.md) - environment setup notes

## 🤝 Contributing

This project is currently maintained by internal collaborators.
External contributors are welcome to fork and experiment locally.

## 🧾 License

This project is licensed under the MIT License.
See [LICENSE](./LICENSE).