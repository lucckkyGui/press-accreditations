# 0001 — Media Portal deprecated; baza jako źródło prawdy dla akredytacji

- **Status:** Accepted
- **Data:** 2026-06-02
- **Kontekst audytu:** K2 (typy ↔ schemat ↔ kod rozjechane), Priorytet 2 / Krok A

## Kontekst

Po regeneracji `src/integrations/supabase/types.ts` z żywej bazy `jozg` ujawniło się,
że kilka tabel rdzenia istnieje na bazie (utworzonych poza migracjami, „out-of-band"),
ale kod aplikacji oczekiwał innego kształtu. Trójstronna analiza
(migracja ↔ baza ↔ kod) wykazała dwie odrębne sytuacje:

1. **`accreditations`, `accreditation_types`** — dotykane przez **aktywny** flow
   `landing_page_submissions → guests/accreditations` (`verificationService`,
   `GuestDashboard`). Krytyczne dane przepustki (token QR, stan check-inu) i tak żyją
   na `guests` + `landing_page_submissions`; wpis do `accreditations` jest wtórny/best-effort.
2. **`media_registrations`, `media_documents`** — obsługiwane wyłącznie przez **Media Portal**
   (`/media-portal`, `mediaRegistrationService` + komponenty `press/Media*`), czyli
   równoległy, starszy self-service intake mediów, niezależny od flow landing→accreditations.

Dodatkowo `accreditationService` i `accreditationTypeService` (pełny CRUD) okazały się
**martwym kodem** — ich hooki (`useAccreditations`, `useAccreditationStats`,
`useAccreditationTypes`) nie miały żadnego konsumenta.

## Decyzja

1. **`accreditations` / `accreditation_types`: baza = źródło prawdy.** Poprawiamy aktywny kod
   pod realny schemat (NIE zmieniamy bazy, NIE dodajemy kolumn):
   - insert passa: `type_id→type`, `request_id→accreditation_request_id`,
     `validity_start/end→issued_at/expires_at`, usunięte `qr_code`/`is_checked_in`;
   - revoke: `revoked=true` → `status='revoked'` + powód w `metadata`;
   - `GuestDashboard`: odczyt pod realne kolumny (`issued_at`/`expires_at`/`status`/`type`),
     usunięty join `accreditation_types:type_id` i badge `is_checked_in`;
   - `accreditation_types` to płaski katalog — usunięto `resolveAccreditationTypeId`
     (tworzenie typów per-event z `access_areas`); pass dostaje stały `type = "Prasa"`.
2. **Media Portal = legacy → wygaszony.** Usunięte z aktywnego UI i z repo:
   route `/media-portal`, wpis w CommandPalette, breadcrumb, `MediaPortalPage`,
   komponenty rejestracji/dokumentów (`press/Media{Registration,Document}*`, `press/form`,
   `press/list`), hooki `useMediaRegistrations`/`useMediaDocuments`,
   `mediaRegistrationService`, typy `pressRelease/mediaRegistration|mediaDocument`.
3. **Martwe serwisy akredytacji usunięte:** `accreditationService`,
   `accreditationTypeService` + ich hooki.

## Zakres NIE objęty (świadomie)

- **Bez zmian w bazie** i bez ruszania `supabase/functions/gdpr-export`
  (jego odwołania do `media_registrations`/`media_documents`/`accreditations` są poprawne
  kolumnowo i pozostają — usuwanie danych przy GDPR-erase ma działać niezależnie od UI).
- **Tabele NIE są usuwane** (`media_registrations`, `media_documents` zostają na bazie).
- Pozostawiono `accreditation_requests` + `useAccreditationRequests` (osobna, spójna tabela).
- Pozostawiono nieaktywne, ale poza zakresem: `PressReleaseTabs`/`MediaContactList`/
  `MediaGroupList`/`PressReleaseList` (osobna decyzja).

## Konsekwencje

- Aktywny flow akredytacji (landing → decyzja → pass → check-in) typuje się pod realny
  schemat; znika ryzyko runtime-błędu „kolumna nie istnieje" na ścieżce `/pass`.
- Funkcjonalność Media Portal (self-service rejestracja mediów + upload dokumentów)
  przestaje być dostępna w UI. Dane historyczne w tabelach pozostają nienaruszone.
- Jeśli self-service intake będzie znów potrzebny — należy go odbudować na spójnym
  schemacie (lub zmigrować `media_registrations` formalnie), nie przywracać starego kodu.
