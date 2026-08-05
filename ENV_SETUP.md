# Environment Configuration Guide

This document lists environment variables the app expects today: **Express backend**, **authentication**, **Stripe**, **chat**, and **Vite frontend**.

---

## Where to put values

| Location | File | Purpose |
|----------|------|---------|
| Backend | `backend/.env` | Express API (local dev). Do not commit secrets. |
| Frontend (dev) | `frontend/.env.local` | Vite dev server (`npm run dev`). |
| Frontend (build) | `frontend/.env.production` | Production build values. |
| Hosted | Vercel (or similar) | Set the same logical variables per service in the dashboard. |

---

## Backend (`backend/.env`)

Variables are read via `dotenv` when you run `npm run dev` / `npm start` in `backend/`.

### Core

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default `3000`). |
| `FRONTEND_ORIGIN` | Yes | Origin of the web app (locally `http://localhost:3001`). Used for **CORS**, magic-link redirects, and **Stripe Checkout** `success_url` / `cancel_url`. Must match the URL users open in the browser (scheme + host + port). |
| `NODE_ENV` | For prod behavior | Set `production` on deployed API so cookies use `Secure` and DB SSL matches `db.js`. |

### Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for `pg`. |

### Authentication and email

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Signs and verifies session JWTs. |
| `MAGIC_LINK_SECRET` | Yes | HMAC secret used when hashing magic-link tokens before storage. |
| `RESEND_API_KEY` | Yes | Resend API key for sending login emails. |
| `API_PUBLIC_URL` | No | Public base URL of **this API** (e.g. `http://localhost:3000`). Used in magic-link URLs in emails. Defaults to `http://localhost:3000` if unset. |
| `COOKIE_DOMAIN` | No | If set, session cookie `domain` is set accordingly (useful when frontend and API share a parent domain in production). |

### Stripe

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes for payments | Secret API key (`sk_test_...` or `sk_live_...`). |
| `STRIPE_WEBHOOK_SECRET` | Yes for webhooks | Signing secret (`whsec_...`). **Local:** from `stripe listen --forward-to …`. **Production:** from the webhook endpoint in the Stripe Dashboard. |
| `STRIPE_PRICE_ID` | Yes for Checkout | Stripe **Price** id (`price_...`) for the one-time course product used in Checkout line items. |

Use **test** keys and a **test** price while developing; no real money moves in test mode.

### Hugging Face (chat and journal transcription)

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_TOKEN` | Yes for `/chat`, journal image transcription, and weekly journal summaries | Hugging Face API token. Needs "Inference Providers" permission. Used by the chat controller, journal handwriting transcription, and weekly journal summary generation. |
| `HF_JOURNAL_VISION_MODEL` | No | Vision-language model used to transcribe handwritten journal images. Defaults to `Qwen/Qwen3-VL-30B-A3B-Instruct:novita`. Override to swap models without code changes. |
| `HF_JOURNAL_SUMMARY_MODEL` | No | Text model for weekly journal summaries. Defaults to `moonshotai/Kimi-K2-Instruct-0905:novita`. |

Journal transcription uploads are processed in memory only: the image is sent to the model and never written to disk or the database. Only the transcribed text is returned to the client for review before saving.

**Production (backend Vercel project):** Set `HF_TOKEN` (required for chat, journal scan-to-text, and weekly summaries) and optionally `HF_JOURNAL_VISION_MODEL` / `HF_JOURNAL_SUMMARY_MODEL` on the **backend** project (`detox-mental-backend` / `api.detoxmental.es`), not the frontend project.

---

## Frontend (Vite)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Base URL for the backend API (e.g. `http://localhost:3000`). Used by `frontend/src/api/client.js`; defaults to `http://localhost:3000`. |
| `VITE_CHAT_API_URL` | No | Full URL for the chat **route** (e.g. `http://localhost:3000/chat`). Used by onboarding chat UI; defaults to `http://localhost:3000/chat`. |

---

## Chat: development vs production

### Local development (Express)

```
Browser → VITE_CHAT_API_URL → Express POST /chat → chatController
```

Example in `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_CHAT_API_URL=http://localhost:3000/chat
```

### Production (example: Vercel)

If the deployed frontend calls a **serverless** chat handler under the same origin:

```
VITE_CHAT_API_URL=/api/chat
```

The repo includes `frontend/api/chat.js` as a Vercel-style handler; ensure `HF_TOKEN` (and any other backend-only secrets that handler needs) are configured in that project’s environment.

---

## Running locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Ensure `backend/.env` has at least: `DATABASE_URL`, `JWT_SECRET`, `MAGIC_LINK_SECRET`, `RESEND_API_KEY`, `FRONTEND_ORIGIN`, and for chat `HF_TOKEN`. Add Stripe variables when testing payments.

### Stripe webhooks on localhost

Stripe cannot POST to `localhost` directly. Use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/stripe/webhook
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET` in `backend/.env`.

---

## Cross-reference

For auth behavior and Stripe flow details, see **`AUTH_ARCHITECTURE.md`**.
