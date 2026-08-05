# Feature Workflow

(Note: Planning happens via Cursor Plan Mode before this workflow begins.)

Whenever implementing a feature:

## 1. Before Implementing

Read:

- `.cursor/docs/architecture.md`
- `.cursor/docs/definition-of-done.md`
- `.cursor/docs/code-review-checklist.md`
- the approved implementation plan
- the files directly involved in the change and their nearest tests

Apply the engineering principles (`.cursor/rules/engineering-principles.mdc`).

Translate the approved plan into concise, observable acceptance criteria before
editing code. At minimum, identify the primary success path and the relevant
error, empty, loading, authentication, or persistence behavior.

Confirm that the planned change fits the current architecture. Explain any
significant deviation before implementation.

---

## 2. Implement

Reuse existing architecture whenever possible.

Keep changes focused.

Avoid unrelated refactoring.

Implement against the acceptance criteria. Add or update focused tests for new
business rules and meaningful regression risks.

Update documentation when the change affects architecture, API routes,
database migrations, environment variables, deployment, or developer setup.

---

## 3. Validate

Run the complete validation harness in `docs/harness.md`:

1. static analysis
2. build verification
3. test execution
4. structured AI code review
5. human final-diff review and smoke testing
6. final completion decision

Resolve failures before continuing.

---

## 4. Report

Summarize:

- what changed
- which acceptance criteria were verified
- validation and smoke tests performed
- remaining limitations
- possible future improvements
- migration or deployment steps, when applicable

## 5. Provide commit description

End the task by providing a recommended commit message reflecting the changes made.

After human approval, create a focused commit and pull request with a concise
summary and test plan. Do not commit, open a pull request, merge, or deploy
without explicit human authorization.