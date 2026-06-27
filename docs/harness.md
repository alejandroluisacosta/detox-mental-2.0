# Feature Validation Harness

## Purpose

This harness defines the required steps that must be completed before any AI-assisted feature is considered finished and ready to commit.

It ensures consistency, correctness, and maintainability of all changes in the codebase.

---

## Execution Order

The steps must be executed in this exact order:

---

## 1. Static analysis

Run:

```bash
npm run lint
```

### Requirement:

- No linting errors allowed
- All warnings must be reviewed and either fixed or explicitly justified

## 2. Build verification

Run:
```bash
npm run build
```
### Requirement:
- Project must compile successfully
- No type or build errors allowed

## 3. Test execution

Run:
```bash
npm run test
```

### Requirement:
- All tests must pass
- No skipped tests unless explicitly justified

## 4. AI Code Review

Perform a structured review using:

- docs/code-review-checklist.md

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

Manually evaluate:

- Does the feature behave as intended?
- Does it introduce unnecessary complexity?
- Does it align with existing architecture?
- Is the UI/UX consistent with the project?

## 6. Final decision

Only proceed to commit if all conditions are met:

- lint passes
- build passes
- tests pass
- critical review issues resolved
- feature is complete and scoped correctly


##Commit rule

Do not commit partially validated features.

If any step fails, the feature is not complete.