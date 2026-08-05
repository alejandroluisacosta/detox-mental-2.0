# Definition of Done

A feature, fix, or refactor is done only when the applicable conditions below
are satisfied. Items that do not apply must be explicitly marked as such in the
final report rather than silently skipped.

## 1. Acceptance criteria

Before implementation, define a small set of observable acceptance criteria
from the approved plan. Each criterion should describe behavior that a person
can verify, not an implementation detail.

Basic template:

```text
Given <starting state>
When <user or system action>
Then <observable result>
```

For a typical feature, cover at minimum:

- **Primary path:** the intended user action succeeds.
- **Validation/error path:** invalid input or a failed dependency produces a
  controlled response and useful feedback.
- **State variants:** relevant loading, empty, authenticated/guest, or
  permission states behave correctly.
- **Persistence:** created or changed data is retained and scoped to the correct
  user when persistence is part of the feature.

Keep acceptance criteria proportional to the change. A small correction may
need only one or two criteria; a cross-stack feature will need more.

## 2. Implementation

- The approved acceptance criteria are satisfied.
- The change follows `.cursor/docs/architecture.md` and existing conventions.
- Scope is limited to the requested work; unrelated cleanup is excluded.
- Existing components and utilities are reused where reasonable.
- Input is validated at the appropriate trust boundary.
- Loading, empty, success, and error states are handled where relevant.
- User-owned backend operations enforce authentication and ownership.
- Accessibility basics are present: semantic HTML, labels, keyboard access, and
  visible focus behavior for interactive controls.
- New dependencies and architectural changes are justified.
- Schema or environment changes include migration/setup documentation.

## 3. Testing and automated validation

- Tests are added or updated for new business rules and meaningful regression
  risk.
- Frontend and backend lint complete without errors.
- Warnings are reviewed and either fixed or documented as pre-existing or
  intentionally accepted.
- The frontend production build succeeds.
- Frontend and backend tests pass without unexplained skips.
- The structured AI code review finds no unresolved Critical issues.
- Important review findings are fixed or explicitly deferred with a reason.

The exact commands and order are defined in `docs/harness.md`.

## 4. Human verification

- The final Git diff is reviewed for correctness, scope, accidental files,
  generated output, debug code, and secrets.
- The acceptance criteria are manually smoke-tested in the relevant user
  states and viewport(s).
- Existing behavior near the changed area receives a focused regression check.
- Database migrations are verified in a safe environment before production.
- The implementation and any known limitations are understood by the human
  reviewer; AI output is not accepted solely because automated checks pass.

## 5. Documentation and handoff

- Relevant architecture, environment, schema, API, and product documentation is
  updated.
- The final report states:
  - what changed
  - validation performed
  - known limitations
  - deferred follow-up work
  - migration/deployment steps, when applicable
- A concise commit message is proposed.
- The branch is ready for a focused pull request with a summary and test plan.

## 6. Final gate

Do not commit, open a pull request, merge, or deploy partially validated work.
If a required condition cannot be completed, report the blocker and treat the
change as not done.
