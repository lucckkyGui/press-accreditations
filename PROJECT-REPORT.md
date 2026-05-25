# PROJECT-REPORT.md
> Analiza wykonana: 2026-05-25 | Baza: commit `f4449a1` (master)

---

## 1. CZYM JEST PROJEKT TERAZ

### Cel i przeznaczenie

**Press Accreditations** to platforma SaaS do zarządzania akredytacjami prasowymi na wydarzeniach. Rozwiązuje problem, który branża eventowa tradycyjnie obsługuje przez arkusze Excel i ręczne listy: od momentu złożenia wniosku przez dziennikarza, przez zatwierdzenie, wysyłkę zaproszenia z kodem QR, aż do check-inu na bramce — wszystko w jednym narzędziu, które działa też offline.

**Docelowi użytkownicy:**
- Organizatorzy wydarzeń (konferencje, festiwale, koncerty, kongresy) — rola `organizer`/`admin`
- Moderatorzy/staff na bramkach — rola `moderator`/`staff`
- Dziennikarze/goście — ograniczony dostęp przez publiczne formularze lub link gościa

---

### Stos technologiczny

| Warstwa | Technologia |
|---|---|
| Frontend framework | React 18 + Vite 5 + TypeScript 5.5 |
| Stylowanie | Tailwind CSS 3.4 + shadcn/ui (Radix UI) |
| Routing | React Router 6 (lazy-loaded, code-split) |
| Serwer danych | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Stan serwera | TanStack Query 5 |
| Formularze | React Hook Form + Zod |
| Offline DB | Dexie 4 (IndexedDB wrapper) |
| Wykresy | Recharts 2 |
| Animacje | Framer Motion 11 |
| Płatności | Stripe (Checkout + Customer Portal) |
| Email | Resend (przez Supabase Edge Function) |
| QR scan | html5-qrcode + qrcode-generator |
| PDF | jsPDF + jspdf-autotable |
| CSV/Excel | PapaParse + własny eksporter Excel |
| Testy jednostkowe | Vitest + Testing Library |
| Testy e2e | Playwright |
| Monitoring | Sentry |
| PWA | vite-plugin-pwa + własny Service Worker |
| i18n | Własny moduł (PL/EN kompletne, 7 innych języków: stubs) |
| Deployment | Vercel (frontend) + Supabase Cloud (backend) |
| Origin | Zbudowany z pomocą Lovable AI builder |

---

### Architektura i struktura

```
src/
├── components/          # ~140 komponentów, pogrupowanych domenowo
│   ├── accreditation/   # formularze i status wniosków
│   ├── auth/            # logowanie, rejestracja, SSO
│   ├── dashboard/       # karty KPI, wykresy, aktywność
│   ├── guests/          # tabela gości, import, email-retry
│   ├── scanner/         # viewfinder, offline manifest, settings
│   ├── layout/          # Sidebar, Header, MainLayout
│   ├── common/          # CommandPalette, DataTable, EmptyState
│   └── ...12 innych domen
├── pages/               # ~65 stron (lazy-loaded)
├── hooks/               # ~35 hooków, podzielonych na domeny
├── services/            # warstwa dostępu do danych
│   ├── scanner/         # localQrScanService (offline-first)
│   ├── guest/           # CRUD, bulk, email
│   ├── email/           # Resend campaigns
│   └── ...
├── lib/
│   ├── db/localDb.ts    # Dexie schema (guests, scanQueue, eventManifest, syncMeta)
│   └── sync/syncWorker  # background sync kolejki skanów do Supabase
├── integrations/
│   └── supabase/        # typy generowane z DB (1559 linii), client
├── i18n/                # moduły tłumaczeń (9 sekcji × PL/EN)
├── routes/AppRoutes.tsx # ~60 tras, 3 poziomy ochrony RBAC
└── config/
    ├── features.ts      # 8 feature flagów z env zmiennych
    └── stripe.ts        # 3 tiery płatności
```

