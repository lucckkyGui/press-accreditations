# AUDIT-REPORT — press-accreditations

> Tryb: READ-ONLY (faza audytu). Wnioski oparte wyłącznie na faktach z repo.
> Data audytu: 2026-06-01. Gałąź: `redesign/linear-vercel`.
> Środowisko testów: Node 22 (wymagane przez `.nvmrc` / `engines`).

---

## 0. Aneks: decyzja po audycie — Opcja A (źródło prawdy akredytacji)

Po prezentacji audytu właściciel zatwierdził **Opcję A**: `landing_page_submissions`
jako jedyne źródło prawdy dla akredytacji; `accreditation_requests` schodzi do roli
legacy (frozen). Zakres tej zmiany świadomie WĄSKI (decyzje Q1/Q2 właściciela):

**Zmienione (liczniki organizatora → `landing_page_submissions`):**
- `src/components/layout/AppSidebar.tsx` — badge „oczekujące" (`useSidebarCounts`).
  Naprawia split-brain: `MediaVerificationPanel` już inwalidował `["sidebarCounts"]`,
  więc po zatwierdzeniu badge faktycznie spada.
- `src/components/dashboard/OrganizerDashboard.tsx` — lista/licznik pending.
- `src/components/dashboard/ResourceMonitor.tsx` — licznik „Wnioski akredytacyjne".

Wszystkie 3 przez `(supabase as any)` (tabela poza wygenerowanymi typami — patrz K2).
RLS `landing_page_submissions` scope'uje po `event_id` organizatora (zachowana spójność).

**Świadomie NIE ruszone w tej sesji (do osobnej decyzji):**
- `GuestDashboard.tsx` — widok dziennikarza filtrowany po `user_id`, którego
  `landing_page_submissions` nie ma (zgłoszenia anonimowe po e-mailu). Zostaje na
  `accreditation_requests`. **Rekomendacja:** rozstrzygnąć razem z drugim wejściem.
- Drugie wejście `/accreditation-request/:eventId` (`accreditationRequestService.createAccreditationRequest`)
  nadal pisze do `accreditation_requests` (uboższy model: bez scoringu, bez rozdzielonych
  zgód RODO, bez QR). **Rekomendacja (P0-3):** przekierować na publiczny landing `/:slug`
  albo zaadaptować zapis do `landing_page_submissions`.
- `verificationService.ts:722` (`resolveRequestId`) — celowo czyta `accreditation_requests`
  jako MOSTEK (wiąże wydany QR pass z mirrorowanym wnioskiem). Poprawne, zostaje.
- Legacy `AccreditationManagement.tsx` — zgodnie z decyzją „frozen": pozostaje w repo,
  do wycofania z nawigacji/ścieżki decyzyjnej (nie usuwa danych).

**Status reszty raportu:** poniższe sekcje 1–7 opisują stan z fazy audytu (read-only).
Opcja A adresuje częściowo problem **I1** (split-brain) — domknięcie wymaga decyzji o
drugim wejściu i GuestDashboard.

---

## 1. Streszczenie kierownicze

