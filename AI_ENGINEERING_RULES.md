# AI‑Assisted Engineering Rules --- Detox Mental

This file exists to prevent **architectural drift, epistemic debt, and
AI‑induced loss of ownership**.

It is not aspirational. It is operational.

------------------------------------------------------------------------

## 1. One‑Time Setup (do these once, then maintain)

### ☐ Create `ARCHITECTURE.md`

Purpose: Maintain a single, coherent narrative of the backend.

Must include: - What the system **does** - What the system **explicitly
does NOT do** - Main components (API, Auth, Payments, DB, Jobs, etc.) -
Data flow between components - Explicit assumptions (scale, trust, cost,
latency)

Rule: \> If I cannot explain a component clearly here, I do not
understand it yet.

------------------------------------------------------------------------

### ☐ Create `DECISIONS.md`

Purpose: Kill silent drift by recording intent.

Each entry must contain: - Decision - Why this option was chosen - Why
obvious alternatives were rejected - What would trigger revisiting the
decision

Rule: \> Every non‑obvious decision must leave a trace.

------------------------------------------------------------------------

### ☐ Create per‑domain mini READMEs (only if needed)

For folders like `auth/`, `users/`, `payments/`.

Each README answers: - What problem this domain solves - Invariants it
must uphold - What it must never do

Rule: \> If I need comments to explain intent, I need a README instead.

------------------------------------------------------------------------

## 2. Ongoing Rules (apply continuously)

### Rule 1: AI Is a Proposer, Not an Authority

-   AI suggestions are **inputs**
-   I am the final editor and owner
-   "The AI suggested it" is not an acceptable explanation

------------------------------------------------------------------------

### Rule 2: Rewrite Designs Before Implementing

Process: 1. Ask AI for a design 2. Close the AI output 3. In a blank
file, write: - The problem - The entities involved - The invariants -
The failure cases 4. Re‑open AI output and compare

Rule: \> If I can't reconstruct the design unaided, I'm not ready to
implement it.

------------------------------------------------------------------------

### Rule 3: No Black Boxes Allowed

-   If I can't explain a piece of code in 3 sentences, I must:
    -   Rewrite it, or
    -   Simplify it, or
    -   Delete it

Rule: \> Unexplainable code is technical debt, regardless of
correctness.

------------------------------------------------------------------------

### Rule 4: Prepare to Explain the System at Any Time

I must be able to explain: - Why data is shaped the way it is - Where
invariants are enforced - What happens when components fail

Rule: \> If a senior engineer asked "why?", I must have an answer.

------------------------------------------------------------------------

## 3. Architecture Consolidation Pass (every 1--2 weeks)

Timebox: 60--90 minutes

Steps: 1. Read `ARCHITECTURE.md` and `DECISIONS.md` fully 2. Compare
them to the current codebase 3. Identify: - One simplification - One
rename - One deletion (mandatory) 4. Apply changes 5. Update
documentation

Rule: \> Deletion is not optional. Drift always accumulates.

------------------------------------------------------------------------

## 4. Tooling Rule

-   One project → one architectural authority
-   Multiple AI tools are allowed **only** if one remains primary
-   Experimental AI work must be rewritten from scratch before merging

Rule: \> Coherence beats brilliance.

------------------------------------------------------------------------

## 5. Final Check (before shipping any major feature)

Ask: - Do I understand why this exists? - Could I explain it without the
AI present? - Does it strengthen or weaken the project's narrative?

If any answer is "no" → stop.

------------------------------------------------------------------------

**This file is part of the system.\
Ignoring it is a conscious decision --- record it in `DECISIONS.md`.**