**Wzorzec offline-first skanera** (kluczowy, unikalny):
1. Organizator pobiera manifest gości (pełna lista) do IndexedDB przed wydarzeniem
2. Skaner działa całkowicie lokalnie: walidacja QR → LocalScanQueueEntry
3. Gdy wróci internet → `syncWorker` flush kolejki do Supabase przez `process_qr_check_in` (stored procedure)
4. Mechanizm idempotentny: duplikaty dają status `duplicate`, nie nadpisują `checked_in_at`

**Baza danych (21 tabel):** `events`, `guests`, `accreditations`, `accreditation_requests`, `accreditation_types`, `profiles`, `user_roles`, `invitations`, `invitation_templates`, `email_queue`, `email_campaigns`, `media_registrations`, `media_documents`, `audit_logs`, `api_keys`, `webhook_subscriptions`, `chat_conversations`, `chat_messages`, `document_submissions`, `user_notifications`, `wristbands`, `zone_presence`

**16 Supabase Edge Functions:** auth, Stripe checkout/webhook, send-invitation-emails (Resend), ai-support-chat, face-recognition, gdpr-export, embed-register, landing-page-register, public-api, webhook-dispatcher, audit-logs, health-check, waitlist-manage, check-resource-alerts, check-subscription

---

### Stan zaawansowania

#### ✅ Działa i jest podłączone do prawdziwych danych

| Moduł | Poziom ukończenia |
|---|---|
| Auth (email/hasło, magic link, RBAC 6 ról) | **100%** |
| Events CRUD (tworzenie, edycja, status live/zaplanowane/draft/past) | **100%** |
| Guests CRUD + import CSV/Excel + walidacja duplikatów | **90%** |
| QR Scanner offline-first (Dexie + sync queue + stored procedure) | **95%** |
| Email invitations (Resend, retry queue) | **85%** |
| Accreditation request (publiczny formularz) | **80%** |
| Stripe subscriptions (3 tiery, checkout, customer portal) | **80%** |
| Audit Trail (logi akcji per użytkownik) | **75%** |
| GDPR export (Edge Function) | **70%** |
| API Keys + Webhook management | **70%** |
| PWA (offline manifest, SW update detection, install prompt) | **85%** |
| Publiczna strona akredytacji (`/:slug`) | **75%** |
| Settings (email SMTP/Resend config, export, GDPR) | **65%** |

#### ⚠️ Zbudowane, ale na mock danych

| Moduł | Problem |
|---|---|
| Ticketing system (`/ticketing`) | Dane bilety z `mockTickets`, brak tabeli w DB |
| Notifications page | Całkowicie na `mockNotifications` + `mockGuests` + `mockEvent` |
| Cart / Orders | `mockCartItems`, `mockOrders` — brak prawdziwego e-commerce flow |
| Email Retry Queue | `mockFailedEmails` — hook nie odpytuje Supabase |
| UserManagement (Settings) | `mockUsers = []` — pusta tablica |
| PressReleases | `// TODO: Replace with supabase query when table exists` |
| EventDetails MOCK_ZONES | Strefy dostępu: hardcoded mock, tabela `zone_presence` istnieje ale nie jest podłączona |
| AIDashboard | Prawdopodobnie statyczny — nie weryfikowany |
| OrganizerDashboard | Stare komponenty (DatabaseSchema, ResourceMonitor) — nie przebudowany wg mockupu |

#### 🚩 Za feature flagiem (domyślnie wyłączone)

- **RFID scanner** — Edge Function `process_rfid_scan` istnieje, UI `RfidScanner.tsx` jest, ale nie testowany
- **Face Recognition** — Edge Function `face-recognition` jest, `FaceRecognitionCheckIn.tsx` jest, ale nigdy nie włączony
- **Blockchain Credentials** — `BlockchainCredentials.tsx` istnieje, wyraźnie aspiracyjny
- **Landing Page Builder** — `LandingPageBuilder.tsx` (503 linie), dostępny przez flagę
- **White Label** — `WhiteLabelSettings.tsx`
- **Marketplace** — `EventMarketplace.tsx`
- **Wristbands** — `WristbandManagement.tsx` + tabela `wristbands` w DB

