# Detox Mental — Authentication Architecture (v0.5)

## 1. Purpose

This document defines the authentication and user-account architecture for Detox Mental.

The goal is to:

- Enable secure user authentication
- Support future paid features
- Store user progress and personal data
- Keep the system simple, scalable, and secure

Authentication is implemented using **magic links**, **JWT cookies**, and **PostgreSQL**.

---

# 2. Technology Stack

Backend

- Node.js
- Express
- PostgreSQL

Infrastructure

- Vercel deployment
- Environment variables stored in Vercel

Authentication

- Magic link email login
- JWT stored in HTTP-only cookie

Email

- Resend email service

Payments

- Stripe (future integration)

---

# 3. Authentication Strategy

Detox Mental uses **passwordless authentication**.

Users log in via a **magic link sent to their email**.

Advantages:

- No password storage
- Reduced friction for users
- Reduced security surface

Authentication flow:

1. User enters email
2. Backend generates secure login token
3. Token is emailed as magic link
4. User clicks link
5. Backend verifies token
6. JWT cookie is issued

---

# 4. Login Flow

## Step 1 — Request Login Link

Endpoint:

POST /auth/login

Input:

- email

Behavior:

- Normalize email (trim + lowercase)
- Generate secure random token
- Hash token before storing
- Store token in database
- Expiration: 15 minutes
- Send email with login link

Security rule:

Return generic success message regardless of whether email exists.

---

## Step 2 — Verify Magic Link

Endpoint:

GET /auth/verify?token=...

Backend performs:

- Hash incoming token
- Lookup token in database
- Ensure token exists
- Ensure token not expired
- Ensure token not already used

If valid:

- Mark token as used
- Create user if first login
- Update last_login_at
- Generate JWT
- Set HTTP-only cookie
- Redirect to frontend

User is created **only after successful verification**.

---

# 5. JWT Authentication

JWT is stored in a secure cookie.

Cookie settings:

- HttpOnly
- Secure
- SameSite=Lax
- Path=/
- Max-Age=14 days

JWT contains:

- user_id
- role
- expiration

JWT signing secret is stored in **Vercel environment variables**.

---

# 6. Logout

Endpoint:

POST /auth/logout

Behavior:

- Clear authentication cookie

No database operation required.

---

# 7. Database Schema

## Users

Stores account information.

Fields:

- id (UUID)
- email (unique)
- role
- stripe_customer_id
- stripe_payment_intent_id
- paid_at
- last_login_at
- created_at
- updated_at
- deleted_at

Soft deletion is supported via `deleted_at`.

---

## Magic Link Tokens

Stores login tokens.

Fields:

- id
- user_id
- token_hash
- expires_at
- used_at
- created_at

Tokens expire after **15 minutes**.

Raw tokens are **never stored**.

---

## Course Sessions

Stores the 15 course sessions.

Fields:

- session_id (INTEGER, 1-15)
- title

Notes:

- This table is intentionally minimal and acts as the backend session catalog keyspace.
- Detailed session copy/content (description, images, exercises) is kept in the frontend.

These rows can be seeded during migration.

---

## User Unblocked Sessions

Stores sessions unblocked via unblocking codes.

Fields:

- id
- user_id
- session_id (INTEGER, FK -> course_sessions.session_id)
- unblocked_at

---

## Thoughts

Stores user cognitive entries.

Fields:

- id
- user_id
- content
- created_at

---

## Classifications

Stores classification of thoughts.

Fields:

- id
- thought_id
- distortion_type
- created_at

---

## Plans

Stores behavioral plans.

Fields:

- id
- thought_id
- plan_text
- created_at

---

# 8. Course Unlock Codes

Unlock codes grant access to specific course sessions.

Rules:

- Codes stored in database
- Not stored as environment variables
- No Stripe validation required

Workflow:

1. User enters unlock code
2. Backend validates code
3. Session is added to `user_unblocked_sessions`

---

# 9. Email System

Email delivery handled by **Resend**.

Emails sent:

- Login magic link

Magic link structure:

https://api.detoxmental.com/auth/verify?token=<TOKEN>

Token expiration:

15 minutes.

Tokens are hashed before storage.

---

# 10. Stripe Integration (Future)

Stripe will enable paid course access.

Endpoints:

POST /stripe/create-checkout-session

Webhook:

POST /stripe/webhook

When payment succeeds:

- user role becomes `paid`
- payment timestamp stored
- sessions may be automatically unblocked

Stripe identifiers stored:

- stripe_customer_id
- stripe_payment_intent_id

---

# 11. Environment Variables

Required variables:

JWT_SECRET  
MAGIC_LINK_SECRET  
RESEND_API_KEY  
STRIPE_SECRET_KEY  
STRIPE_WEBHOOK_SECRET

All stored securely in **Vercel environment configuration**.

---

# 12. Security Principles

Key security rules:

- Raw tokens never stored
- Magic link tokens expire quickly
- Authentication handled only by backend
- Email enumeration prevented
- JWT stored in HTTP-only cookie
- Users created only after token verification

---

# 13. Future Extensions

Possible future improvements:

- Multi-device session management
- Rate limiting login attempts
- Email verification analytics
- Admin panel for course sessions