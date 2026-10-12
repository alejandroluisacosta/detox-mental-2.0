# Security Checklist

A public log of access-control and security work on Detox Mental: what's been
found, what's been fixed, and why. This is a personal learning project in
cybersecurity as much as it is product work — see `DECISIONS.md` for the
full reasoning behind each fix.

**This is a work in progress.** Items move from "resolved" to this list as
they're fixed; other known issues are being worked through privately and
are not listed here until they're resolved, so that this file doesn't
double as a target list for a live, public app.

---

## Resolved

### ✅ Session unlock codes verified server-side (2026-10)

**Issue:** Course session unlock codes shipped in `frontend/src/data/codes.json`
and were checked in the browser. The backend accepted a session unlock for
any session 1–15 from any logged-in user with no code verification at all —
broken access control (OWASP A01).

**Why the codes were public in the first place:** This was an explicit
decision, not an oversight. In 2025, with no confirmed demand for the
course yet, I kept unlock verification entirely client-side for two
reasons: (1) convenience — the frontend existed before any backend did,
and client-side codes meant I didn't need one yet to ship the feature; and
(2) by design, I wanted the codes to work a bit like "easter eggs" —
findable by anyone curious enough to open devtools. I was deliberately
willing to allow that kind of "piracy," because someone going out of their
way to find and share a code would have been a real, if informal, signal
of demand for the course.

As time passed, I chose not to market the course, so that demand never
materialized either way. Meanwhile, I started taking cybersecurity more
seriously, and two independent audits (one via Grok 4.7, one via Claude
Opus 5.5) both flagged the public codes as the **#1 vulnerability** in the
project. That's what finally moved this from "acceptable tradeoff" to
"fix it": codes are now verified server-side and can no longer be read by
inspecting the frontend bundle or devtools.

**Fix:** Unlock codes are now stored server-side (hashed) and verified in
the backend; the frontend no longer has access to them in any form. See
`DECISIONS.md` (2026-10-11 entries) for the full technical writeup,
including why a keyed HMAC is used instead of a plain hash.

**Note — the course audio files are a deliberate exception:** The audio
files for each session (`frontend/public/session_*.mp3`) are still reachable
by anyone who knows or guesses the URL — this was *not* fixed alongside the
codes, on purpose. Moving them server-side would mean real backend
infrastructure (authenticated streaming or signed URLs) and likely some
hosting cost, for a course that still has no confirmed demand. Same logic
as before: I'd genuinely be glad to see a technical user "steal" a session
file — it would mean someone cared enough to look. If that starts happening
with any regularity, that's the signal to invest in properly securing them.

---

## In progress

Other access-control, abuse-prevention, and data-handling items identified
in past audits are being worked through one at a time, following the same
test-first process as the fix above. They'll be added here, with full
detail, once resolved.