---

### Jakość kodu

**Testy:**
- 5 plików testów jednostkowych (Vitest): `ProtectedRoute`, `useAuditLog`, `syncWorker`, `guestScannerService`, `localQrScanService`
- 1 plik e2e (Playwright): `offline-first-sync.spec.ts`
- Pokrycie: **bardzo niskie** — testy dotykają jedynie krytycznej ścieżki skanera i sync workera

**Dokumentacja:**
- `README.md` — głównie Lovable boilerplate + deployment runbook
- `docs/deployment.md` — dobry deployment checklist, jeden z lepiej udokumentowanych fragmentów
- Brak Storybook, brak JSDoc poza kilkoma komentarzami blokowymi
- Brak architektury decyzji (ADR)

**Długi techniczne (P0-P2):**
1. **257 hardcoded klas Tailwind** (`text-gray-*`, `bg-green-*`, `bg-white` itp.) — naruszają system tokenów, zidentyfikowane w `find-replace.md`
2. **Duplikaty komponentów:** `BulkGuestImport` + `EnhancedBulkGuestImport`, `InvitationGenerator` + `OptimizedInvitationGenerator` + `SmartInvitationSystem`, `DashboardGreeting` + `DashboardHero`
3. **i18n niepełne:** de/ar/es/hi/ja/pt/ru/zh — każdy plik ma ~48 linii (stubs pośród modułów), PL/EN są pełne
4. **OrganizerDashboard** nie przebudowany wg mockupu (P1 z AUDIT.md)
5. **`planUsedPct = 68`** — hardcoded w `AppSidebar.tsx` zamiast z `useSubscription`
6. **`src/index.css.bak`** — zostawiony plik backup w repo

**Bezpieczeństwo:**
- RBAC działa na poziomie Row-Level Security w Supabase
- Edge Functions mają rate limiter i walidację origin (`ALLOWED_ORIGINS`)
- API Keys szyfrowane przez Supabase Vault
- Audit Log dla akcji admin/organizer
- Seria fixów bezpieczeństwa (commity `f78dd9b`→`45fa971`) — świadczy o świadomości problemu

---

## 2. CZYM PROJEKT MOŻE SIĘ STAĆ

### Naturalne kierunki wynikające z architektury

#### A. Platforma akredytacyjna klasy enterprise (główna linia)

Projekt ma zręby pod produkt B2B SaaS. Następujące kroki wynikają bezpośrednio z tego, co już jest zbudowane:

- **Multi-event dashboard** (OrganizerDashboard z DashboardHero + LiveEventActivityCard) — podstawa pod zarządzanie portfolio wydarzeń
- **Strefy dostępu** (tabela `zone_presence` + `ZoneManagement.tsx`) — kontrola kto ma wstęp do której strefy (VIP, backstage, press pit)
- **RFID** (Edge Function + UI gotowe) — upgrade z QR do RFID na większe wydarzenia
- **White label** — odsprzedaż platformy innym agencjom eventowym pod ich brandem
- **Public API + webhooks** — integracje z CRM, systemami mailing (Mailchimp, HubSpot), systemami biletowymi

#### B. Marketplace akredytacji (linia alternatywna)

`AccreditationCategories` + `AccreditationEvents` + publiczny formularz tworzą szkielet portalu, gdzie dziennikarze sami przeglądają dostępne wydarzenia i składają wnioski. To osobna wartość biznesowa — platforma discovery dla mediów. Wymaga jednak inwestycji w UX po stronie gościa.

#### C. Platforma ticketingowa (ryzykowna linia)

Cart, Orders, Purchase, Ticketing istnieją ale są na mock danych. To ogromny zakres (compliance, płatności per-bilet, zwroty) — sensowne tylko jeśli jest strategicznie ważne. Bez tego modułu projekt jest spójny i skupiony.

