# STAGING SMOKE CHECKS

Run after the staging deploy (migrations + functions + secrets + frontend redeploy).
Tick each box. If one fails, note the HTTP status / error and stop before promoting.

Prereqs: staging frontend is live at `PUBLIC_APP_URL`, `RESEND_API_KEY` set, you have an
admin login on staging and access to the Resend dashboard (to confirm e-mail sends).

Set up once:
```bash
export STAGING_REF="<your-staging-project-ref>"
export BASE="https://<your-staging-frontend-domain>"      # = PUBLIC_APP_URL
export ANON="<staging anon/publishable key>"
```

---

### 0. Health
- [ ] `curl -s "https://$STAGING_REF.supabase.co/functions/v1/health-check" -H "apikey: $ANON"` returns 200 / healthy JSON.
- [ ] Open `$BASE` in a browser — app loads, **no** "Missing required environment variable" error in console (confirms K3 frontend env is set correctly).

### 1. Rejestracja na landingu  → `landing-page-register`
- [ ] Open `"$BASE/landing-page/<eventId>"` (a published event's landing page).
- [ ] Submit the public registration form with a real test inbox.
- [ ] UI shows success state.
- [ ] A row appears in the submissions table (Dashboard or DB).
- [ ] Confirmation e-mail arrives (check Resend → Logs for a delivered event).
- [ ] No CORS error in browser console (confirms `ALLOWED_ORIGINS`/`PUBLIC_APP_URL`).

### 2. Decyzja + e-mail  → `send-decision-email`
- [ ] As admin, open the submission from step 1, set decision to **Approved** (and separately test **Rejected**).
- [ ] Decision e-mail arrives at the test inbox (Resend → Logs shows send).
- [ ] **Links in the e-mail point at `$BASE`** (not localhost) — confirms `PUBLIC_APP_URL`.
- [ ] Invoked from the authenticated admin UI (supabase-js attaches the JWT, so the
      `verify_jwt = true` gateway accepts it). A 401 here means the admin session expired.

### 3. Link /pass  → `/pass/:token` + `press_accreditation_issuance`
- [ ] The approval from step 2 produced a pass token / issuance row.
- [ ] Open `"$BASE/pass/<token>"` — the digital pass renders (name, event, QR).
- [ ] QR code is present and the pass is not marked invalid/expired.
- [ ] Open an obviously bad token `"$BASE/pass/not-a-real-token"` → graceful "invalid" state, not a crash.

### 4. Coverage submit  → `coverage-submit`  ⚠️ watch for 401
- [ ] Open `"$BASE/coverage/<coverageToken>"`.
- [ ] Page loads coverage details (this is the GET with `apikey` header).
- [ ] **If you get 401 / blank:** this is the known risk — `coverage-submit` has
      `verify_jwt = true` but the client sends only `apikey`. See Runbook Appendix C #1.
      Decide on the fix (config `verify_jwt = false` + redeploy) — do not change blind.
- [ ] Submit a coverage link/report; UI confirms; row updates in DB.

Direct probe (optional):
```bash
curl -i "https://$STAGING_REF.supabase.co/functions/v1/coverage-submit?token=<coverageToken>" \
  -H "apikey: $ANON"
# Expect 200. A 401 confirms the verify_jwt issue above.
```

### 5. Reminder  → `coverage-reminders`  (no cron — manual trigger)
There is no pg_cron schedule in the migrations, so trigger it manually with a service-role
bearer (get the service role key from Dashboard → Settings → API; keep it secret):
```bash
curl -i -X POST "https://$STAGING_REF.supabase.co/functions/v1/coverage-reminders" \
  -H "Authorization: Bearer <STAGING service_role key>" \
  -H "Content-Type: application/json" -d '{}'
```
- [ ] Returns 200 with a summary (e.g. count of reminders processed).
- [ ] Reminder e-mail(s) arrive at test inbox for any pending-coverage rows (Resend → Logs).
- [ ] Reminder e-mail links point at `$BASE` (confirms `PUBLIC_APP_URL`).
- [ ] A 401 means the bearer is wrong/missing (this function is `verify_jwt = true`).

---

### Sign-off
- [ ] All five core flows pass on staging.
- [ ] Any failure documented with status code + which secret/config it points to.
- [ ] **Production NOT touched.** Promotion to prod is a separate, explicitly-approved step.
