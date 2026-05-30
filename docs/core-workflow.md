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

**Co:** Organizer zatwierdza lub odrzuca wniosek, opcjonalnie z komentarzem.
Status przechodzi `pending → approved | rejected`.

- Route: `/guests?filter=pending` (lista oczekujących) lub tab Akredytacje w evencie
- Akcja: `AccreditationManagement` → `supabase.update()` na `accreditation_requests`
  (status, approved_by, approval_date, approval_notes)
- Po zatwierdzeniu cache sidebara (`sidebarCounts`) jest inwalidowany — licznik
  oczekujących spada.
- **P1:** wysyłka e-maila powiadamiającego przez Resend.

## 6. QR Pass

**Co:** Dla zatwierdzonego wniosku powstaje akredytacja z unikalnym kodem QR
(ważność, typ, strefy dostępu).

- Tabela: `accreditations` (qr_code, request_id, type_id, event_id, user_id,
  validity_start, validity_end, is_checked_in)
- Generacja badge/PDF: `src/components/badges/BadgeGenerator.tsx`
- **Znane do dokończenia (P0):** automatyczne tworzenie wpisu `accreditations`
  przy approve nie jest jeszcze w pełni spięte — patrz risks w raporcie.

## 7. Check-in

**Co:** Na miejscu obsługa skanuje QR pass. Działa offline (lokalna kolejka,
sync po odzyskaniu sieci).

- Route: `/scanner` (`src/pages/Scanner.tsx`)
- Serwisy: `src/services/scanner/localQrScanService.ts`,
  `src/lib/sync/syncWorker.ts`, `getOrCreateDeviceId`
- RPC: `process_qr_check_in`
- Tabela: aktualizacja `accreditations.is_checked_in`, `checked_in_at`;
  log w `access_logs`

## 8. Coverage Collection

**Co:** Po evencie media dostarczają materiały (linki do publikacji, zdjęcia,
nagrania, zasięgi). Organizer zbiera je do raportu wartości medialnej.

- Route: `/media-portal` (Media CRM + dokumenty), `/post-event-report`
- Komponenty: `src/pages/MediaPortalPage.tsx`,
  `src/components/analytics/MediaAnalyticsDashboard.tsx`
- **Znane do dokończenia (P1):** brak dedykowanej tabeli `coverage_submissions`
  i osobnego UI uploadu coverage — obecnie pokrywane częściowo przez media
  documents + analytics.

## 9. Media Report

**Co:** Generowany raport po evencie: frekwencja, check-in, breakdown mediów,
wartość medialna dla sponsora. Eksport PDF / CSV.

- Routes: `/post-event-report` (`PostEventReport.tsx`),
  `/sponsor-report` (`SponsorReport.tsx`)
- Generatory PDF: `src/utils/pdfReportGenerator.ts`, jsPDF + autotable
- Wykresy: Recharts
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