---

### Brakujące funkcje, które wydają się zaplanowane

| Funkcja | Dowód w kodzie | Szacunek pracy |
|---|---|---|
| Real-time activity feed na dashboardzie | `LiveEventActivityCard.tsx` props + Supabase realtime | 2-3 dni |
| Podłączenie stref do `zone_presence` | Tabela + `ZoneManagement.tsx` + `ZoneCard.tsx` | 3-5 dni |
| Press Releases z prawdziwą tabelą | `// TODO: Replace with supabase query` | 2-3 dni |
| RFID aktywacja | Edge Function gotowa, flaga gotowa | 1-2 dni (QA 2+ dni) |
| Notifications z prawdziwymi danymi | Tabela `user_notifications` gotowa, hook nie podpięty | 2-3 dni |
| Email Retry Queue z Supabase | Tabela `email_queue` gotowa | 1-2 dni |
| AISuggestionCard z regułami | Komponent gotowy, brak logiki heurystyk | 3-5 dni |
| Plan usage z useSubscription | `planUsedPct = 68` w Sidebarze | 0.5 dnia |

---

### Możliwości rozszerzenia

1. **Supabase Realtime** — `LiveEventActivityCard` jest gotowy na feed w czasie rzeczywistym. Wystarczy `supabase.channel()` subscription na tabelę `scan_queue` lub bezpośrednio na `guests` (event `UPDATE` na `checked_in_at`)

2. **Push notifications** — `usePushNotifications.ts` i `NotificationScheduler.tsx` istnieją. Brak tylko VAPID key + service worker handler

3. **Multi-tenant / White Label** — `WhiteLabelSettings.tsx` + `useFeatureAccess.ts` tworzą framework. Potrzeba: persystencja ustawień per-org w Supabase

4. **Blockchain credentials** — `BlockchainCredentials.tsx` istnieje, ale to czysto aspiracyjny komponent bez żadnej logiki. Dopiero od zera.

5. **AI Fraud Detection** — `AIFraudDetection.tsx` + Edge Function `face-recognition`. Realnie: wymaga integracji z zewnętrznym dostawcą CV

6. **Mobile app** — Architektura (React + PWA) pozwala na React Native (Expo) reużywając logiki hooków i serwisów. Albo progresywna ścieżka: dodanie ekranu startowego iOS/Android do istniejącej PWA

---

### Wizja docelowa — dojrzały produkt

**Press Accreditations v1.0 produkcyjne** to platforma, w której:
- Organizator tworzy wydarzenie, definiuje strefy i typy akredytacji (foto, video, text, broadcast)
- System wysyła link do portalu akredytacyjnego, dziennikarze składają wnioski z dokumentami
- Moderator zatwierdza w dashboardzie, system automatycznie generuje QR + ewentualnie RFID badge
- W dniu wydarzenia: skaner offline-first na telefonie, automatyczna sync, live dashboard z frekwencją per strefę
- Po wydarzeniu: raport PDF ze statystykami frekwencji, eksport do CRM organizatora

Obecny projekt pokrywa ~70% tej wizji. Brakuje: prawdziwego flow stref, pełnego portalu dla dziennikarzy, stabilnego modułu notyfikacji.

---

## 3. SZACOWANY CZAS ROZWOJU

### Założenia

- 1 doświadczony developer full-stack (React + TypeScript + Supabase)
- Nie liczymy czasu na: design (UI jest), infrastrukturę (Vercel + Supabase już działają)
- "Gotowy do produkcji" = feature-complete + testy pokrywające happy paths + QA na prawdziwym urządzeniu mobilnym
- Szacunki w **roboczo-dniach** (1 RD ≈ 6h efektywnej pracy)

---

### Etap 0 — Porządki (Quick Wins, natychmiast)
**Cel:** Czyste repo, zero tech-debt blokerów, pełna zgodność z design systemem

