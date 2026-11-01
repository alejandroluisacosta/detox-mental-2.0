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

### ✅ Login email rate limiting (2026-10)

**Issue:** The login endpoint sent a magic-link email on every request with
no limit. An attacker could email-bomb any address or exhaust the Resend
quota, blocking real users from logging in and harming the sending domain's
reputation. This was the **second major vulnerability** identified in the
project (OWASP API4, unrestricted resource consumption, which includes
"denial of wallet").

**Fix:** Login is now rate-limited per email, per IP, and globally, with
counters kept in Postgres (the backend is serverless, so in-memory limits
wouldn't work) and IPs/emails stored only as hashes. The goal is twofold:
keep email delivery available to real users during an attack, and make sure
costs can never run away. See `DECISIONS.md` (2026-10-17) for details.

**Known, accepted gap:** If the global daily cap is reached, legitimate
users are temporarily blocked too. That is a deliberate trade for a hard
cost ceiling.

### ✅ Onboarding chat rate limiting (2026-10)

**Issue:** The onboarding chat endpoint is public (no login) and each request
could trigger up to two Hugging Face model calls. Nothing limited how many
calls a script could make, and the server trusted the conversation state sent
by the client, including an arbitrarily large "thought" text. An attacker
could run up model costs or exhaust the quota, and the same unrestricted
resource consumption (OWASP API4, "denial of wallet") applied here as with
login.

**Fix:** Model calls are now limited per IP and globally, using the same
Postgres-backed limiter as login. When a limit is hit, onboarding keeps
working with canned replies instead of failing, so real users are never
locked out. The client-supplied text is also validated (one sentence, at most
300 characters), and the server denies model calls by default unless a limit
check is wired in. See `DECISIONS.md` (2026-10-17) for details.

**Known, accepted gap:** Limits are per IP, not per user, so people sharing
an IP share an allowance. If the global daily cap is reached, everyone gets
the canned replies until it resets. That is a deliberate trade for a hard
cost ceiling.

### ✅ Journal transcription rate limiting (2026-10)

**Issue:** The journal image transcription endpoint requires login, but each
request is a Hugging Face vision model call and nothing limited how many a
single account could make. Anyone with an account could loop it and run up
model costs (OWASP API4, "denial of wallet").

**Fix:** Each user is now limited to 3 transcriptions per day, using the same
Postgres-backed limiter as login and the chat. The check runs after the upload
is validated, so invalid uploads don't count, and a limited user gets a
localized `429` with no model call. If the limit check hits a database error,
the request is refused (fail closed). See `DECISIONS.md` (2026-10-17) for
details.

**Known, accepted gap:** There is no global cap, only the per-user limit, so
total spend scales with the number of accounts. Account creation is gated by
the login limits.

### ✅ Anonymous first reflection, limited by design (2026-10)

**Risk:** Visitors who are not signed in can get a first reflection on one
entry, and each one is a Hugging Face call. Without limits, anyone could
script the endpoint and run up model costs (OWASP API4, "denial of wallet").

**Design:** Limits were built in from the start: 30 reflections per day
globally and 2 per IP per day, using the same Postgres-backed limiter. Entries
must be 200–3,000 characters, checked before the limiter so invalid requests
don't count. A database error refuses the request (fail closed), and
`FIRST_REFLECTION_DISABLED=true` turns the endpoint off. Nothing from the
visitor is stored or logged. See `DECISIONS.md` (2026-10-29) for details.

**Known, accepted gap:** IP limits are easy to spread across, so only the
global cap is a real bound. Once it's reached, visitors see a "used up"
message until the window passes.

---

## In progress

Other access-control, abuse-prevention, and data-handling items identified
in past audits are being worked through one at a time, following the same
test-first process as the fix above. They'll be added here, with full
detail, once resolved.
