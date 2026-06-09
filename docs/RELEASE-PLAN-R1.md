# Plan R1 — stan i kolejność pracy
_Odświeżony: 2026-06-03_

## 1. Gdzie jesteśmy
- Rekonsyliacja schematu kod↔baza: Kroki A/B + P0-3 → **typecheck 103 → 0**.
- Higiena `as any`: 71 → 22 (reszta skategoryzowana: a2 drift, third-party, dług generyczny `useApi`).
- Offline skaner — prefetch manifestu: **naprawiony i ZWERYFIKOWANY** — karta „Gotowe offline · 1 gości" widoczna na `/scanner`. Do: commit + push.
- Gałąź robocza: `fix/coverage-submit-public`.
- Środowiska testowe: `localhost` (desktop), LAN `192.168.1.x` (telefon), Vercel (HTTPS). ⚠️ patrz „kamera" w sekcji 3.

## 2. Jak pracujemy (workflow)
- **Ja (architekt + review):** czytam diffy/raporty agenta, projektuję kroki, pilnuję spójności i decyzji produktowych.
- **Agent (Claude Code w repo):** wykonanie — dostaje ode mnie precyzyjne prompty.
- **Pętla na każdą zmianę:** audyt *read-only* → plan → **Twoje OK** → zmiana → gate (`typecheck && lint && test:run`, Node 22, typecheck = 0) → diff → **Twoje OK** → commit (mały, opisowy) → push.
- **Zasady:** baza = prawda dla aktywnego kodu; martwy kod → deprecate; **STOP & pokaż** przy każdej decyzji produktowej (agent nie zgaduje); nic nie commitujemy bez Twojego OK; dokumenty (plan/backlog) = referencja, nie auto-wykonanie.

## 3. PRIORYTET 1 — „Check-in naprawdę działa"
Testy live odsłoniły, że cała ścieżka check-in jest popsuta w kilku miejscach. To jest teraz centrum, bo to walidujesz. Kolejność:

**1a. Kamera się nie uruchamia (przycisk wyszarzony).**
- Telefon pod `192.168.1.16` (HTTP) → **reguła bezpiecznego kontekstu**: `getUserMedia` działa tylko po HTTPS lub na `localhost`. LAN-IP po HTTP = blokada przeglądarki. **Nie bug.** Test na telefonie: przez HTTPS (Vercel) / tunel / `vite --https`.
- Desktop → otwórz dokładnie `http://localhost:PORT`; powinna działać. Jeśli pod czystym `localhost` nadal wyszarzona → bug w warunku `disabled` (do zbadania).

**1b. Kod gościa = `OSURMO` (z formularza) → ma być GENEROWANY, NUMERYCZNY, unikalny.** Priorytet — bez tego check-in po własnych kodach jest niespójny i grozi kolizjami. Format spójny z bileterią (np. 10 cyfr).

**1c. QR — czy to prawdziwy, skanowalny kod.** Render: biblioteka vs dekoracja, finder patterns, kodowana wartość. (Może być OK, a problemem była tylko wartość — wtedy zamykamy.)

**1d. Skaner nieczytelny na telefonie.** Layout mobile-first (pionowy stack, duży podgląd) + brakujące tłumaczenie `scanner.title…`.

→ Dopiero gdy: kamera rusza + kod numeryczny + QR skanowalny + layout ok → **pełna weryfikacja:** online badge (✅ już działa — „1 gości") → offline → skan zwraca gościa (nie `unknown`).

## 4. Ergonomia testów — etykieta wersji
Mały task, robimy wcześnie (rozwiązuje powracające „którą wersję testuję"): w rogu (np. lewy dolny) **commit SHA + branch + czas builda**, wstrzyknięte przy buildzie (Vite `define`/env; na Vercel z `VERCEL_GIT_COMMIT_SHA`, lokalnie z `git rev-parse`). Widoczne na wszystkich środowiskach.

## 5. PRIORYTET 2 — domknięcie R1 do shippable
- Deploy edge functions + sekrety (`RESEND_API_KEY`, `PUBLIC_APP_URL` realny, `ALLOWED_ORIGINS`).
- Catch-up migracje (Docker) — out-of-band tabele + drift RPC `process_qr_check_in`.
- Smoke E2E (Playwright): submission → approve → QR → check-in → coverage → report.
- Merge do `main`.

## 6. Po R1 — epiki (backlog, sekcja F)
Import biletów (.txt/.csv/.xlsx), marketplace mediów/twórców, dashboardy per rola + konsolidacja logowania, kod skanera (6-cyfrowy device login), skaner native/hybryda (NFC na iOS), email-engagement.

## 7. Co teraz (najbliższy krok)
1. **Commit prefetch** (zweryfikowany — badge „1 gości") + push.
2. **Kamera:** retest desktopu na czystym `localhost`; telefon przez HTTPS (Vercel). Podaj wynik.
3. **Etykieta wersji** — szybki task (osobny prompt).
4. **Audyt check-in** (read-only) — generacja kodu (OSURMO→numeryczny), QR render, layout mobile, + warunek `disabled` kamery jako fallback (osobny prompt).
