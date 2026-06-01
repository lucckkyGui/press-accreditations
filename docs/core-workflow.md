# PressOps — Core Workflow

> Szczegółowy opis głównej ścieżki produktu.
> Scope i klasyfikacja modułów: [`product-scope.md`](./product-scope.md).

## Ścieżka end-to-end

```
┌─────────┐   ┌──────────────┐   ┌──────────────────┐   ┌──────────────┐
│  Event  │ → │ Accreditation│ → │ Media Submission │ → │ Verification │
│         │   │   Landing    │   │                  │   │              │
└─────────┘   └──────────────┘   └──────────────────┘   └──────────────┘
                                                                 │
        ┌────────────────────────────────────────────────────────┘
        ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────────┐   ┌──────────────┐
│ Approval │ → │ QR Pass  │ → │ Check-in │ → │ Coverage         │ → │ Media Report │
│          │   │          │   │          │   │ Collection       │   │              │
└──────────┘   └──────────┘   └──────────┘   └──────────────────┘   └──────────────┘
```

Każdy krok poniżej: **co się dzieje**, **gdzie w aplikacji**, **dane w Supabase**.

---

## 1. Event

**Co:** Organizator tworzy wydarzenie (nazwa, lokalizacja, daty, pojemność).

- Route: `/events`, szczegóły `/events/:eventId`
- Komponenty: `src/pages/Events.tsx`, `src/pages/EventDetails.tsx`,
  `src/components/events/EventForm.tsx`
- Tabela: `events` (organizer_id, title, location, start_date, end_date, is_published)

## 2. Accreditation Landing

**Co:** Publiczna strona, na której media składają zgłoszenia. Brandowana
per event (logo, kolory, opis, regulamin, konfiguracja pól formularza).

- Route publiczny: `/:slug` (`src/pages/PublicAccreditationPage.tsx`)
- Builder (feature-gated): `/landing-page/:eventId` (`LandingPageBuilder`)
- Tabela: landing page (slug, event_id, form_config, branding)

## 3. Media Submission

**Co:** Dziennikarz / medium wypełnia formularz: nazwa medium, typ mediów,
kontakt, strona, uwagi. Zgłoszenie trafia do bazy jako `pending`.

- Route: publiczny formularz na `/:slug`; lista po stronie organizatora `/guests`
- Komponenty: `PublicAccreditationPage.tsx` (form, sekcje: Dane osoby / Medium /
  Planowana relacja / Dostęp / Zgody), `src/pages/Guests.tsx` (lista zgłoszeń)
- Walidacja (wspólna FE + BE): `src/lib/accreditation/submissionValidation.ts`
  oraz mirror reguł w edge function `landing-page-register`.
- Tabela źródłowa (pełne dane medialne): `landing_page_submissions`
  (first_name, last_name, email, phone, media_organization, media_type, role,
   portfolio_url, publication_links, social_media, coverage_description,
   requested_access, previous_accreditation, consent_data_processing,
   consent_marketing, accreditation_type, flags, status=`pending`).
- **Most do weryfikacji:** trigger `mirror_landing_submission_to_requests`
  kopiuje każde zgłoszenie do `accreditation_requests` (media_name, media_type,
  contact_email, contact_phone, website_url, request_notes, status=`pending`,
  event_id, user_id=organizer_id), dzięki czemu pojawia się w panelu Akredytacje.
- **Walidacja zależna od roli:** photographer → portfolio/linki; video → opis;
  influencer → social media; journalist → redakcja + linki do publikacji.
- **Anty-spam:** honeypot, timing (<3s), rate limit (5/min/IP), blok domen
  disposable, twardy unikat e-mail per landing (409), miękka flaga duplikatu.
- **Terminologia UI:** „Zgłoszenia mediów" / Media Submissions (NIE „Goście").

## 4. Verification

**Co:** Organizer przegląda zgłoszenie — sprawdza medium (strona, typ,
wiarygodność), opcjonalnie dokumenty.

- Route: `/events/:eventId` → tab **Akredytacje**
- Komponent: `src/components/accreditation/AccreditationManagement.tsx`
  (real Supabase query po `accreditation_requests`, filtr po `event_id`)
- Dokumenty (jeśli wymagane): `media_documents`, `document_submissions`

## 5. Approval

