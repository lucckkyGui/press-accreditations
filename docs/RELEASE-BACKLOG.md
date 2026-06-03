# Backlog wdrożeniowy — kolejne releasy

> Uzupełnienie do `RELEASE-PLAN-R1.md`. Zebrane: pozycje odłożone z audytu **+**
> rzeczy odkryte w trakcie pracy nad R1 (zwłaszcza dług schematu).
> `[ ]` = do zrobienia. Sekcje A–B to dług z tej sesji; C to infra/workflow; D–E to stary backlog.

---

## A. Domknięcie R1 (zanim R1 można nazwać „wypuszczonym")

To jest w zakresie R1, ale jeszcze niezrobione:

- [ ] 🔴 **Offline skaner — podpiąć prefetch manifestu do `/scanner` (EVENT-CRITICAL).** Silnik offline gotowy (Dexie, kolejka, sync 30s + `online`, serwerowy dedup first-write-wins w RPC `process_qr_check_in`), ALE `downloadEventManifest()` jest wołany tylko w **niemontowanym** `UnifiedQRScanner`; żywy `Scanner.tsx` go nie wywołuje → Dexie `guests` nigdy nie zapełniany → **offline każdy kod = `unknown`/`invalid`**, bramka nie zweryfikuje gościa ani nie zobaczy nazwiska. Fix: auto-`downloadEventManifest(eventId)` przy wyborze eventu gdy online (albo zrenderować `OfflineEventManifestCard` na Scannerze). Tylko wyzwalacz — maszyneria już jest.
- [ ] **Dostęp skanera dla obsługi bramki (decyzja).** `/scanner` dopuszcza dziś tylko `admin`/`organizer`; rola `staff` nie wejdzie. Na realny event: albo dopuścić `staff` + konta dla bramkowych (stopgap), albo zbudować „kod skanera" (sekcja F). Do decyzji.
- [ ] **Catch-up migracje** (Docker) — out-of-band tabele bez migracji (`accreditations`, `accreditation_types`, `media_registrations`, `media_documents`) **+ drift RPC `process_qr_check_in`** (migracja `20260520143000` ma 3 param, wdrożony `jozg` ma 5: `_client_scan_id`/`_scanned_at`). Repo nie odtworzy dziś schematu/RPC na świeżym projekcie. Poprawna kolejność (np. `accreditation_types` przed `20260116091435`). *Code-fix issuance (`buildAccreditationPassInsert`) już zrobiony w Kroku A.*
- [ ] **Deploy edge functions + sekrety** (ogon P0-1): `supabase functions deploy` + `RESEND_API_KEY`, `PUBLIC_APP_URL` (**prawdziwy URL, nie `localhost`**), `ALLOWED_ORIGINS`.
- [ ] **Smoke E2E** głównej ścieżki (P0-5): submission → approve → QR → check-in → coverage → report. Dodać `playwright.config`.
- [ ] **Merge do `main`** po zielonym E2E.

