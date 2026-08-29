# Detox Mental Architecture

This document describes the architecture that new work should follow. It is a
practical map of the current repository, not a list of aspirational patterns.
For detailed authentication decisions, environment variables, and historical
trade-offs, also read `AUTH_ARCHITECTURE.md`, `ENV_SETUP.md`, and `DECISIONS.md`.

## 1. Repository shape

Detox Mental is a monorepo with two independently managed JavaScript packages:

```text
detox_mental/
├── frontend/          # React + Vite single-page application
├── backend/           # Express API and PostgreSQL access
├── docs/              # Cross-project workflows and feature documentation
├── .cursor/docs/      # AI implementation and review instructions
├── .cursor/rules/     # Always-applied engineering conventions
├── AUTH_ARCHITECTURE.md
├── DECISIONS.md
└── ENV_SETUP.md
```

There is no root package manager configuration. Run package scripts separately
from `frontend/` and `backend/`.

## 2. Frontend

### Stack and entry points

- React 19 with JavaScript/JSX
- Vite for development and production builds
- React Router for client-side routing
- Vitest and Testing Library for tests
- ESLint for static analysis

`frontend/src/main.jsx` mounts `App`. `frontend/src/App.jsx` owns the provider
tree and route table:

```text
BrowserRouter
├── ScrollToTop
└── LocaleProvider
    └── AuthProvider
        ├── AuthSessionToast
        └── DemoModeProvider
            └── SessionsProvider
                └── Routes
```

The Vite development server is configured on port `3001` in
`frontend/vite.config.js`.

### Routing and access

`/` is the module chooser (`Home`). Successful `GET /auth/verify` redirects
to `/?auth=success`. Shared account and auth routes (`/login`, `/auth/error`,
`/account`) and the journaling module (`/journal`, `/journal/history`,
`/journal/summary`) are reachable without onboarding.

The educational module (`/theory`, `/course`, `/session/:sessionId`,
`/instructions`, `/tests`, `/test/:testId`, `/promo`) is nested under
`OnboardingGate`, which checks the `onboardingRevealed` local-storage flag.
`/onboarding` and the payment result pages stay outside the gate to avoid
redirect loops and to complete Stripe return URLs.

`OnboardingGate` is not an authentication gate. Pages that require an account
must check `useAuth()` or rely on a protected backend endpoint. Authentication
and authorization must always be enforced by the backend for user-owned data.

### Source organization

- `src/Pages/<Feature>/`: route-level screens and feature-specific styles,
  helpers, loading views, and tests.
- `src/Components/<Component>/`: reusable interface components.
- `src/Context/`: application-wide React state. Add context only for state
  shared across distant screens or long-lived application flows.
- `src/api/client.js`: the common API transport (`apiFetch`), base URL, JSON
  serialization, and cookie credentials.
- `src/data/`: static product content and configuration.
- `src/utils/`: reusable pure utilities and their tests.
- `src/lib/`: small infrastructure utilities such as the toast event bus.

Keep feature-specific code with its page until reuse clearly justifies moving
it. Follow existing BEM-style CSS names and global design tokens from
`src/index.css`.

### State and API conventions

- `AuthContext` bootstraps the session through `GET /auth/me` and exposes
  `user`, `status`, `refreshUser`, and `logout`.
- `SessionsContext` combines static course content with persisted unlock state.
- Local UI state stays inside its page or component.
- Use `apiFetch` for backend requests so the configured API base URL and
  HTTP-only authentication cookie are handled consistently.
- Onboarding chat is the exception: it uses `VITE_CHAT_API_URL` and sends the
  client-held conversation state with each request. Locally this targets
  Express `/chat`; production targets the stateless `/api/chat` handler.
- Check `response.ok`, parse backend error messages when useful, and expose
  loading, empty, success, and error states appropriate to the feature.
- Do not put secrets or JWTs in browser storage. The JWT is intentionally held
  in an HTTP-only cookie.

### Frontend testing

Place focused tests near the implementation as `*.test.js` or `*.test.jsx`.
Prioritize user-observable behavior and pure business logic. Avoid testing
implementation details that make harmless refactors expensive.

