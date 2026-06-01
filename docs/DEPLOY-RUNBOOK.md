# DEPLOY RUNBOOK — STAGING

> Scope: deploy DB migrations + edge functions + secrets to a **STAGING** Supabase
> project. **Do NOT run against production.** All commands below are executed by a
> human, step by step. Claude does **not** run `db push` or `functions deploy`.

Audit ref: **K4** — 23 migrations, 19 deployable edge functions (+ `_shared` helper),
remote DB state unconfirmed. Core paths (landing register, decision e-mail, pass,
coverage submit, reminder) do not work until migrations + functions + secrets are live.

---

## ⚠️ Read first — guardrails

1. **`supabase/config.toml` line 1 pins `project_id = "jozgpssnypclwzqnowhh"`** — the current
   Supabase project (the previous `ajotwgirccdjntuotxzy` project was deleted). This value does
   *not* control where `db push` / `functions deploy` go (the linked project does), but it's a
   footgun. Confirm every command targets your **intended ref** via `--project-ref` and/or
   `supabase projects list` before pressing enter.
2. Run all commands from the repo root: `press-accreditations-main/`.
3. Use the staging ref everywhere below. Set it once in your shell:
   ```bash
   export STAGING_REF="<your-staging-project-ref>"   # e.g. abcd1234efgh5678
   ```
4. Required CLI: Supabase CLI ≥ 1.200 (`supabase --version`), logged in (`supabase login`).
5. You will be prompted for the **staging DB password** during `link` / `db push`.

---

## Step 0 — Sanity check (no writes)

```bash
supabase --version
supabase projects list                  # confirm STAGING_REF is in the list and is NOT prod
ls supabase/migrations | wc -l           # expect 23
ls supabase/functions | grep -v _shared | wc -l   # expect 19
```

---

## Step 1 — Link to STAGING

```bash
supabase link --project-ref "$STAGING_REF"
```

Verify you're linked to the intended project (the old `ajotwgirccdjntuotxzy` was deleted):

```bash
cat supabase/.temp/project-ref     # must equal $STAGING_REF
```

---

## Step 2 — Inspect remote DB state BEFORE pushing

Remote state is unconfirmed (K4). Diff local migrations vs. what staging already has:

```bash
supabase migration list --linked
```

- `Local` column = files in repo. `Remote` column = applied on staging.
- If staging is empty/new → all 23 will apply.
- If some already applied → only the gap applies. **Do not** force-repair unless rows are
  out of sync; if `migration list` shows a mismatch, stop and review before Step 3.

> Note: migration `20260330_performance_indexes.sql` has a non-standard name (missing the
> full 14-digit timestamp + hash). It still sorts/apply correctly, but `migration list`
> may render its version oddly. This is expected — do not rename it mid-deploy.

---

## Step 3 — Push migrations to STAGING

Dry run first to see exactly what will execute:

```bash
supabase db push --linked --dry-run
```

Review the output, then apply:

```bash
supabase db push --linked
```

Re-verify all 23 are now applied:

```bash
supabase migration list --linked     # Local and Remote columns should match
```

---

## Step 4 — Set secrets on STAGING

Set **only** the app-level secrets below. **Never** set `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` — those are reserved and auto-injected
by the platform into every function (setting them manually is rejected / breaks things).

Required for the core smoke flows:

```bash
supabase secrets set --project-ref "$STAGING_REF" \
  RESEND_API_KEY="<staging resend key>" \
  PUBLIC_APP_URL="https://<your-staging-frontend-domain>" \
  ALLOWED_ORIGINS="https://<your-staging-frontend-domain>"
```

Required only if you smoke-test billing (Stripe) flows:

```bash
supabase secrets set --project-ref "$STAGING_REF" \
  STRIPE_SECRET_KEY="sk_test_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..."
```

Optional — AI features (support chat, face recognition). Skip if not testing them:

```bash
supabase secrets set --project-ref "$STAGING_REF" \
  LOVABLE_API_KEY="<key>"
```

Confirm what's set (values are masked):

```bash
supabase secrets list --project-ref "$STAGING_REF"
```

> `PUBLIC_APP_URL` / `ALLOWED_ORIGINS` must point at the **staging frontend origin**, or
> CORS (`_shared/cors.ts`) falls back to `http://localhost:8080` and browser calls from
> staging will be blocked. `PUBLIC_APP_URL` is also used to build links inside decision
> e-mails and reminders — wrong value = wrong links in the e-mails.

