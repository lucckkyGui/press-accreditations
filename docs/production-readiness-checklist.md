# PressOps — Production Readiness Checklist

> Lista kontrolna przed pilotażem na realnym wydarzeniu.

## 1. Baza danych / migracje

- [ ] Wszystkie migracje wdrożone (`supabase db push`), w tym Tydzień 4–8:
  - [ ] `20260531150000_decision_flow_access_levels.sql` (statusy, access levels, revoke)
  - [ ] `20260601120000_media_checkin_production.sql` (check-in 7 statusów, checked_in_by)
  - [ ] `20260602120000_media_crm_coverage.sql` (Media CRM + coverage)
- [ ] Wygenerowane typy Supabase zaktualizowane (kolumny access_level, coverage_*).
- [ ] RLS włączone na nowych tabelach (media_contacts/outlets, coverage_*).
- [ ] Polityka INSERT dla `accreditation_types` (auto-tworzenie typu przy passie).

## 2. Edge functions (deploy + env)

- [ ] `landing-page-register`, `send-decision-email`, `coverage-submit`,
      `coverage-reminders`, `audit-logs` — wdrożone.
- [ ] `RESEND_API_KEY` ustawiony (e-maile decyzji + remindery coverage).
- [ ] `PUBLIC_APP_URL` ustawiony (linki `/pass/:token`, `/coverage/:token`).
- [ ] Domena nadawcza e-mail zweryfikowana w Resend.
- [ ] (Opcjonalnie) cron dla `coverage-reminders` (mode=cron, 24h/72h/7d).

## 3. Core flow — QA end-to-end

- [ ] Demo seed przechodzi (`seed_pressops_demo`) bez błędów.
- [ ] Submit przez landing zapisuje zgłoszenie (realne dane, nie mock).
- [ ] Verification scoring liczy się i pokazuje flagi.
- [ ] Decyzja approved tworzy guest + QR + (best-effort) accreditation.
- [ ] E-mail z decyzją wychodzi (lub UI pokazuje warning + resend).
- [ ] QR skanuje się: success / duplicate / wrong_event / expired / revoked / invalid / unauthorized.
- [ ] Check-in działa **offline** (manifest + kolejka sync).
- [ ] Coverage Board: generowanie próśb, submit przez link, verify.
- [ ] Media Coverage Report generuje PDF + CSV (<60 s).

## 4. Placeholdery / dane testowe

- [x] Brak hardcoded demo e-maili w core flow (tylko pliki testowe `*.test.ts`).
- [ ] `BadgeGenerator` (legacy, `eventId: 'event-123'`) nie jest w core scanner UI — OK,
      ale nie używać w demo.
- [ ] Cennik = PressOps (Press Starter / Pro / EventOps Pilot / White-label), nie guest/event.

## 5. UX / urządzenia

- [ ] Landing mobilny (formularz akredytacji na telefonie).
- [ ] Skaner QR na telefonie (kamera + manual + search).
- [ ] Coverage form mobilny (success screen).
- [ ] PDF otwiera się i jest czytelny (polskie znaki — patrz ryzyka).

## 6. Bezpieczeństwo / RODO

- [ ] Role przypisane: staff bramkowy ma rolę organizatora dla eventu.
- [ ] Audit trail dostępny (admin), filtr po resource_id / event_id.
- [ ] Strona `/security-gdpr` aktualna (processors, retencja).
- [ ] RODO export / anonimizacja kontaktu działa (admin, Media CRM).

## 7. Build / CI

- [ ] `npm run lint` — 0 błędów.
- [ ] `npm run typecheck` — czysto.
- [ ] `npm run test:run` — zielone.
- [ ] `npm run build` — przechodzi (Node 22 — patrz `.nvmrc`).
- [ ] Deploy na Vercel z poprawnym env (Supabase URL/key, Stripe).

## 8. Sprzedaż

- [ ] `docs/pilot-package.md` gotowy do wysyłki.
- [ ] `docs/case-study-template.md` gotowy do wypełnienia po evencie.
- [ ] `docs/demo-script.md` — zespół przećwiczył 12-min demo.
- [ ] Przykładowy PDF raport wygenerowany z seeda (do oferty).
