# Backend Invariants

## 1. Never trust a client-supplied user ID
Protected controllers read `req.user.id`, populated by `requireAuth`.

```javascript
// BAD
const entries = await listEntries(req.body.userId);
// GOOD
const entries = await listEntries(req.user.id);
```

## 2. SQL must be parameterized
Use `$1`, `$2`. Never interpolate values into a SQL string.

## 3. The JWT lives only in the HTTP-only cookie
Never return it in a response body. Use `COOKIE_OPTIONS` from
`backend/src/auth/jwt.js`; do not hand-roll cookie flags.

## 4. Layering
Route declares path and middleware. Controller validates input and picks
status codes. Service owns SQL and maps rows to camelCase. No SQL outside
services.

## 5. Migrations are append-only
Add a new numbered file in `backend/src/db/migrations/`. Never edit an
applied one.

## Additional constraints

- Non-admin callers of blog admin routes get **404**, not 403.
- Onboarding chat stays stateless; do not add server-held chat session state
  without an explicit decision.
- Migrations are applied manually via `\i backend/src/db/migrations/<NNN>_<name>.sql`
  in PostgreSQL (see `backend/src/db/README.md`). Handoffs that add a migration
  must name the file and note that the schema was checked.
