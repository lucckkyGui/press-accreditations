# PressOps — Demo script (12 minut)

> Demo sprzedażowe end-to-end. Wcześniej uruchom seed:
> `SELECT public.seed_pressops_demo('twoj-organizer@domena.pl');`
> Zaloguj się jako ten organizator. Demo Press Festival 2026 jest gotowy.

| # | Krok | Co pokazać | Gdzie | Czas |
|---|------|-----------|-------|------|
| 1 | **Otwórz event** | „Demo Press Festival 2026" — completed, 200 miejsc | `/events` → wejdź w event | 1 min |
| 2 | **Pokaż landing** | Publiczny landing akredytacyjny (branding, formularz) | `/demo-press-festival` (nowa karta) | 1 min |
| 3 | **Złóż zgłoszenie** | Wypełnij formularz jako dziennikarz (live) | landing → submit | 1.5 min |
| 4 | **Verification score** | Scoring + flagi ryzyka, sugestia decyzji | event → tab „Weryfikacja i decyzje" | 1.5 min |
| 5 | **Zatwierdź** | Panel decyzji: status + access level + e-mail toggle → Zapisz | ten sam panel | 1.5 min |
| 6 | **QR pass** | Podgląd QR, pobierz pass PDF | po zatwierdzeniu w panelu | 1 min |
| 7 | **Skanuj QR** | Wklej token / kamera → wynik success (kolor, dane, access level) | `/scanner` | 1.5 min |
| 8 | **Coverage request** | Coverage Board: pending/submitted/verified/missing + „Generuj prośby" | `/coverage-board` | 1 min |
| 9 | **Dodaj publikację** | Secure link `/coverage/<token>` → formularz → success screen | nowa karta | 1 min |
| 10 | **Media Coverage Report** | KPI, lejek, missing coverage (czerwony), top media, **Pobierz PDF** | `/coverage-report` | 1.5 min |

**Łącznie: ~12 min.**

## Punktacja wartości (co podkreślić)

- Krok 4: „system **sugeruje i flaguje ryzyko**, decyzję podejmuje człowiek" —
  to nie jest auto-akceptacja.
- Krok 7: „check-in działa też **offline** — nie polegasz na Wi-Fi na bramce".
- Krok 10: „to jest **dokument dla sponsora** — wartość medialna, nie tabela frekwencji".

## Wariant skrócony (5 min)

Kroki: 1 → 4 → 6 → 7 → 10 (pokazujesz scoring, QR, skan, raport — pomijasz live submit
i coverage submit, bo seed już ma dane).

## Reset po demo

```sql
DELETE FROM public.events
WHERE organizer_id = (SELECT id FROM auth.users WHERE email='twoj-organizer@domena.pl')
  AND category = 'DEMO';
```