| Zadanie | RD | Priorytet |
|---|---|---|
| Find-replace 257 hardcoded kolorów (z `find-replace.md`) | 1 | P0 |
| Rebuild OrganizerDashboard z DashboardHero + LiveEventActivityCard + AISuggestionCard | 3 | P0 |
| Usuń `src/index.css.bak` + stary `tailwind.config.ts.bak` | 0.1 | P0 |
| Podłącz `planUsedPct` z `useSubscription` w Sidebarze | 0.5 | P1 |
| Usuń duplikaty komponentów (EnhancedBulk vs Bulk, Smart/Optimized invitation) | 1 | P1 |
| Uzupełnij brakujące i18n klucze w PL (skanowanie przez `useI18n`) | 1 | P1 |

**Łącznie: ~7 RD (~1.5 tygodnia)**

---

### Etap 1 — Zamknięcie Core Loop (MVP presowe)
**Cel:** Każdy krok przepływu prasowego działa end-to-end z prawdziwymi danymi

| Zadanie | RD | Uwagi |
|---|---|---|
| Press Releases — podłączyć do Supabase (tabela może wymagać migracji) | 2 | TODO w kodzie |
| Notifications — zastąpić mock danymi z `user_notifications` | 2 | Tabela gotowa |
| Email Retry Queue — podłączyć do tabeli `email_queue` | 1.5 | Tabela gotowa |
| Strefy dostępu — podłączyć `ZoneManagement` do `zone_presence` | 4 | Tabela gotowa, UI gotowe, brakuje danych w EventDetails |
| Supabase Realtime w LiveEventActivityCard (subskrypcja `guests.checked_in_at`) | 2 | Komponent gotowy na feed |
| AISuggestionCard — prosta logika heurystyk (kolejka > N → otwórz 2. bramkę) | 2 | Nie wymaga AI |
| Pełna ścieżka AccreditationRequest z prawdziwym eventem (nie mock) | 3 | Edge Case: brak `event_slug` w obecnej tabeli `events` |
| UserManagement w Settings — zastąpić mock prawdziwymi user_roles | 2 | Tabela gotowa |

**Łącznie: ~19 RD (~4 tygodnie)**

---

### Etap 2 — Stabilizacja i testy
**Cel:** Projekt nadaje się do wdrożenia z pewnością

| Zadanie | RD | Uwagi |
|---|---|---|
| Testy jednostkowe dla kluczowych hooków (useEvents, useGuests, useInvitations) | 4 | Vitest + MSW |
| Testy komponentów (GuestsTable, UnifiedQRScanner flow) | 3 | Testing Library |
| E2E happy paths: rejestracja → event → gość → skan (Playwright) | 5 | Wymaga staging Supabase |
| QA na prawdziwym urządzeniu mobilnym (iOS + Android) — skaner offline | 3 | Krytyczne ryzyko |
| Security audit: RLS policies przegląd po migracji zone_presence | 2 | |
| Error boundaries dla każdej sekcji dashboardu | 1 | SectionErrorBoundary już istnieje |
| Performance: bundle size audit (present: ~330 kB gzip) | 1 | |

**Łącznie: ~19 RD (~4 tygodnie)**

---

### Etap 3 — Funkcje advanced (Post-MVP)
**Cel:** Uruchomienie feature flagów + rozszerzenia enterprise

| Zadanie | RD | Priorytet | Ryzyko |
|---|---|---|---|
| RFID Scanner — aktywacja + QA na prawdziwym czytniku | 5 | High | Zależy od sprzętu |
| Push notifications (VAPID + SW handler) | 3 | Medium | |
| White Label (persystencja per-org w Supabase) | 5 | Medium | |
| Public API rate limiting + dokumentacja (Swagger/OpenAPI) | 4 | Medium | |
| Marketplace akredytacji (discovery dla dziennikarzy) | 8 | Low | Duży scope |
| Raport sponsorski (SponsorReport) — pełna integracja | 3 | Low | |
| i18n uzupełnienie DE/ES/PT (jeśli rynki docelowe) | 5 | Low | Per język |

