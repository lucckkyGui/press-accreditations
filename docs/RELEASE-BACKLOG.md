# Backlog wdrożeniowy — kolejne releasy

> Uzupełnienie do `RELEASE-PLAN-R1.md`. Zebrane: pozycje odłożone z audytu **+**
> rzeczy odkryte w trakcie pracy nad R1 (zwłaszcza dług schematu).
> `[ ]` = do zrobienia. Sekcje A–B to dług z tej sesji; C to infra/workflow; D–E to stary backlog.

---

## A. Domknięcie R1 (zanim R1 można nazwać „wypuszczonym")

To jest w zakresie R1, ale jeszcze niezrobione:

- [ ] **Rekonsyliacja schematu kod↔baza (Priorytet 2 z sesji) — BLOKER.**
  4 tabele istnieją tylko na bazie `jozg` (out-of-band z Lovable), bez migracji:
  `accreditations`, `accreditation_types`, `media_registrations`, `media_documents`.
  Kod oczekuje innego (starszego) kształtu niż wdrożony. Kroki:
  1. **Decyzja o źródle prawdy** per tabela (wstępne czytanie: baza = nowszy model, kod = stary prototyp; QR siedzi na `guests`, nie na `accreditations`). Splecione ze split-brainem (I1).
  2. **Catch-up migracje** dla 4 tabel — z Dockerem (walidacja odtwarzania na świeżym projekcie) i **poprawną kolejnością** (np. `accreditation_types` musi powstać PRZED `20260116091435`, które zmienia jej RLS).
  3. **Poprawa kodu** issuance (`buildAccreditationPassInsert`) i rejestracji mediów pod uzgodniony schemat.
  Blokuje ścieżki `/pass` i rejestracji mediów — bez tego R1 nie jest production-ready.
- [ ] **Dokończenie zdejmowania `as any`** ze spójnych serwisów (`coverageService`, `mediaCrmService`, spójne fragmenty `verificationService`) — po rekonsyliacji. `coverageReportService` już czysty (WIP commit).
- [ ] **Deploy edge functions + sekrety** (ogon P0-1): `supabase functions deploy` + ustawić `RESEND_API_KEY`, `PUBLIC_APP_URL` (**prawdziwy URL, nie `localhost`**), `ALLOWED_ORIGINS`. Bez tego e-mail / coverage nie działają end-to-end.
- [ ] **Smoke E2E** głównej ścieżki (P0-5) na żywym projekcie: submission → approve → QR → check-in → coverage → report. Dodać `playwright.config`.

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

---

## Zrobione w R1 (dla kontekstu)

- [x] Env fail-fast w `client.ts` + usunięcie fallbacku do prod (K3); jeden lockfile (D6).
- [x] `verify_jwt=false` dla `coverage-submit` (publiczny endpoint, domyka 401).
- [x] Naprawiony martwy ref projektu (`ajot` → `jozg`) w `config.toml` i docsach.
- [x] Migracje rdzenia wdrożone i otrackowane na `jozg` (część P0-1).
- [x] Snapshot schematu `jozg` jako ubezpieczenie (`schema_snapshot.sql`).
- [x] Liczniki organizatora → `landing_page_submissions` (część I1, Opcja A).
