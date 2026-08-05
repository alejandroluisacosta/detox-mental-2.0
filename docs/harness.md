# Feature Validation Harness

## Purpose

This harness defines the required steps that must be completed before any AI-assisted feature is considered finished and ready to commit.

It ensures consistency, correctness, and maintainability of all changes in the codebase.

---

## Execution Order

The steps must be executed in this exact order:

---

This is a monorepo with two independent packages (`frontend/` and `backend/`),
each with its own `package.json` and tooling. Run package commands in both
directories where the step says to do so.

## 0. Acceptance criteria and scope

Before validation, record the observable acceptance criteria defined during
planning and identify the files intentionally changed.

### Requirement:

- Every acceptance criterion can be verified through a test or manual check
- The diff contains no unrelated refactoring
- Any intentionally deferred behavior is documented

## 1. Static analysis

Run in `frontend/` and in `backend/`:

```bash
npm run lint
```

### Requirement:

- No linting errors allowed
- All warnings must be reviewed and either fixed or explicitly justified

## 2. Build verification

Run in `frontend/` (the backend has no build step):
```bash
npm run build
```
### Requirement:
- Project must compile successfully
- No type or build errors allowed

## 3. Test execution

Run in `frontend/` and in `backend/`:
```bash
npm run test
```

### Requirement:
- All tests must pass
- No skipped tests unless explicitly justified

## 4. AI Code Review

Perform a structured review using:

- .cursor/docs/code-review-checklist.md

Evaluate the implementation for:

- correctness
- simplicity
- readability
- duplication
- architecture consistency
- edge cases
- accessibility
- maintainability

Requirement:
All Critical issues must be fixed
- Important issues should be fixed unless explicitly deferred with justification

## 5. Human review

### Final diff review

Review the complete Git diff, including staged, unstaged, and untracked files.
Check for:

- correctness and alignment with the approved plan
- unrelated changes or accidental generated files
- debug statements, dead code, and temporary comments
- secrets, credentials, `.env` files, or sensitive user data
- schema/configuration changes that need operational instructions
- adequate tests for the regression risk

### Manual smoke test

Exercise each acceptance criterion in the running application. Include the
relevant user states, such as authenticated/guest, success/error, and
empty/populated data. Check the affected viewport sizes and keyboard interaction
when the UI is responsive or interactive.

Also evaluate:

- Does the feature behave as intended?
- Does it introduce unnecessary complexity?
- Does it align with existing architecture?
- Is the UI/UX consistent with the project?
- Does nearby existing behavior still work?

Record what was tested and any limitations in the final report.

## 6. Final decision

Only proceed to commit if all conditions are met:

- lint passes
- build passes
- tests pass
- critical review issues resolved
- acceptance criteria manually verified
- final diff reviewed
- no secrets or unrelated changes included
- feature is complete and scoped correctly

## Pull request readiness

After the final decision passes, prepare a focused commit and pull request:

- concise title describing the outcome
- summary of behavior and relevant technical decisions
- test plan listing automated checks and manual smoke tests
- migration, environment, rollout, or rollback notes when applicable
- known limitations or explicitly deferred follow-ups

Opening a commit or pull request still requires explicit human authorization.

## Commit rule

Do not commit partially validated features.

If any step fails, the feature is not complete.