# Deployment Runbook

## Source of Truth

- GitHub is the source of truth for application code.
- `main` is the production branch.
- `staging` is optional, but recommended for event rehearsal releases.
- Vercel preview deployments should run for every pull request.

## Required Local Gate

Run the same commands locally before opening or merging a PR:

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm run test:run
```

## Vercel

Use the repository root as the Vercel project root.

- Framework: Vite
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

Required Vercel environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Supabase

Apply migrations before promoting a release:

```sh
supabase db push
supabase functions deploy
```

Required Supabase Edge Function secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `PUBLIC_APP_URL`
- `ALLOWED_ORIGINS`

Set secrets with:

```sh
supabase secrets set KEY=value
```

`ALLOWED_ORIGINS` is a comma-separated list. Example:

```sh
ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com
```

## Release Checklist

- CI is green on the release branch.
- Supabase migrations are applied to the target environment.
- `process_qr_check_in` exists and returns `success`, `duplicate`, `invalid`, `wrong_event`, `expired`, or `unauthorized`.
- A real mobile QR scan has been tested against staging data.
- Duplicate scan returns a duplicate warning and does not overwrite `checked_in_at`.
- Vercel production environment variables point to the production Supabase project.
- Stripe is in test mode for staging and live mode only after explicit production approval.
- Rollback target is known: previous Vercel deployment plus the matching Supabase migration state.
