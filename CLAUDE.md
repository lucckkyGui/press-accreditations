# CLAUDE.md

Przewodnik pracy nad tym repo — Claude Code czyta go na starcie sesji. Język pracy: **polski**.

## Role
- **Architekt/recenzent (czat)** — projektuje, przegląda audyty/plany/diffy, podejmuje decyzje produktowe i architektoniczne.
- **Wykonawca (Claude Code, to repo)** — edytuje kod, commituje, pushuje. Nie ma dostępu do terminala usera, Dockera ani Supabase CLI — komendy CLI wykonuje user ręcznie wg instrukcji.

## Gate — przed KAŻDYM commitem
Wymaga Node 22 (`export PATH="/opt/homebrew/opt/node@22/bin:$PATH"` jeśli trzeba):  npm run typecheck && npm run lint && npm run test:run Przy zmianach w buildzie/konfiguracji Vite dodaj `npm run build`. Baza: typecheck 0, lint 0 errors (warningi pre-existing), testy 148/148 — nie regresować.

## Workflow `/cykl` (dla zmian w kodzie)
audyt read-only → plan → **STOP na OK** → implementacja → gate → diff → **STOP na OK** → commit.
- Trywialny, w pełni określony diff: drugi STOP można pominąć (gate zielony + diff zgodny z planem → commit).
- Czyste docs: gate niepotrzebny.

## Gałęzie
- Jedna zmiana = jedna mała nazwana gałąź od `main` (`feat/ fix/ chore/ docs/`), jeden PR.
- `main` = produkcja: Vercel wdraża z `main` automatycznie. Merge ≠ launch.
- URL produkcyjny: `https://press-accreditations.vercel.app` (docelowo `pressacreditation.com`).

## Supabase (baza + edge functions)
- Schemat **wyłącznie** przez pliki migracji + `supabase db push`. Nigdy przez SQL editor.
- Migracje: pełny 14-cyfrowy timestamp. Rozjazd historii → `supabase migration repair --status reverted <old>` + `--status applied <new>`.
- Edge functions bez Dockera: `supabase functions deploy <nazwa> --use-api`. Sekrety: `supabase secrets set KEY=val`.
- **User nie ma Dockera** → `functions serve` i `db pull` niedostępne; migracje wymagające Dockera są zablokowane.

## Stack
React 18 + TS + Vite + Tailwind + shadcn/ui, Dexie (offline), PWA/Vercel. Supabase (Postgres/RLS/Edge Functions Deno), Stripe, Resend.

## Gotchas
- **git:** lokalny git ma bug `vsnprintf` → operacje git poprzedzaj `LC_ALL=C`.
- **`public/version.json`:** generowany przez build (stempluje commitem). Nie commituj re-stempla — `git checkout -- public/version.json`, jeśli build go ruszył.
- **`supabase/.temp/`:** artefakt CLI, ignorować.
- **Maile (Resend):** zweryfikowany tylko root `bookingartistagency.com` → FROM musi być `@bookingartistagency.com`.
- **Runtime (kamera/skaner, maile, CORS):** gate tego nie złapie — wymaga smoke-testu na realnym urządzeniu.

## Zasady
- Nigdy nie commituj sekretów/haseł — ani do repo, ani do tego pliku.
- Aktualny stan/plan: `docs/RELEASE-BACKLOG.md`, `docs/RELEASE-PLAN-R1.md`. Deploy: `docs/DEPLOY-RUNBOOK.md`.