> ✅ **Zrobione w tej sesji** (było tu jako „bloker"): rekonsyliacja schematu kod↔baza — Kroki A/B + P0-3 (deprecacja martwego: Media Portal, invitations/email frontend, `accreditationRequestService`, `AccreditationManagement`; baza=prawda dla aktywnych), **typecheck 103→0**. Higiena `as any` 71→22 (reszta skategoryzowana: a2 drift + third-party + dług generyczny `useApi`).

---

## B. Schemat i migracje — dług z sesji

- [ ] **Zasada: żadna tabela nie powstaje poza migracjami.** Koniec tworzenia schematu „ręcznie / w Lovable". Po rekonsyliacji repo musi odtwarzać **komplet** przez `db push` na świeżym projekcie (dziś nie odtworzyłoby 4 tabel).
- [ ] **Przemianować `20260330_performance_indexes.sql`** na pełny 14-cyfrowy timestamp + `migration repair`, żeby zniknął rozdwojony wpis w `migration list` (lokalnie vs zdalnie jako `20260330`).
- [ ] **`schema_snapshot.sql`** — odświeżać przy istotnych zmianach schematu (do czasu, aż migracje będą kompletne), potem wycofać, gdy migracje przejmą rolę źródła prawdy.
- [ ] **Reverted ghosts** — 7 wpisów z przenosin `ajot→jozg` oznaczonych `reverted`; przy okazji sprzątania historii zweryfikować, że nic z nich nie jest potrzebne.
- [ ] **Zepsuty mirror trigger** `mirror_landing_submission_to_requests` — INSERTuje do `accreditation_requests` kolumny, których ta nie ma (`media_name/contact_email/...`); `EXCEPTION WHEN OTHERS` połyka błąd → cichy no-op. Usunąć albo naprawić przy sprzątaniu schematu (nie pilne, nie szkodzi).

### Niekompletne funkcje — kod istnieje, schemat nie *(decyzja: keep vs deprecate)*
Wykryte przy audycie `as any` (kat. a2). Każda to osobna decyzja produktowa: dodać schemat (migracja, R2) czy wygasić kod. Do czasu decyzji `as any` w tych miejscach zostaje (trzyma typecheck na 0).
- [ ] **Webhooki** — `ApiKeyManagement` czyta/pisze `webhook_subscriptions`, tabeli **brak** na bazie (część `api_keys` działa normalnie). Feature wchodzi czy nie?
- [ ] **`public_events`** — `EmbedRegisterForm` używa `public_events`; brak w generated types. **Najpierw zweryfikować**, czy to realny VIEW na bazie (→ cast uzasadniony, regen types z viewami) czy martwy odnośnik.
- [ ] **Face recognition** — `FaceRecognitionCheckIn` czyta `guests.face_photo_url`, kolumny **brak**. Czy rozpoznawanie twarzy w ogóle jest w zakresie?

---

## C. Infra i workflow (kiedy złapiesz oddech)

- [ ] **Zainstalować Docker** — potrzebny do lokalnego Supabase (`db pull`/`db reset`, walidacja catch-up migracji, testy integracyjne). Dziś był blokerem przy `db pull`.
- [ ] **Osobny projekt Supabase „staging"** — wg `STAGING-SETUP-CHECKLIST.md`, gdy pojawią się realne dane / pierwszy klient.
- [ ] **CI na PR-ach** (`.github/workflows/ci.yml`, Node 22): build + typecheck + lint + test na każdy PR; po R1 dorzucić smoke E2E.
- [ ] **Pre-commit hook** (husky + lint-staged): gate `typecheck + lint + test` przed każdym commitem — żeby poprzeczka nie spadała.
- [ ] **Ratchet na `as any` / `: any`** w CI — liczba nie rośnie między PR-ami (po regeneracji typów). Podłoga po higienie R1 = **22** (6× a2 drift + 7× third-party jspdf/navigator + 9× dług generyczny niżej); spada, gdy rozwiążemy a2 i refaktor generyków.
- [ ] **Refaktor generyków `useApi`/`ApiResponse`** — warstwa `useApiQuery` nie przenosi `ApiResponse<T>`, więc zdjęcie castu daje `Property 'data' does not exist on type 'never'`. 9× `as any` (`useEvents`, `useGuestQuery`, `useGuestMutations`, `useApi`) zostaje pod tym, dopóki granica generyczna nie zostanie przeprojektowana. Nie R1 — osobny, świadomy refaktor typów.
- [ ] **`supabase/.temp/` → `.gitignore`** (drobiazg, wciąż niezrobiony).
- [ ] **config.toml zawsze zsynchronizowany z aktywnym projektem** — lekcja z martwego refa `ajot`; przy każdej zmianie projektu aktualizować `project_id` i `.env`.
- [ ] **Sekcja `[auth]` w `config.toml`** — dziś jej brak; konfiguracja OTP/OAuth/confirm żyje tylko w dashboardzie Supabase (ryzyko rozjazdu środowisk). Skomitować do repo. Przy okazji **potwierdzić status providerów OAuth** — przyciski `signInWithOAuth` są w UI, ale bez `[auth.external]` provider prawdopodobnie nieaktywny; Apple do dodania.
- [ ] **Handler `ChunkLoadError`** — auto-reload przy `Failed to fetch dynamically imported module` po deployu (domyka okno między starą kartą a nowym SW; dziś łagodzone tylko `cleanupOutdatedCaches` + prompt).
- [ ] **Domknąć branchowanie** — `redesign/linear-vercel` (+48 nad main) zmergować do `main`, zacząć z czystego stanu; krótkie gałęzie + częsty merge.
- [ ] **ADR / `docs/decisions/`** — zapisywać decyzje typu „źródło prawdy", „co frozen" jako krótkie notatki.

---

## D. R2 — jakość i zaufanie (audyt, P1)

- [ ] **`strict: true`** przyrostowo (plik po pliku) + redukcja `: any` (było 200×).
- [ ] **Rekonsyliacja liczników CRM** — widok/agregacja zamiast inkrementów (idempotencja).
- [ ] **Trwały rate limiter** (Postgres/Upstash) dla publicznych endpointów (dziś in-memory, resetuje się na cold start).
- [ ] **Sync `accreditations.is_checked_in`** z check-inem (I2) — *jeśli* `accreditations` zostaje po rekonsyliacji z sekcji A.
- [ ] **Cron reminderów coverage** (P1-4) — `pg_cron`/scheduler dla `coverage-reminders` (`mode=cron`).
- [ ] **Testy integracyjne** serwisów Supabase (lokalny Supabase + vitest) dla decyzji/coverage.

---

## E. Post-MVP (audyt, P2)

- [ ] Usunąć/oznaczyć makiety: marketplace mock (`EventMarketplace.tsx`), `BadgeGenerator` hardcoded `event-123`.
- [ ] **Font TTF w PDF** — pełne polskie znaki w `coverageReportPdf` (dziś zamienniki ASCII).
- [ ] **Code-split** ciężkich bundli (jsPDF ~390 KB, recharts) ładowanych on-demand.
- [ ] **Eliminacja duplikacji reguł scoringu** (FE `verificationScoring.ts` + kopia w edge) — wspólny moduł lub testy kontraktowe.
- [ ] **Decyzja „frozen vs domknięcie"** dla RFID / marketplace / AI / wristbands.
- [ ] **Domknięcie split-brain (I1):** drugie wejście `/accreditation-request`, widok `GuestDashboard` (filtr po `user_id`, którego `landing_page_submissions` nie ma), wycofanie legacy `AccreditationManagement` z nawigacji.

---

## F. Funkcje produktowe (roadmapa)

### Email engagement & wątki mailowe w systemie  *(zgłoszone przez właściciela)*
Cel: śledzenie otwarć, monitorowanie odpowiedzi i prowadzenie wątku mailowego w systemie.
Schemat częściowo wspiera (`invitations.sent_at/opened_at`, ESP Resend) — to epik, nie fix.

- [ ] **Open/delivery tracking** — webhooki Resend (delivered/opened/clicked/bounced) → zapis do `invitations.opened_at`/statusu. (Sprawdzić zakres webhooków Resend.)
- [ ] **Reply monitoring (inbound email)** — odbiór i parsowanie odpowiedzi → powiązanie z wątkiem. (Zweryfikować, czy Resend obsługuje inbound; jeśli nie — osobny route inbound.)
- [ ] **Wątek/konwersacja w UI** — model wątku + widok. (Uwaga: w bazie są już `chat_conversations`/`chat_messages` — sprawdzić, czy to AI-support czy da się reużyć.)
- [ ] **Po zbudowaniu** — przywrócić metrykę „otwarte" w `useEventAnalytics` czytając z właściwego źródła (`invitations`), a nie z nieistniejących kolumn `guests`.

Zależność: wymaga wyboru/konfiguracji ESP pod inbound + webhooki; do zaprojektowania jako osobny epik po R1.

### Publiczne wejście dziennikarzy (intake)  *(decyzja: zaprojektować osobno)*
Obecne `/accreditation-categories` + `/accreditation-request` to **MOCK** (nie zapisują nic; realny intake = landing per-event `/:slug` → `landing_page_submissions`).

- [ ] **Zaprojektować funnel** — jak dziennikarz trafia do właściwego landingu (publiczna lista wydarzeń? bezpośredni link? coś innego?).
- [ ] **Po zaprojektowaniu — usunąć mock flow:** `AccreditationRequest`, `AccreditationCategories`, `AccreditationForm`, `AccreditationEvents` + przepiąć linki (`Index.tsx` redirect non-org, `FooterSection`, `InteractiveHero`, `AccreditationEventCard`).
- Do tego czasu mock zostaje jako nieszkodliwy placeholder (renderuje się, nie psuje linków).

### Dashboardy per rola + konsolidacja logowania  *(zgłoszone przez właściciela, pkt 5)*
Model ról jest gotowy (`app_role`: admin/moderator/organizer/staff/guest, `user_roles`, RLS, guardy tras), ale dashboardy są tylko dwa (Organizer/Admin vs catch-all `GuestDashboard`).
- [ ] **Widoki per rola** — osobne dashboardy: dziennikarz, bramkowy (`staff`), koordynator bramki, influencer, organizator.
- [ ] **Konsolidacja logowania** — jedno wejście (email/hasło + Google/Apple); rozważyć usunięcie osobnego trybu „gość" (dziś realny email-OTP w `GuestLoginForm`), bo myli. Splata się z „Publicznym wejściem dziennikarzy" wyżej — projektować razem.

### Kod skanera — logowanie urządzenia bramki  *(zgłoszone przez właściciela, pkt 3)*
Dziś skaner wymaga pełnego konta organizer/admin; mechanizmu krótkiego kodu nie ma.
- [ ] 6-cyfrowy kod parujący urządzenie, generowany przez organizatora/koordynatora, scoped do eventu/strefy, z ważnością. Wymaga tabeli (kod, `event_id`, zakres, expiry, `created_by`) + UI generowania + zakładki „Skaner" z wpisaniem kodu + ścieżki auth bez pełnego konta.

### Marketplace mediów i twórców  *(zgłoszone przez właściciela, pkt 4 — duży epik)*
Dwustronny marketplace; jest mock `EventMarketplace.tsx` (sekcja E) jako punkt wyjścia. Pod-epiki:
- [ ] **Konta + profile mediów** (self-service) + portfolio dla fotografów/wideo/redaktorów.
- [ ] **Marketplace akredytacji** — media aplikują na eventy, organizator akceptuje/odrzuca.
- [ ] **Marketplace usług + płatności** — twórcy wystawiają usługi, organizator kupuje (Stripe już w stacku).
- [ ] **Influencerzy + agencje.**

### Skaner: przeglądarka vs native vs hybryda  *(decyzja architektoniczna, pkt 5)*
Realna granica: QR przez kamerę działa w przeglądarce cross-platform; **Web NFC działa tylko w Chrome/Android — na iOS w żadnej przeglądarce.** Jeśli RFID/NFC na iOS jest w wizji, czysta PWA nie wystarczy → native albo hybryda (Capacitor, jedna baza kodu + natywne pluginy NFC/kamera). Dobry kandydat na realny tiering produktowy (PWA = tylko QR; aplikacja = pełny RFID).

### Import biletów z bileterii (.txt / .csv / .xlsx)  *(zgłoszone przez właściciela)*
Realny workflow z Circoloco: bilety Stage24 mają QR + kod `XXX-XXX-XXXX` (10 cyfr); na bramkę szła płaska lista 10-cyfrowych kodów w `.txt` (~5,4 tys.). Cel: wczytać kody z pliku do `guests`/manifestu, żeby skaner (online i offline) je walidował. Most do czasu integracji API z bileterią.
- [ ] **Najpierw sprawdzić**, czy import już istnieje (`guestBulkService` robi bulk-insert do `guests`) — jeśli tak, rozszerzyć, nie budować od zera.
- [ ] **Formaty:** `.txt` (płaska lista kodów), `.csv`, `.xlsx` (kolumny: kod, typ/tier, imię, e-mail).
- [ ] **Normalizacja kodu** — przy imporcie i przy skanie ścinać myślniki/spacje (`773-010-1526` ↔ `7730101526`), żeby match działał niezależnie od formatu.
- [ ] **BOM/encoding** — plik z Circoloco miał UTF-8 BOM na 1. linii; parser musi go ścinać (inaczej pierwszy kod nie matchuje).
- [ ] **Typ/tier tylko z .csv/.xlsx** — `.txt` nie niesie typu (GA vs BACKSTAGE); tiery/strefy + nazwiska importowalne wyłącznie z csv/xlsx. Presety kolumn pod platformy (Stage24/eBilet/RA/Shotgun — różne eksporty).
- [ ] Po imporcie → `guests` → manifest offline (po naprawie prefetchu) go pobierze → skaner waliduje na bramce.

---

## Zrobione w R1 (dla kontekstu)

- [x] Env fail-fast w `client.ts` + usunięcie fallbacku do prod (K3); jeden lockfile (D6).
- [x] `verify_jwt=false` dla `coverage-submit` (publiczny endpoint, domyka 401).
- [x] Naprawiony martwy ref projektu (`ajot` → `jozg`) w `config.toml` i docsach.
- [x] Migracje rdzenia wdrożone i otrackowane na `jozg` (część P0-1).
- [x] Snapshot schematu `jozg` jako ubezpieczenie (`schema_snapshot.sql`).
- [x] Liczniki organizatora → `landing_page_submissions` (część I1, Opcja A).