**Co to za system.** PressOps by OSURMO — platforma do akredytacji prasowych (media
operations) zbudowana w React 18 + TypeScript + Vite + Tailwind + shadcn/ui, z backendem
na Supabase (Postgres + RLS + Edge Functions Deno) i integracjami Stripe (płatności) oraz
Resend (e-mail). Hosting: Vercel. Rozmiar: ~60 stron, ~245 komponentów, ~30 serwisów,
20 edge functions, 23 migracje. Część kodu pochodzi z Lovable (znacznik w `client.ts`:
„automatically generated").

**Stan ogólny: działający szkielet produktu z solidnym rdzeniem media-operations,
ale NIE production-ready bez serii czynności wdrożeniowych i sprzątania.** Główny
sprzedażowy workflow (event → landing → submission → verification → approval → QR →
check-in → coverage → report) jest zaimplementowany realnie i pokryty testami logiki.
Wokół niego jest jednak warstwa funkcji Lovable w różnym stanie dojrzałości (od działających
po czyste makiety) oraz dług techniczny obniżający bezpieczeństwo typów i spójność danych.

**5 najważniejszych wniosków:**

1. **TypeScript ma wyłączony tryb strict (`strict: false`, `noImplicitAny: false`)** —
   `tsconfig.app.json`. „Czysty typecheck" jest mylący: poprzeczka jest nisko.
   W repo 200 adnotacji `: any` i 32 pliki z `as any`. (KRYTYCZNY dla utrzymania)
2. **Wygenerowane typy Supabase (`src/integrations/supabase/types.ts`) są nieaktualne** —
   nie zawierają ŻADNEJ z tabel rdzenia produktu (`landing_page_submissions`,
   `media_contacts`, `coverage_*`, `submission_verification_events`). Cały nowy core
   działa przez `(supabase as any)` — zero bezpieczeństwa typów na najważniejszych
   ścieżkach. (KRYTYCZNY)
3. **Dwa równoległe modele akredytacji (split-brain).** Zgłoszenie żyje w
   `landing_page_submissions` i jest mirrorowane triggerem do `accreditation_requests`.
   Istnieją DWA UI zatwierdzające: `MediaVerificationPanel` (pisze submissions + wydaje
   QR) oraz legacy `AccreditationManagement` (pisze requests, BEZ QR). Statusy mogą się
   rozjechać. (ISTOTNY)
4. **Migracje i edge functions nie są potwierdzone jako wdrożone** na żywej bazie; typy
   nie zregenerowane. Bez `supabase db push` + deploy funkcji + ustawienia sekretów
   (`RESEND_API_KEY`, `PUBLIC_APP_URL`) — kluczowe ścieżki (decyzja, e-mail, coverage,
   reminders) nie zadziałają na produkcji. (KRYTYCZNY operacyjnie)
5. **Pokrycie testami jest jednostronne** — 148 testów, ale niemal wyłącznie czysta
   logika w `src/lib/*`. Brak testów integracyjnych/E2E (Playwright skonfigurowany w
   `package.json`, ale ZERO plików `.spec` i brak `playwright.config`). Tylko 1 test
   komponentu UI. Realny flow z Supabase nie jest testowany automatycznie. (ISTOTNY)

**Założenia produktowe z briefu — weryfikacja:** akredytacje dziennikarzy = **zaimplementowane**;
RFID access control = **częściowe** (serwis + RPC + migracje, ale poza core, feature-flag off);
zone upsell = **NIEOBECNE** (0 referencji w kodzie); media marketplace = **tylko makieta UI**
(hardcoded mock array).

---

## 2. Mapa systemu

### 2.1 Punkty wejścia i szkielet
- **Entry:** `src/main.tsx` → `App.tsx` → `BrowserRouter` → `routes/AppRoutes.tsx`.
- **Routing:** React Router v6, lazy-loaded pages, `ProtectedRoute` z rolami.
- **Stan:** React Query (`@tanstack/react-query`) jako warstwa server-state; lokalny stan
  komponentów; brak globalnego store (Redux/Zustand) — auth przez `AuthProvider` context.
- **Klient Supabase:** `src/integrations/supabase/client.ts` (singleton).
- **Env:** `VITE_SUPABASE_*` (frontend), sekrety edge functions przez `supabase secrets`.
- **Offline:** Dexie (IndexedDB) — `src/lib/db/localDb.ts`, sync worker `src/lib/sync/`.

### 2.2 Przepływ danych — główny workflow
```
PublicAccreditationPage (/:slug)
   └─ edge: landing-page-register ──► landing_page_submissions (status=pending)
            (scoring inline) │             │ trigger mirror
                             │             ▼
                             │      accreditation_requests (legacy widok)
                             ▼
EventDetails → MediaVerificationPanel
   ├─ scoring/flagi (verificationScoring.ts)
   ├─ decideSubmission() ──► update submissions + issue:
   │        ├─ guests (qr_code = token)  ◄── skanowane przy check-inie
   │        └─ accreditations (best-effort, formalny rekord)
   ├─ edge: send-decision-email (Resend) ──► e-mail + /pass/:token
   └─ upsert media_contacts (CRM)
Scanner (/scanner)
   └─ RPC process_qr_check_in ──► guests.checked_in_at + guest_check_in_scans
      (offline: localDb manifest + scanQueue → syncWorker)
CoverageBoard (/coverage-board)
   ├─ generateCoverageRequestsForEvent ──► coverage_requests (token)
   ├─ edge: coverage-reminders (24/72/7d)
   └─ public /coverage/:token → edge coverage-submit ──► coverage_items
MediaCoverageReport (/coverage-report)
   └─ buildCoverageReport() → dashboard + PDF (coverageReportPdf) + CSV
```

### 2.3 Mapowanie funkcjonalność → pliki → tabele

| Funkcjonalność | Pliki kluczowe | Tabele Supabase |
|---|---|---|
| Event | `pages/Events.tsx`, `EventDetails.tsx` | `events` |
| Landing publiczny | `pages/PublicAccreditationPage.tsx`, edge `landing-page-register` | `event_landing_pages`, `landing_page_submissions` |
| Media submission | `lib/accreditation/submissionValidation.ts` | `landing_page_submissions` |
| Verification scoring | `lib/accreditation/verificationScoring.ts`, `services/verification/verificationService.ts` | `landing_page_submissions`, `submission_verification_events` |
| Decyzja + QR pass | `components/accreditation/MediaVerificationPanel.tsx`, `lib/accreditation/{decisionFlow,passIssuance}.ts` | `landing_page_submissions`, `guests`, `accreditations`, `accreditation_types` |
| Decision e-mail / pass link | edge `send-decision-email`, `pages/PassView.tsx` | — |
| QR check-in | `pages/Scanner.tsx`, `services/scanner/*`, RPC `process_qr_check_in` | `guests`, `guest_check_in_scans` |
| Offline check-in | `lib/db/localDb.ts`, `lib/sync/syncWorker.ts` | (IndexedDB) + `guests` |
| Media CRM | `pages/MediaCrmPage.tsx`, `services/crm/mediaCrmService.ts` | `media_contacts`, `media_outlets`, `media_contact_outlets` |
| Coverage | `pages/{CoverageBoardPage,CoverageForm}.tsx`, edge `coverage-submit`/`coverage-reminders` | `coverage_requests`, `coverage_items` |
| Media Coverage Report | `pages/MediaCoverageReport.tsx`, `lib/report/coverageReport.ts`, `utils/coverageReportPdf.ts` | (agregacja) |
| Security/GDPR | `pages/SecurityGdprPage.tsx`, `pages/AuditTrail.tsx`, edge `audit-logs`/`gdpr-export` | `audit_logs` |
| Płatności | edge `create-checkout`/`customer-portal`/`stripe-webhook`/`check-subscription`, `config/stripe.ts` | `subscriptions` |
| RFID (poza core) | `services/rfid/rfidService.ts`, RPC `process_rfid_scan` | `wristbands`, `zone_presence`, `access_logs` |

### 2.4 Status kluczowych założeń produktowych

| Założenie | Status | Dowód |
|---|---|---|
| **Akredytacje dziennikarzy/foto (rejestracja, weryfikacja, statusy)** | **Zaimplementowane** | Pełny flow submissions→scoring→decyzja→QR; 4 statusy decyzji, 10 access levels; testy `decisionFlow.test.ts`, `verificationScoring.test.ts` |
| **Kontrola dostępu RFID** | **Częściowe / poza core** | `services/rfid/rfidService.ts` (200 linii, realny), RPC `process_rfid_scan` w migracjach, tabele `wristbands`/`zone_presence`. Feature-flag `rfid` OFF; nav `frozen`. Brak testów. |
| **Zone upsell** | **NIEOBECNE** | Brak referencji `upsell`/`zoneUpsell` w `src/`. Strefy istnieją jako `zones[]` na gueście/akredytacji, ale BEZ logiki sprzedaży/dopłat. |
| **Media marketplace** | **Tylko makieta UI** | `pages/EventMarketplace.tsx:15` — hardcoded `events = [...]` (6 wpisów emoji). Brak Supabase. Feature-flag `marketplace` OFF, nav `frozen`. |

---

## 3. Status funkcjonalności

| Funkcjonalność | Status | Dowód w kodzie | Braki |
|---|---|---|---|
| Event CRUD | działa | `pages/Events.tsx`, `EventDetails.tsx`, tabela `events` | brak testów UI |
| Publiczny landing + submission | działa | edge `landing-page-register` (rate-limit, honeypot, scoring), `PublicAccreditationPage.tsx` | walidacja mirror logiki tylko ręczna |
| Verification scoring | działa | `verificationScoring.ts` + 17 testów; mirror w edge function | dwie kopie reguł (FE + edge) do utrzymania ręcznie |
| Decyzja + access levels | działa | `decisionFlow.ts` + 21 testów; `MediaVerificationPanel.tsx` | brak testu integracyjnego z DB |
| QR pass + e-mail | działa* | `passIssuance.ts`, edge `send-decision-email`, `PassView.tsx` | *zależne od deploy + `RESEND_API_KEY`; e-mail best-effort |
| QR check-in (online) | działa* | RPC `process_qr_check_in` (7 statusów), `guestScannerService.ts` | *RPC musi być wdrożony; aktualizuje `guests`, NIE `accreditations.is_checked_in` |
| QR check-in (offline) | działa | `localDb.ts`, `syncWorker.ts`, manifest pobiera `status` (revoked sync) | świeża rewokacja wymaga odświeżenia manifestu |
| Media CRM | częściowo | `mediaCrmService.ts` + 27 testów logiki | liczniki przyrostowe (możliwy rozjazd), brak rekonsyliacji; typy `as any` |
| Coverage collection | działa* | edge `coverage-submit`/`coverage-reminders`, `CoverageForm.tsx` | *deploy + reminder cron niezaplanowany |
| Media Coverage Report | działa | `coverageReport.ts` + 12 testów, PDF 9 sekcji, CSV | PDF: polskie znaki w nagłówkach jako ASCII (jsPDF Helvetica) |
| Security/GDPR | częściowo | strona B2B, audit filtry resource/event, export/anonimizacja kontaktu | brak twardego delete; audyt `event_id` w jsonb |
| Płatności (Stripe) | szkielet/nie potwierdzone | edge `create-checkout` etc., `config/stripe.ts` (price IDs) | nie zweryfikowano end-to-end; PricingSection nie używa już Stripe (CTA→/contact) |
| RFID | częściowo / frozen | `rfidService.ts`, RPC, migracje | poza core, flag off, brak testów |
| Marketplace | makieta | `EventMarketplace.tsx` mock | brak danych/Supabase |
| AI / blockchain / face / wristbands | makieta/frozen | komponenty istnieją, flagi off | nie część core |

`*` = działa pod warunkiem wdrożenia migracji/funkcji i ustawienia sekretów.

---

## 4. Weryfikacja założeń wdrożeniowych

| Założenie wdrożeniowe | Spełnione? | Dlaczego |
|---|---|---|
| Build przechodzi | **TAK** | `npm run build` ✓ (9.3 s, PWA OK) — pod Node 22 |
| Typecheck przechodzi | TAK, ale **z zastrzeżeniem** | przechodzi, lecz `strict:false` → niska wartość gwarancji |
| Lint czysty | TAK | 0 błędów, 33 ostrzeżenia (pre-existing) |
| Testy przechodzą | TAK | 148/148, ale głównie czysta logika |
| Bezpieczeństwo typów na core flow | **NIE** | core przez `(supabase as any)`; typy stale |
| Spójny model danych akredytacji | **NIE** | dwa modele (submissions vs requests), dwa UI decyzyjne |
| Migracje wdrożone na prod | **NIE POTWIERDZONE** | brak dowodu w repo; typy nieaktualne |
| Sekrety/env skonfigurowane | **NIE POTWIERDZONE** | `.env.example` opisuje wymagane; produkcja nieznana |
| E2E głównej ścieżki | **NIE** | brak plików Playwright |
| Node pinned dla CI | TAK | `.nvmrc` = 22; CI używa `node-version-file` |

---

## 5. Lista problemów wg wagi (z lokalizacją)

### KRYTYCZNE
- **K1. TypeScript strict wyłączony.** `tsconfig.app.json` → `"strict": false`,
  `"noImplicitAny": false`, `"noUnusedLocals": false`. 200× `: any`, 32 pliki `as any`.
  Skutek: brak realnego bezpieczeństwa typów; „typecheck OK" daje fałszywe poczucie pewności.
- **K2. Stale generated types.** `src/integrations/supabase/types.ts` nie zawiera tabel
  rdzenia (`landing_page_submissions`, `media_contacts`, `media_outlets`,
  `coverage_requests`, `coverage_items`, `submission_verification_events`). Cały nowy
  serwis (`verificationService.ts`, `mediaCrmService.ts`, `coverageService.ts`,
  `coverageReportService.ts`) używa `const sb = () => supabase as any`. Literówka w nazwie
  kolumny = błąd dopiero w runtime.
- **K3. Hardcoded fallback do produkcyjnego projektu Supabase.** `client.ts:5-6` zawiera
  `LEGACY_SUPABASE_URL` i `LEGACY_SUPABASE_PUBLISHABLE_KEY` (anon key) jako fallback gdy
  brak env. Anon key jest publiczny z założenia, ALE twardy fallback do konkretnego
  projektu oznacza, że build bez env trafi do produkcyjnej bazy. To samo: `config.toml`
  `project_id` + `SUPABASE_PROJECT_ID` fallback w `client.ts:18`.
- **K4. Wdrożenie nie potwierdzone.** 5 migracji rdzenia (Tydz. 4–6) i 3 nowe edge functions
  (`send-decision-email`, `coverage-submit`, `coverage-reminders`) + zmiany w `audit-logs`,
  `process_qr_check_in`. Bez `supabase db push` + deploy + sekrety produkt nie działa
  end-to-end. (operacyjny krytyk)

### ISTOTNE
- **I1. Dwa modele akredytacji (split-brain).** Trigger `mirror_landing_submission_to_requests`
  (`20260530120000_*.sql:160`) duplikuje zgłoszenie do `accreditation_requests`. Decyzję można
  podjąć w `MediaVerificationPanel.tsx` (pisze `landing_page_submissions`, wydaje QR) LUB w
  legacy `AccreditationManagement.tsx:65,88` (pisze `accreditation_requests`, bez QR).
  Statusy mogą się rozjechać; brak synchronizacji zwrotnej requests→submissions.
- **I2. Check-in aktualizuje `guests`, nie `accreditations`.** `process_qr_check_in`
  (`20260601120000_*.sql:180`) robi `UPDATE public.guests`; `accreditations.is_checked_in`
  pozostaje niespójne. Dwa źródła prawdy o obecności.
- **I3. Brak testów integracyjnych/E2E.** Playwright w `package.json` (`test:e2e`), ale 0
  plików `.spec.ts` i brak `playwright.config`. Tylko 1 test komponentu (`ProtectedRoute`).
  Główna ścieżka z Supabase niepokryta.
- **I4. Duplikacja reguł scoringu.** `verificationScoring.ts` (FE) i kopia w edge
  `landing-page-register/index.ts` — utrzymywane ręcznie, ryzyko rozjazdu (komentarz w kodzie
  to potwierdza).
- **I5. Liczniki CRM przyrostowe.** `mediaCrmService.upsertContactFromActivity` inkrementuje
  `approved_count` itp. bez rekonsyliacji — przy współbieżności lub powtórnym wywołaniu mogą
  się rozjechać ze źródłem (submissions/guests).
- **I6. Rate limiter in-memory.** `_shared/rateLimiter.ts:9` — `Map` w pamięci; resetuje się
  na cold start i nie współdzieli między instancjami. Dla publicznych endpointów (rejestracja)
  ochrona jest słaba przy skali. (udokumentowane w komentarzu)

### DROBNE
- **D1. 33 ostrzeżenia lint** — głównie `react-hooks/exhaustive-deps` i puste bloki `catch`.
- **D2. 5× `catch {}`** (puste) w `src/services`/`src/lib` — ciche połykanie błędów.
- **D3. Mock danych w makietach** — `EventMarketplace.tsx:15` (hardcoded array). Nie w core,
  ale do usunięcia przed sprzedażą.
- **D4. PDF — polskie znaki.** `coverageReportPdf.ts` używa zamienników ASCII w nagłówkach
  (jsPDF Helvetica nie ma pełnego PL). Dane renderują się przez WinAnsi.
- **D5. Bundle size.** `dist` 6.5 MB; `jspdf.es.min` 390 KB, `BarChart` 371 KB — kandydaci
  do lazy/code-split (część już lazy).
- **D6. Dwa lockfile** (`bun.lock` + `bun.lockb` + `package-lock.json`) — niespójność menedżera
  pakietów; CI używa `npm ci`.
- **D7. `BadgeGenerator.tsx:41`** — hardcoded `eventId: 'event-123'` (legacy, poza core).

---

## 6. Plan i wyniki testów

### 6.1 Plan (zaprojektowany na bazie Fazy 2)

| # | Obszar | Cel | Metoda | Oczekiwane |
|---|---|---|---|---|
| T1 | Build | Czy buduje się produkcyjnie | `npm run build` | exit 0 |
| T2 | Typecheck | Czy typy się kompilują | `npm run typecheck` | exit 0 (z zastrzeżeniem strict) |
| T3 | Lint | Jakość statyczna | `npm run lint` | 0 errors |
| T4 | Testy jednostkowe | Logika core | `npm run test:run` | wszystkie PASS |
| T5 | Verification scoring | Reguły scoringu | przegląd `verificationScoring.test.ts` | reguły deterministyczne, nie auto-decyduje |
| T6 | Decision flow | Statusy/access/QR contract | `decisionFlow.test.ts` | approved/limited tworzą QR, reszta nie |
| T7 | Check-in classifier | 7 statusów + 100 QR matrix | `checkInClassifier.test.ts` | rozkład 80/10/3/3/2/2 |
| T8 | Coverage report | funnel/metryki 0/10/100 items | `coverageReport.test.ts` | metryki poprawne |
| T9 | Demo seed | rozkład danych demo | `demoSeed.test.ts` | funnel 50/35/25/18/7 |
| T10 | Dual model | Spójność submissions vs requests | przegląd kodu (mirror trigger + 2 UI) | LUKA (split-brain) |
| T11 | Check-in vs accreditations | Spójność źródła obecności | przegląd RPC | LUKA (tylko guests) |
| T12 | E2E główna ścieżka | submission→report w przeglądarce | Playwright | BRAK pokrycia |
| T13 | RLS / public endpoints | Autoryzacja edge functions | przegląd `config.toml` + funkcji | OK (rate-limit/API-key) |
| T14 | Bezpieczeństwo typów core | `as any` na core | grep + przegląd | LUKA (K2) |

### 6.2 Wyniki

| # | Status | Dowód |
|---|---|---|
| T1 | **PASS** | `✓ built in 9.32s`, PWA, 216 precache entries |
| T2 | **PASS (warunkowo)** | `tsc --noEmit` exit 0; ALE `strict:false` (`tsconfig.app.json`) |
| T3 | **PASS** | `✖ 33 problems (0 errors, 33 warnings)` |
| T4 | **PASS** | `Test Files 13 passed`, `Tests 148 passed` |
| T5 | **PASS** | 17 testów; system sugeruje, nie decyduje (asercje w teście) |
| T6 | **PASS** | 21 testów; macierz statusów potwierdzona |
| T7 | **PASS** | 19 testów; matrix 100 QR (80/10/3/3/2/2) |
| T8 | **PASS** | 12 testów; 0/10/100 items, sponsor mentions, missing |
| T9 | **PASS** | 3 testy; funnel 50/35/25/18/7, approval 70%, coverage 72% |
| T10 | **FAIL (luka projektowa)** | mirror trigger + 2 ścieżki decyzyjne piszące różne tabele |
| T11 | **FAIL (luka projektowa)** | `process_qr_check_in` aktualizuje tylko `guests` |
| T12 | **BLOCKED / N/A** | brak plików Playwright; nie ma czego uruchomić |
| T13 | **PASS** | `verify_jwt=false` świadome; rate-limit + API-key w funkcjach |
| T14 | **FAIL (luka)** | core przez `(supabase as any)`; typy stale (K2) |

**Podsumowanie:** wszystkie testy automatyczne (T1–T9, T13) zielone. Luki (T10–T12, T14)
to braki projektowe/pokrycia, nie błędy runtime — ujawnione przez przegląd kodu.

---

## 7. Rekomendacje i priorytety (P0/P1/P2)

### P0 — blokery przed pilotem/sprzedażą (must)
| # | Rekomendacja | Nakład |
|---|---|---|
| P0-1 | Wdrożyć migracje (`supabase db push`) + deploy 20 edge functions + ustawić sekrety (`RESEND_API_KEY`, `PUBLIC_APP_URL`, Stripe). Potwierdzić działanie e-mail/coverage/reminders. | 1–2 dni |
| P0-2 | Zregenerować typy Supabase (`supabase gen types`) i podmienić `(supabase as any)` na typowane wywołania w core serwisach. Usuwa K2. | 2–3 dni |
| P0-3 | Rozstrzygnąć dualny model akredytacji: wybrać JEDNO źródło prawdy (rekomendacja: `landing_page_submissions` + `MediaVerificationPanel`), wycofać/ukryć legacy `AccreditationManagement` zapis lub zsynchronizować dwukierunkowo. | 1–2 dni |
| P0-4 | Usunąć twardy fallback do produkcyjnego Supabase w `client.ts` — wymagać env, fail-fast bez kluczy. | 0.5 dnia |
| P0-5 | Smoke E2E głównej ścieżki (Playwright): submission→approve→QR→check-in→coverage→report na staging. Dodać `playwright.config`. | 2–3 dni |

### P1 — ważne dla jakości/zaufania
| # | Rekomendacja | Nakład |
|---|---|---|
| P1-1 | Włączyć `strict: true` (przyrostowo, plik po pliku) + zredukować `: any`. | 3–5 dni (rozłożone) |
| P1-2 | Zsynchronizować `accreditations.is_checked_in` z check-inem (trigger lub rozszerzony RPC). | 1 dzień |
| P1-3 | Rekonsyliacja liczników CRM ze źródłami (widok/agregacja zamiast inkrementów) lub idempotencja. | 1–2 dni |
| P1-4 | Reminder coverage: skonfigurować cron (pg_cron/scheduler) dla `mode=cron`. | 0.5 dnia |
| P1-5 | Trwały rate limiter (Postgres/Upstash) dla publicznych endpointów. | 1 dzień |
| P1-6 | Testy integracyjne serwisów Supabase (lokalny Supabase + vitest) dla decyzji/coverage. | 3–4 dni |

### P2 — nice-to-have / post-MVP
| # | Rekomendacja | Nakład |
|---|---|---|
| P2-1 | Usunąć/oznaczyć makiety (marketplace mock, BadgeGenerator `event-123`) i ujednolić lockfile (jeden menedżer). | 0.5 dnia |
| P2-2 | Osadzić font TTF w PDF dla pełnych polskich znaków. | 0.5 dnia |
| P2-3 | Code-split ciężkich bundli (jsPDF, recharts) ładowanych on-demand. | 1 dzień |
| P2-4 | Wyeliminować duplikację reguł scoringu (wspólny moduł współdzielony FE/edge) lub testy kontraktowe pilnujące zgodności. | 1–2 dni |
| P2-5 | Domknąć lub jednoznacznie „frozen" funkcje Lovable (RFID, wristbands, AI, blockchain) — decyzja produktowa. | — |

**Szacowany łączny nakład do production-ready (P0+P1): ~3–4 tygodnie 1 inżyniera.**
Rdzeń jest dobry; większość pracy to wdrożenie, regeneracja typów, rozstrzygnięcie
dualnego modelu i pokrycie E2E — nie przepisywanie.

---

## Załącznik: fakty środowiskowe
- Node 22 wymagany (`.nvmrc`); pod Node 18 vitest/rolldown i workbox się wywracają (zaobserwowane).
- Gałąź `redesign/linear-vercel`, 902 commity, ahead origin/main 41 (przed audytem).
- 29 tabel/RPC w (nieaktualnych) typach; 23 migracje; 104 polityki RLS w migracjach;
  8 tabel z `ENABLE ROW LEVEL SECURITY` w nowych migracjach.
- „nie potwierdzone w kodzie": stan zdalnej bazy Supabase, faktyczny deploy funkcji,
  działanie Stripe end-to-end, wartości sekretów produkcyjnych.