**Łącznie: ~33+ RD (7+ tygodni)**

---

### Podsumowanie kamieni milowych

```
TERAZ         Etap 0              Etap 1             Etap 2             Etap 3
  │           (1.5 tyg.)         (+4 tyg.)          (+4 tyg.)          (+7+ tyg.)
  ▼               ▼                  ▼                  ▼                  ▼
Obecny       Czysty design      Core loop         Produkcyjny        Advanced /
stan         system, bez        end-to-end,       z testami          Enterprise
             tech-debtu         dane realne       i QA mobile
```

**Łączny czas do "MVP produkcyjny" (Etap 0 + 1 + 2): ok. ~45 RD = ~9-10 tygodni** przy jednym doświadczonym developerze.

---

### Zadania krytyczne (blokery produkcji)

1. **QA skanera na mobilnych** — offline-first działa w teorii, ale wymaga testów na iOS/Android z ograniczonym WiFi. IndexedDB na iOS Safari ma historię problemów z persistence.
2. **RLS na `zone_presence`** — jeśli strefy będą widoczne publicznie, Row-Level Security musi być precyzyjne
3. **`process_qr_check_in` stored procedure** — deployment checklist już to wymaga, ale musi być przetestowane z duplikatami

### Łatwe wygrane (quick wins, < 1 dzień każda)

- Usuń `index.css.bak` z repo
- Podłącz `planUsedPct` z `useSubscription`
- Usuń `EnhancedEmailRetryQueue` mock i zastąp zapytaniem do `email_queue`
- Fix `OrganizerDashboard` — podmień `DatabaseSchema`/`ResourceMonitor` na `DashboardHero`

### Elementy największego ryzyka

| Ryzyko | Poziom | Mitygacja |
|---|---|---|
| IndexedDB persistence na iOS Safari (PWA skaner) | **Wysoki** | Test na urządzeniu przed deploy |
| Stripe w trybie live (błędy webhooków, zwroty) | **Wysoki** | Staging environment z Stripe test mode |
| Face Recognition (API zewnętrzne, compliance biometryczne) | **Bardzo wysoki** | Nie uruchamiać bez prawnika i DPA |
| Blockchain Credentials | **Bardzo wysoki** | Aspiracyjny feature, nie zbliżony do produkcji — usunąć lub zamrozić |
| Brak testów dla krytycznych ścieżek | **Średni** | Etap 2 priorytetyzuje |

---

## Pytania otwarte

1. **Tiketing — strategia:** Czy e-commerce biletowy (Cart/Orders) jest w zakresie produktu? Jeśli tak, wymagania są ogromne (refundy, chargeback, VAT). Jeśli nie — odciąć i wyczyścić `Cart.tsx`, `Orders.tsx`, `Purchase.tsx`.

2. **Rynki docelowe i18n:** Które języki są planowane do uruchomienia? DE, ES, PT wymagają ~5 RD każdy do pełnego tłumaczenia.

3. **Wielodostęp (multi-org):** Czy jedno konto może zarządzać wieloma organizacjami? Obecna architektura zakłada 1:1 (profil → organizacja). Zmiana tego modelu jest kosztowna po starcie.

4. **Wdrożenie własne (on-premise):** Czy klienci enterprise będą wymagać instalacji u siebie? Supabase wspiera self-hosting, ale zwiększa złożoność operacyjną.

5. **Face Recognition compliance:** Dane biometryczne w UE podlegają art. 9 RODO. Czy jest opinia prawna? Bez tego nie włączać `VITE_FEATURE_FACE_RECOGNITION=true` na EU użytkownikach.

6. **Liveable data retention:** Tabela `audit_logs` rośnie liniowo. Czy jest polityka retencji i automatyczne czyszczenie starych wpisów?

7. **Origin projektu (Lovable):** Projekt był generowany przez AI builder (Lovable.dev). Część kodu może być nadmiarowa lub niespójna. Warto zrobić code review całości przed pierwszym dużym klientem enterprise.