**Co:** PR manager podejmuje decyzję w **Panelu decyzji** (tab „Weryfikacja i
decyzje" w evencie). Statusy: `approved`, `approved_limited`, `rejected`,
`waitlisted`. Decyzja jest transaction-like: update statusu → (dla approved /
approved_limited) akredytacja + QR pass → e-mail z decyzją → audit log.

- Komponent: `src/components/accreditation/MediaVerificationPanel.tsx`
  (Decision Panel: status, access level, notatka wewnętrzna, wiadomość do
  wnioskodawcy, przełącznik „wyślij e-mail"; bulk actions: approve / reject /
  waitlist; podgląd QR; status history; cofnięcie akredytacji).
- Serwis: `decideSubmission` + skróty `approveSubmission`, `approveLimitedSubmission`,
  `rejectSubmission`, `waitlistSubmission`, `revokeAccreditation`, `resendDecisionEmail`
  (`src/services/verification/verificationService.ts`).
- Access levels (10): press, photo, video, radio, podcast, influencer, photo_pit,
  interview, backstage_limited, sponsor_media — strefy w `src/lib/accreditation/decisionFlow.ts`.
- E-mail decyzyjny: edge function `supabase/functions/send-decision-email`
  (Resend). E-mail best-effort — błąd nie blokuje decyzji; panel pokazuje warning
  i „Wyślij ponownie".
- Migracja: `20260531150000_decision_flow_access_levels.sql` (statusy, access_level,
  pola rewokacji, blokada check-inu cofniętej akredytacji).
- Po decyzji cache sidebara (`sidebarCounts`) jest inwalidowany.

## 6. QR Pass

**Co:** Po ZATWIERDZENIU zgłoszenia w panelu „Weryfikacja mediów" system
automatycznie wydaje QR pass. Wydanie tworzy:

1. **wpis w `guests`** z unikalnym kodem QR (`uuid`) — to encja, którą skanuje
   istniejący check-in (online: RPC `process_qr_check_in`; offline: lokalny
   manifest), dzięki czemu łańcuch działa end-to-end bez zmian w skanerze;
2. **wpis w `accreditations`** (best-effort) — formalny rekord przepustki / badge
   (typ, ważność = daty wydarzenia, powiązanie z `accreditation_requests`).

- Wyzwalane: `MediaVerificationPanel` → „Zatwierdź" (auto) lub „Wydaj QR pass"
  (dla zgłoszeń zatwierdzonych wcześniej). Idempotentne — pass wydawany raz.
- Serwis: `src/services/verification/verificationService.ts` → `issuePressPass`
- Czysta logika (testy): `src/lib/accreditation/passIssuance.ts`
- Render QR + PDF: `src/lib/accreditation/qrImage.ts`, jsPDF (pobranie passu)
- Śledzenie na zgłoszeniu: `landing_page_submissions.guest_id`,
  `accreditation_id`, `pass_qr_code`, `pass_issued_at`
  (migracja `20260531140000_press_accreditation_issuance.sql`)
- Tabela formalna: `accreditations` (qr_code, request_id, type_id, event_id,
  user_id, validity_start, validity_end, is_checked_in)
- Generacja badge/PDF (rozszerzone): `src/components/badges/BadgeGenerator.tsx`

## 7. Check-in

**Co:** Staff skanuje QR akredytacji na telefonie i dostaje jasny wynik w <2 s.
**Online-first** (pełna walidacja przez RPC) z **fallbackiem offline** (lokalny
manifest + kolejka sync po odzyskaniu sieci).

- Route: `/scanner` (`src/pages/Scanner.tsx`) — prosty ekran: kamera, duży wynik,
  kolor statusu, imię/nazwisko, medium, access level, czas pierwszego check-inu
  przy duplicate; manual search (nazwisko / e-mail / medium); lista ostatnich 20.
- Serwis online: `guestScannerService.verifyAndCheckIn` + `searchAccreditations`.
- Serwis offline: `src/services/scanner/localQrScanService.ts`,
  `src/lib/sync/syncWorker.ts`, `getOrCreateDeviceId`.
- Czysta klasyfikacja (testy, mirror RPC): `src/lib/checkin/checkInClassifier.ts`.
- RPC: `process_qr_check_in` (5-arg) — wyszukuje po `guests.qr_code`, ustawia
  `checked_in_at` + `checked_in_by` + `status='checked-in'`, loguje w
  `guest_check_in_scans`. Migracja `20260601120000_media_checkin_production.sql`.
- **7 statusów:** success, duplicate, invalid, wrong_event, expired, revoked,
  unauthorized. Duplicate **nie nadpisuje** pierwszego `checked_in_at`. Revoked to
  status odrębny; powód cofnięcia widoczny tylko dla zalogowanego staff/admina.
- Audyt: success / revoked / duplicate / manual_search → `audit_logs`.
- Face recognition jest **poza core** (nav `frozen` + flaga `features.faceRecognition`).
- **Znane do dokończenia (P1):** synchronizacja `accreditations.is_checked_in`
  z check-inem gościa (check-in aktualizuje `guests`) — patrz risks.

## 8. Coverage Collection

**Co:** Po evencie media dostarczają materiały (linki do publikacji, galerie,
wideo, social, zasięgi, wzmianki sponsora). Organizer zbiera je na Coverage Board
i wiąże z bazą Media CRM (kto przyszedł, kto dowiózł wartość).

- **Media CRM** — `/media-crm` (`src/pages/MediaCrmPage.tsx`): kontakty + media
  (outlets), historia zgłoszeń/coverage, tagi, quality rating (1–5), notatki PR,
  wskaźniki (no-show, obecność, coverage rate). Kontakt tworzony/aktualizowany
  automatycznie przy approve (dedup po e-mailu; outlet dedup po nazwie/domenie).
- **Coverage Board** — `/coverage-board` (`src/pages/CoverageBoardPage.tsx`):
  kanban statusów (pending / submitted / verified / missing), filtry (event,
  status), „Generuj prośby" dla checked-in mediów, bulk reminder, verify/missing.
- **Coverage form** — publiczny `/coverage/:token` (`CoverageForm.tsx`): secure
  link z remindera, bez logowania, mobile-friendly, success screen.
- Serwisy: `src/services/crm/mediaCrmService.ts`, `coverageService.ts`.
- Czysta logika (testy): `src/lib/crm/mediaCrm.ts` (dedup, rating, rates, token,
  harmonogram reminderów 24h/72h/7d).
- Edge functions: `coverage-submit` (publiczny submit po tokenie),
  `coverage-reminders` (manual z boardu / cron 24h-72h-7d).
- Tabele: `media_contacts`, `media_outlets`, `media_contact_outlets`,
  `coverage_requests`, `coverage_items` (migracja `20260602120000_media_crm_coverage.sql`).
- Wskaźniki: no-show = 1 − checked_in/approved; coverage rate = coverage/checked_in.

## 9. Media Report

**Co:** **Media Coverage Report** — główna wartość sprzedażowa: które media realnie
dowiozły wartość po evencie. Dashboard + PDF (dla sponsora) + CSV.

- Route: `/coverage-report` (`src/pages/MediaCoverageReport.tsx`).
- Czysta logika (testy): `src/lib/report/coverageReport.ts` — funnel, metryki,
  rankingi (top outlets / publications / missing), rekomendacje, CSV.
- Serwis danych: `src/services/report/coverageReportService.ts`.
- PDF (9 sekcji, jsPDF + autotable, branding, polskie znaki):
  `src/utils/coverageReportPdf.ts` — executive summary, event overview,
  accreditation funnel, media attendance, coverage performance, sponsor mentions,
  top publications, missing coverage (czerwony blok), recommendations.
- Funnel: submissions → approved → checked-in → coverage submitted → missing.
- Metryki: approval/check-in/no-show/coverage rate, estimated reach
  (oznaczony „deklarowany/estymowany" gdy niezweryfikowany), sponsor mentions.
- Rekomendacje: invite_again / follow_up / deprioritize / sponsor_relevant.
- Wykresy: Recharts (KPI + lejek). Stary `SponsorReport` (frekwencja gości)
  pozostaje pod `/sponsor-report`, ale core to Media Coverage Report.

## 10. Security & GDPR

- **Strona B2B** `/security-gdpr` (`SecurityGdprPage.tsx`): audit logs, role-based
  access, data retention, processors, consent records, export/delete request.
  Bez obietnic certyfikatów (SOC2/ISO).
- **Audit trail** `/audit-trail` (admin) — filtrowanie po action/severity/search
  oraz **resource_id / event_id** (rozszerzona edge function `audit-logs`).
- **RODO actions** (admin, w Media CRM): eksport danych kontaktu (JSON) oraz
  usunięcie/anonimizacja PII — `exportContactData` / `anonymizeContact`, logowane
  w audycie (`gdpr.contact_export` / `gdpr.contact_anonymize`).
- Audytowane zdarzenia: submission, decision, QR/akredytacja, check-in/revoke,
  coverage verification, data export/delete.
- Hook: `src/hooks/analytics/useEventAnalytics.ts`

---

## Mapowanie krok → nawigacja

Główna nawigacja (sidebar) celowo pokazuje tylko core flow. Pełna konfiguracja:
[`src/config/navigation.ts`](../src/config/navigation.ts).

| Krok workflow | Pozycja w nav | Grupa |
|---------------|---------------|-------|
| Event | Wydarzenia | core |
| Submission | Zgłoszenia mediów | core |
| Verification + Approval | Akredytacje | core |
| Check-in | Check-in QR | core |
| Coverage | Media CRM / Coverage & raporty | supporting |
| Report | Coverage & raporty | supporting |

## Statusy `accreditation_requests`

```
pending   → wniosek złożony, czeka na weryfikację
approved  → zatwierdzony, kwalifikuje się do QR pass
rejected  → odrzucony (z opcjonalnym komentarzem)
expired   → akredytacja wygasła
```