---

## Step 5 — Deploy edge functions

Deploy all functions in one shot (reads `verify_jwt` settings from `config.toml`):

```bash
supabase functions deploy --project-ref "$STAGING_REF"
```

Or deploy the 5 core functions individually if you prefer a staged rollout:

```bash
supabase functions deploy landing-page-register --project-ref "$STAGING_REF"
supabase functions deploy send-decision-email    --project-ref "$STAGING_REF"
supabase functions deploy coverage-submit         --project-ref "$STAGING_REF"
supabase functions deploy coverage-reminders      --project-ref "$STAGING_REF"
supabase functions deploy public-api              --project-ref "$STAGING_REF"
```

List deployed functions:

```bash
supabase functions list --project-ref "$STAGING_REF"
```

---

## Step 6 — Frontend env (staging build)

The frontend now **fails fast** without these (per K3 change). Set in the staging host
(Vercel/Netlify/etc.) build env, then redeploy the frontend:

```
VITE_SUPABASE_URL=https://<STAGING_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<staging anon/publishable key>
VITE_SUPABASE_PROJECT_ID=<STAGING_REF>
```

(Get the anon key from: Supabase Dashboard → staging project → Settings → API.)

---

## Post-deploy verification (quick health)

```bash
# health-check function responds
curl -s "https://$STAGING_REF.supabase.co/functions/v1/health-check" \
  -H "apikey: <staging anon key>" | jq .
```

Then run the **smoke checklist** in `STAGING-SMOKE-CHECKS.md` (provided separately).

---

## Appendix A — Secret → code usage map

| Secret | Set manually? | Used by (functions) |
|---|---|---|
| `RESEND_API_KEY` | ✅ required | send-decision-email, coverage-reminders, landing-page-register, send-invitation-emails, embed-register, waitlist-manage, check-resource-alerts |
| `PUBLIC_APP_URL` | ✅ required | _shared/cors.ts, send-decision-email, coverage-reminders |
| `ALLOWED_ORIGINS` | ✅ recommended | _shared/cors.ts (CORS allowlist; first origin wins) |
| `STRIPE_SECRET_KEY` | ⬜ only for billing | stripe-webhook, create-checkout, customer-portal |
| `STRIPE_WEBHOOK_SECRET` | ⬜ only for billing | stripe-webhook |
| `LOVABLE_API_KEY` | ⬜ only for AI | ai-support-chat, face-recognition |
| `SUPABASE_URL` | ❌ auto-injected | 25 references across functions |
| `SUPABASE_ANON_KEY` | ❌ auto-injected | audit-logs, create-checkout, send-invitation-emails, health-check, send-decision-email, face-recognition, coverage-reminders |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ auto-injected | 19 references across functions |

## Appendix B — Function inventory (19 deployable + `_shared`)

`verify_jwt = false` (public, set in config.toml): send-invitation-emails, public-api,
webhook-dispatcher, face-recognition, create-checkout, check-subscription, customer-portal,
ai-support-chat, embed-register, waitlist-manage, stripe-webhook, check-resource-alerts,
gdpr-export, landing-page-register.

`verify_jwt = true` (default — caller must send a valid JWT in `Authorization`):
**audit-logs, coverage-reminders, coverage-submit, health-check, send-decision-email.**

## Appendix C — Known risks to watch during smoke test

1. **`coverage-submit` is `verify_jwt = true`** but the frontend (`src/pages/CoverageForm.tsx`)
   calls it sending **only** an `apikey` header, no `Authorization: Bearer`. This can return
   **401** at the gateway. If the coverage-submit smoke check fails with 401, the fix is
   either (a) add `[functions.coverage-submit] verify_jwt = false` to `config.toml` and
   redeploy, or (b) send `Authorization: Bearer <anon key>` from the client. **Do not change
   this blind** — confirm the 401 first, then decide. (Out of scope for this deploy; flagged.)
2. **`coverage-reminders` is `verify_jwt = true`** and there is **no pg_cron** in migrations —
   it is not auto-scheduled. Trigger it manually (with a service-role bearer) or wire an
   external scheduler. The reminder smoke check below uses a manual invoke.
3. **`config.toml project_id` = production ref** — re-confirm `supabase/.temp/project-ref`
   equals `$STAGING_REF` before every push/deploy.
