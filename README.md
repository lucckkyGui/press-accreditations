# Press Accreditations

Self-serve press & media accreditation for events — online applications,
organizer review, QR passes, and on-site check-in.

## Features

- **Public accreditation forms** — media apply online, per event
- **Organizer review & decisions** — approve, limited access, waitlist, or
  reject, each with an automated decision email
- **Per-guest QR pass** — a secure personal link (`/pass`) plus a numeric
  check-in code
- **Mobile-first check-in scanner** — offline-capable PWA for fast on-site entry
- **Role-based access** — admin / organizer / staff, enforced with Postgres
  Row-Level Security
- **Post-event coverage** — collect published coverage with automated reminders
- **Billing** — subscriptions via Stripe
- Supporting infrastructure: audit logging, GDPR data export, transactional email

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui — offline
  storage via Dexie, shipped as a PWA, deployed on Vercel
- **Backend:** Supabase — Postgres, Row-Level Security, Edge Functions (Deno)
- **Email:** Resend
- **Payments:** Stripe

## Getting started

Prerequisites: **Node 22** and npm.

```bash
npm install
npm run dev
```

### Quality gate

Run before every commit:

```bash
npm run typecheck && npm run lint && npm run test:run
```

## Project structure

```
src/                    Frontend application
supabase/functions/     Edge Functions (Deno)
supabase/migrations/    Database schema (SQL migrations)
docs/                   Internal docs — release plan, backlog, runbooks
```

## Deployment

- **Frontend** — Vercel; production deploys automatically from `main`
- **Edge Functions** — `supabase functions deploy <name> --use-api`
- **Database** — apply schema changes via migration files, then `supabase db push`

## Configuration

The frontend (Vite) and Edge Functions (Supabase secrets) read configuration —
the Resend API key, public app URL, allowed CORS origins, Stripe keys — from
environment variables. Never commit secret values.
