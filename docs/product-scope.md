# PressOps by OSURMO — Product Scope

> Wersja: Tydzień 1 (scope lock pod pilotaż 8-tygodniowy)
> Status: living document — aktualizować przy każdej zmianie zakresu

## 1. Czym jest PressOps

PressOps by OSURMO to **cyfrowa platforma do akredytacji prasowych** dla
organizatorów eventów (festiwale, koncerty, konferencje, wydarzenia sportowe).

Produkt obsługuje pełen cykl życia obecności mediów na wydarzeniu:

```
event → landing page → media submission → verification → approval →
QR pass → check-in → coverage collection → media report
```

PressOps **nie jest** generycznym systemem do zarządzania eventami ani
platformą ticketingową. Konkurujemy w wąskiej, wartościowej niszy:
**media operations** — od zgłoszenia dziennikarza po raport wartości medialnej
dla sponsora.

### Dla kogo
- **Organizator / biuro prasowe** — przyjmuje zgłoszenia, weryfikuje media,
  zatwierdza akredytacje, zarządza check-inem i raportuje.
- **Dziennikarz / medium** — składa zgłoszenie przez publiczny landing,
  otrzymuje QR pass, dostarcza coverage po evencie.
- **Sponsor** — odbiorca raportu wartości medialnej (media value report).

## 2. Core workflow (skrót)

Pełny opis: [`core-workflow.md`](./core-workflow.md).

| # | Krok | Moduł | Route |
|---|------|-------|-------|
| 1 | Event | Events | `/events`, `/events/:id` |
| 2 | Accreditation Landing | Public Landing | `/:slug` |
| 3 | Media Submission | Media Submissions | `/guests`, `/:slug` (form) |
| 4 | Verification | Accreditation Requests | `/events/:id` → tab Akredytacje |
| 5 | Approval | Accreditation Requests | `/guests?filter=pending` |
| 6 | QR Pass | Accreditations | (generowany przy approve) |
| 7 | Check-in | QR Check-in | `/scanner` |
| 8 | Coverage Collection | Coverage | `/media-portal`, `/post-event-report` |
| 9 | Media Report | Reports | `/post-event-report`, `/sponsor-report` |

## 3. Klasyfikacja modułów

Każdy moduł ma jedną z czterech etykiet (źródło prawdy:
[`src/config/navigation.ts`](../src/config/navigation.ts)):

- **core** — część głównego sprzedażowego workflow, widoczne w głównej nawigacji.
- **supporting** — wspiera core, widoczne w nawigacji dodatkowej / system.
- **frozen** — kod pozostaje w repo, **niedostępne przez nawigację**;
  direct URL nadal działa, ale moduł nie jest obietnicą produktową.
- **hidden-from-sales** — istnieje technicznie, **nie jest częścią demo/pilota**;
  nie pokazujemy go klientom jako gotowej funkcji.