## 3. Backend

### Stack and entry points

- Node.js 22 with ES modules
- Express 5
- PostgreSQL through `pg` (no ORM)
- Node's built-in test runner
- ESLint

`backend/src/index.js` configures CORS, Stripe's raw webhook body, JSON parsing,
cookies, and the `/chat`, `/auth`, and `/stripe` route groups. It starts a local
server outside Vercel and exports the Express app for serverless deployment.

`backend/api/chat.js` is the stateless Vercel handler for onboarding chat. Keep
its accepted input and response shape aligned with the local Express chat path.
Do not introduce server-held chat session state without an explicit
architecture decision.

### Feature layering

Backend features are grouped by domain, for example:

```text
src/journalEntries/
├── journalEntries.controller.js  # HTTP validation and responses
└── journalEntries.service.js     # SQL and domain persistence
```

Use the existing layers:

1. **Route**: declares path, HTTP method, middleware, and controller.
2. **Controller**: validates request input, calls services, selects status codes,
   returns JSON, and handles expected errors.
3. **Service**: performs parameterized SQL or external-service operations and
   maps persistence data into API-friendly objects.

Do not place SQL in React components or frontend code. Do not trust a client
supplied user ID for user-owned resources; protected controllers use
`req.user.id`, populated by `requireAuth`.

### Authentication

Authentication uses passwordless magic links:

1. `POST /auth/login` creates and emails a short-lived token.
2. `GET /auth/verify` validates it, creates or updates the user, issues a
   JWT in an HTTP-only cookie, and redirects to `/?auth=success`.
3. `requireAuth` validates the cookie and loads the active user from PostgreSQL.
4. `GET /auth/me` lets the SPA bootstrap authenticated user state.

Protected user resources live under `/auth/me/...` and apply `requireAuth`.
They are currently registered together in `backend/src/auth/auth.routes.js`,
even when their controllers and services belong to domains such as journal
entries or session unlocks.
Cookie-enabled CORS requires the frontend and backend environment origins to
remain aligned.

## 4. Database

PostgreSQL access is centralized in `backend/src/db/db.js` through a shared
`pg.Pool` configured by `DATABASE_URL`.

- Schema changes are raw, numbered SQL files in `backend/src/db/migrations/`.
- Add migrations; do not rewrite an already-applied migration.
- Use `snake_case` plural table names and `snake_case` columns.
- Use UUID primary keys for user-owned records unless the domain already uses a
  different stable key.
- Use `*_id` foreign keys and `*_at` timestamp names.
- Use constraints for data integrity and indexes for demonstrated query paths.
- User-owned foreign keys normally use `ON DELETE CASCADE`.
- SQL must be parameterized (`$1`, `$2`, ...) rather than interpolated.
- API responses use JavaScript-friendly camelCase, mapped in the service layer.

Migrations are currently applied manually to each environment. Document the
application command and verify the resulting schema in the feature handoff.

## 5. External services and deployment

- PostgreSQL stores users, auth tokens, progress, journal data, and summaries.
- Resend sends magic-link emails.
- Stripe provides Checkout and webhook-driven payment updates.
- Hugging Face powers onboarding, journal transcription, and weekly summaries.
- Frontend and backend deploy as separate Vercel projects.

Configuration belongs in environment variables described by `ENV_SETUP.md`.
Never commit `.env` files, API keys, database URLs, raw tokens, or webhook
secrets.

## 6. Change conventions

For new work:

1. Extend an existing feature module when ownership is clear.
2. Introduce a new module only when it represents a distinct domain.
3. Reuse established providers, API transport, middleware, components, and
   styles before adding abstractions.
4. Keep frontend authorization UX separate from backend authorization checks.
5. Add tests for new business rules, parsing, validation, or important user
   behavior.
6. Record significant architectural or product trade-offs in `DECISIONS.md`.
7. Update relevant documentation when routes, environment variables, schema,
   deployment behavior, or developer commands change.
8. Keep implementation names, comments, and prompts in English. User-facing
   product copy may be Spanish, English, or both: the journaling module and
   shared chrome are bilingual with English as the default, while educational
   content remains Spanish until it is translated.
