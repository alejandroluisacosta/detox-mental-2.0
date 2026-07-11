# Feature Workflow

(Note: Planning happens via Cursor Plan Mode before this workflow begins.)

Whenever implementing a feature:

## 1. Before Implementing

Read:

- `.cursor/docs/architecture.md`
- `.cursor/docs/definition-of-done.md`
- `.cursor/docs/code-review-checklist.md`

Apply the engineering principles (`.cursor/rules/engineering-principles.mdc`).

---

## 2. Implement

Reuse existing architecture whenever possible.

Keep changes focused.

Avoid unrelated refactoring.

---

## 3. Validate

Run the validation harness (steps 1-4 of `docs/harness.md`): static analysis, build verification, test execution, and AI code review.

Resolve failures before continuing.

---

## 4. Report

Summarize:

- what changed
- remaining limitations
- possible future improvements

## 5. Provide commit description

End the task by providing a recommended commit message reflecting the changes made.