### Moduły CORE
| Moduł | Route | Uwagi |
|-------|-------|-------|
| Dashboard | `/dashboard` | Centrum operacyjne |
| Events | `/events` | Tworzenie i zarządzanie wydarzeniami |
| Media Submissions | `/guests` | Lista zgłoszeń mediów (dawniej „Goście") |
| Accreditation Requests | `/guests?filter=pending` | Weryfikacja + zatwierdzanie |
| QR Check-in | `/scanner` | Skaner QR + tryb offline |

### Moduły SUPPORTING
| Moduł | Route |
|-------|-------|
| Media CRM | `/media-portal` |
| Coverage & Reports | `/post-event-report` |
| Press Releases | `/press-releases` |
| Integrations | `/integrations` |
| Security & Audit (admin) | `/audit-trail` |
| Diagnostics | `/diagnostics` |
| Settings | `/settings` |

### Moduły FROZEN (kod zostaje, brak w nav)
| Moduł | Route | Powód |
|-------|-------|-------|
| Ticketing | `/ticketing` | Generyczny ticketing — poza niszą PressOps |
| RFID Scanner | `/rfid-scanner` | Zależność sprzętowa, poza pilotem |
| Wristbands | `/wristbands` | Zależność sprzętowa, poza pilotem |
| Event Marketplace | `/marketplace` | E-commerce / discovery — post-pilot |
| Cart & Checkout | `/cart`, `/checkout` | E-commerce poza scope |
| Face Recognition | (biometric) | GDPR + sprzęt — post-pilot |

### Moduły HIDDEN-FROM-SALES
| Moduł | Route | Powód |
|-------|-------|-------|
| AI Dashboard | `/ai-dashboard` | Pełny AI dashboard = post-pilot; basic analytics w Reports |
| Digital Pass (Wallet) | `/digital-pass` | Apple/Google Wallet niedoprodukcyjne — post-MVP |
| White Label | `/white-label` | Funkcja enterprise, nie w pilocie |
| Report Builder | `/report-builder` | Zaawansowany builder — Coverage & Reports pokrywa MVP |

## 4. Czego NIE robimy teraz

Świadomie **poza zakresem** pilota (nie demo, nie główna nawigacja, nie priorytet):

- ❌ Face recognition
- ❌ RFID / opaski (wristbands)
- ❌ Marketplace eventowy
- ❌ E-commerce / ticketing / koszyk
- ❌ Pełny AI dashboard
- ❌ Pełna integracja Apple Wallet / Google Wallet
- ❌ Rozbudowany help center
- ❌ White-label jako obietnica sprzedażowa

Te funkcje **mogą zostać w repo**, ale nie są częścią głównego demo ani
priorytetu wdrożeniowego.

## 5. Priorytetyzacja (P0 / P1 / P2)

### P0 — must-have do pilota (blokuje sprzedaż bez tego)
- Tworzenie eventu + publiczny landing akredytacyjny
- Formularz zgłoszenia mediów → zapis do `accreditation_requests`
- Weryfikacja i zatwierdzanie / odrzucanie wniosków (real Supabase, nie mock)
- Generacja QR pass dla zatwierdzonych
- Check-in QR (z trybem offline)
- Podstawowy raport po evencie (frekwencja, check-in)

### P1 — ważne dla wartości, ale pilot przeżyje bez pełnej wersji
- Media CRM (baza kontaktów / mediów)
- Coverage collection (zbieranie materiałów po evencie)
- Media value report dla sponsora
- E-mail powiadomienia (Resend) przy approve/reject
- CSV import/export zgłoszeń

### P2 — nice-to-have / post-pilot
- Integracje zewnętrzne (poza podstawowymi)
- Zaawansowana analityka / predykcje
- Press releases workflow rozbudowany
- White-label, wallet pass, AI dashboard (obecnie frozen/hidden)

## 6. Definicja MVP

PressOps MVP jest gotowy do pilotażu, gdy organizator może **bez pomocy zespołu**:

1. Utworzyć event i opublikować publiczny landing akredytacyjny.
2. Przyjąć zgłoszenia mediów przez ten landing (dane w bazie, nie mock).
3. Zweryfikować i zatwierdzić / odrzucić wnioski w panelu.
4. Wygenerować QR pass dla zatwierdzonych mediów.
5. Przeprowadzić check-in QR na miejscu (również offline).
6. Zebrać coverage i wygenerować raport po evencie (PDF/eksport).

Wszystko powyższe na **realnych danych** (Supabase), z TypeScript bez błędów,
przechodzącymi testami i czystym buildem.

## 7. Zasady utrzymania scope

- Nowy moduł UI **musi** mieć wpis w `src/config/navigation.ts` z etykietą scope.
- Frozen / hidden-from-sales **nie trafiają** do `coreNav` / `supportingNav` / `systemNav`.
- Terminologia w copy: **Media Submissions, Accreditation Requests, Media CRM,
  Coverage, Media Reports** — nie „Guests" jako główne pojęcie.
- Direct URL do frozen modułów pozostaje aktywny, dopóki nie powoduje problemów
  (route'y nie są usuwane).
