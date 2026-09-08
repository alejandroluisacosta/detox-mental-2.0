# Feature Workflow

Planning happens in Cursor Plan Mode. This covers implementation to handoff.

## Before implementing
Read `.cursor/docs/architecture.md`, the files you will change, and their
nearest tests. Restate the plan's acceptance criteria as observable behavior:
the success path, plus whichever of error, empty, loading, auth, or
persistence states actually apply.

## Implementing
Extend existing modules. Reuse existing providers, transport, and components.
Keep the diff to the requested scope. Add tests for new business rules and
real regression risk. Explain any architecture deviation before writing it.

## Validating
In both `frontend/` and `backend/`: `npm run lint`, `npm run test`
In `frontend/` only: `npm run build`

Then review your own diff for scope creep, debug leftovers, committed `.env`
or generated files, and secrets. Smoke-test each acceptance criterion in the
running app.

## Handing off
Report what changed, what you verified, what you did NOT verify, and any
migration or env step. Propose a commit message.

Never commit, push, open a PR, merge, or deploy without explicit authorization.
