# Agent Instructions

## Git

Never commit, push, merge, rebase, reset, or otherwise modify Git history
without explicit user approval. You may inspect Git state and modify
working-tree files, but committing or pushing requires explicit authorization
from the user.

After any working-tree change, propose a commit message in the reply. Do not
commit unless the user explicitly asks.

## Testing

### 1. Test behavior a user or an attacker could observe
A test earns its place by failing when the product breaks. Before writing one,
name the bug it would catch. If you cannot, do not write it.

### 2. Never assert a constant against its own literal
`assert.equal(MAX_ATTEMPTS, 3)` cannot fail for any reason that matters.
Assert what the constant *causes*: the 4th attempt is rejected.

### 3. A fake must enforce every rule the real dependency enforces
If a fake DB ignores the `created_at >= $3` filter, the test proves nothing
about the time window. Make the fake fail the way production fails.

### 4. Prefer the controller boundary to the mocked component
Drive controllers with a fake `req`/`res` and an injected `db`, as in
`blogPosts.controller.test.js`. Services take `db = pool` so tests can pass a
fake. New services must keep that seam.

### 5. Assert outcomes, not mock calls
`expect(navigate).toHaveBeenCalled()` passes when the request went to the wrong
endpoint. Assert the rendered result or the request that was actually sent.

### 6. Every user-owned resource needs a cross-user test
For each protected route: user A must not read, update, or delete user B's row.

### 7. Do not test prompt wording or static data contents
Asserting a template literal contains its own substrings, or that an array has
11 items, is maintenance cost with no risk reduction. Test the branch that
selects the prompt, not the prose.

### 8. Coverage percentage is not a goal
An untested `requireAuth` matters more than a hundred covered format helpers.

## TDD is mandatory

Every change follows **failing test first → implement → verify**:
1. Write the test(s) that capture the desired behavior and watch them **fail** (red).
2. Implement the minimum to make them pass.
3. Run the relevant lint and test commands and confirm they pass.

Don't write implementation before a failing test exists. When fixing a bug, reproduce it with a
failing test first.

## Verify before claiming "done"

Never report something as working without running it. "Done" means the relevant commands in the Commands section passed, and user-facing flows were smoke-tested in the running app. If a command failed or a step was skipped, say so plainly with the output.

## Commands

There is no root script runner. Run package scripts inside each package:

- In `frontend/` and `backend/`: `npm run lint`, `npm run test`
- In `frontend/` only: `npm run build`

## Workflow

Before implementing, read the files you will change and their nearest tests.
Restate the plan's acceptance criteria as observable behavior: the success path,
plus whichever of error, empty, loading, auth, or persistence states actually
apply.

Extend existing modules. Reuse existing providers, transport, and components.
Keep the diff to the requested scope. Add tests for new business rules and
real regression risk. Explain any architecture deviation before writing it.

After implementing, run the commands above. Review your own diff for scope
creep, debug leftovers, committed `.env` or generated files, and secrets.
Smoke-test each acceptance criterion in the running app.

Report what changed, what you verified, what you did NOT verify, and any
migration or env step. Do not open a PR or deploy without explicit
authorization.

## Preferences

- Write code, comments, prompts, docs, and new developer-facing strings in
  English. User-facing product copy may remain in Spanish when that is an
  intentional product choice; keep those strings in UI/copy layers, not in
  prompts, comments, or backend logic.
- Do not introduce a dependency unless its long-term value clearly outweighs
  its maintenance cost.
- Do not edit `DECISIONS.md` unless the user asks.
