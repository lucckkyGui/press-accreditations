
# 🚀 20 Faz do Perfekcji — Plan Optymalizacji

**Projekt: 476 plików, ~65,000 linii kodu, 65 tras, 24 tabele DB**

---

## FAZA 1: 🔥 Eliminacja martwego kodu
- Usunięcie 5 mock serwisów (`mockEventsService` 654 LOC, `mockPressReleaseService` 562 LOC, `mockDashboardService`, `mockEmailService`, `mockEventStatsService`) — łącznie ~1,500 LOC
- Usunięcie nieużywanych komponentów (duplikaty: `GuestTable` vs `GuestsTable`, `ProfileEditForm` vs `EnhancedProfileEditForm`)
- Usunięcie `src/types/supabase/schema.ts` (375 LOC) — duplikat auto-generowanych typów

## FAZA 2: 📦 Redukcja bundla — ciężkie zależności
- Zamiana `html5-qrcode` (150KB) na lżejszą alternatywę lub dynamic import
- Dynamic import dla `jspdf` + `jspdf-autotable` (ładowane tylko przy eksporcie PDF)
- Dynamic import dla `jszip` (używany rzadko)
- Dynamic import dla `react-markdown` (tylko chat AI)
- Cel: **-200KB z main bundle**

## FAZA 3: 🧩 Rozbicie mega-komponentów (>400 LOC)
- `OrganizerDashboard.tsx` (515 LOC) → osobne widgety
- `Purchase.tsx` (606 LOC) → podkomponenty
- `LandingPageBuilder.tsx` (503 LOC) → osobne sekcje
- `MassEmailSender.tsx` (468 LOC) → logika/widok
- `InvitationEditor.tsx` (461 LOC) → osobne panele
- Cel: Żaden komponent >300 LOC

## FAZA 4: 🏎️ Optymalizacja re-renderów
- Dodanie `React.memo()` do ciężkich list (GuestsTable, EventsGrid, NotificationsList)
- `useMemo`/`useCallback` w hookach z dużymi obliczeniami
- Stabilizacja referencji obiektów przekazywanych jako props
- Audit `useEffect` dependencies — eliminacja zbędnych re-fetchów

## FAZA 5: 🎨 Konsolidacja Design Tokens
- Audit hardcoded colors → semantic tokens z `index.css`
- Ujednolicenie border-radius, spacing, shadow patterns
- Utworzenie variant-ów shadcn dla powtarzalnych wzorców UI
- Usunięcie inline styles i duplikatów CSS

## FAZA 6: 📝 Eliminacja `any` typów
- Scan i zamiana wszystkich `any` na właściwe typy TypeScript
- Dodanie strict typów do hooków (useAuth, useEvents, useGuests)
- Type-safe Supabase queries z generics
- Cel: **0 instancji `any` w kodzie**

## FAZA 7: 🌐 Optymalizacja i18n
- Lazy loading tłumaczeń per język (zamiast all-at-once)
- Usunięcie nieużywanych kluczy tłumaczeń
- Konsolidacja 10 modułów i18n w logiczne grupy
- Typesafe klucze tłumaczeń

## FAZA 8: 🔄 Optymalizacja React Query
- Ujednolicenie `staleTime`/`gcTime` per typ danych (eventy: 5min, goście: 1min)
- Prefetching na hover dla kluczowych nawigacji
- Optimistic updates dla wszystkich mutacji CRUD
- Deduplikacja queryKeys

## FAZA 9: 🛡️ Error Handling & Resilience
- Globalna strategia obsługi błędów (ErrorBoundary per sekcja, nie per app)
- Retry logic w React Query z exponential backoff
- Graceful degradation dla offline
- User-friendly error messages zamiast technical toast

## FAZA 10: ♿ Dostępność WCAG 2.1 AA
- Audit focus management i keyboard navigation
- ARIA labels na interactive elements
- Color contrast verification (4.5:1 minimum)
- Screen reader testing na kluczowych flowach
- Skip navigation links

## FAZA 11: 📱 Mobile UX Polish
- Responsive audit wszystkich 65 stron
- Touch targets min. 44x44px
- Swipe gestures na listach (delete, archive)
- Bottom sheet navigation zamiast dropdowns na mobile

## FAZA 12: ⚡ Database Query Optimization
- Audit N+1 queries (guests + events + invitations)
- Composite indexes dla częstych filtrów
- Pagination optimization (cursor-based vs offset)
- Connection pooling verification

## FAZA 13: 🔐 Hardening Edge Functions
- Input validation z Zod na WSZYSTKICH Edge Functions
- Ujednolicenie error response format
- Request/Response logging dla debugging
- Health check endpoint monitoring

## FAZA 14: 📊 Analytics & Monitoring
- Real User Monitoring (RUM) — Core Web Vitals tracking
- Error tracking z context (user, route, action)
- Performance budgets w CI (bundle size alerts)
- Database query performance monitoring

## FAZA 15: 🧪 Test Coverage
- Unit testy dla krytycznych hooków (useAuth, useGuests, useEvents)
- Integration testy dla Edge Functions
- E2E testy dla kluczowych flowów (login → dashboard → create event → add guest → scan QR)
- Cel: **>60% coverage na krytycznych ścieżkach**

## FAZA 16: 🎭 Animation & Micro-interactions
- Ujednolicenie transition durations (150ms/300ms/500ms)
- Page transitions z Framer Motion (shared layout)
- Skeleton → content transitions
- Loading states z progress indicators

## FAZA 17: 🖼️ Asset Optimization
- Image lazy loading z `loading="lazy"`
- WebP/AVIF format dla zdjęć
- SVG optimization (SVGO)
- Font subsetting (ładowanie tylko używanych glifów)

## FAZA 18: 📋 Form UX Excellence
- Auto-save drafts (events, invitations, templates)
- Multi-step form progress persistence
- Inline validation z debounce
- Smart defaults i autofill

## FAZA 19: 🔄 State Management Cleanup
- Eliminacja redundantnego state (React Query vs useState)
- Context consolidation (auth, theme, i18n)
- URL state dla filtrów i paginacji (shareable URLs)
- Optimistic UI dla wszystkich interakcji

## FAZA 20: 🚢 Production Readiness
- Build size audit i tree-shaking verification
- Lighthouse score >95 (Performance, Accessibility, Best Practices, SEO)
- Security headers verification
- Cache strategy (service worker, HTTP cache headers)
- Final code review i documentation

---

## 📊 Szacowany wpływ

| Metryka | Teraz | Po 20 fazach |
|---------|-------|-------------|
| Bundle size (main) | ~800KB | ~400KB |
| Łączny LOC | 65,000 | ~50,000 |
| Pliki | 476 | ~380 |
| Typy `any` | ~50+ | 0 |
| Lighthouse Performance | ~70 | 95+ |
| Największy komponent | 654 LOC | <300 LOC |
| Mock services | 5 | 0 |

## ⚡ TOP 10 plików do natychmiastowej redukcji

1. `mockEventsService.ts` — **654 LOC → USUNĄĆ** (dane testowe)
2. `mockPressReleaseService.ts` — **562 LOC → USUNĄĆ**
3. `BulkFaceEnrollment.tsx` — **623 LOC → rozbić na 3 pliki**
4. `Purchase.tsx` — **606 LOC → rozbić na podkomponenty**
5. `OrganizerDashboard.tsx` — **515 LOC → wydzielić widgety**
6. `LandingPageBuilder.tsx` — **503 LOC → sekcje osobno**
7. `mediaRegistrationService.ts` — **487 LOC → uprościć**
8. `MassEmailSender.tsx` — **468 LOC → logika + widok**
9. `InvitationEditor.tsx` — **461 LOC → panele osobno**
10. `EmailTemplateEditor.tsx` — **444 LOC → wydzielić preview**

---

**Proponuję zacząć od Faz 1-3 (eliminacja martwego kodu + redukcja bundla + rozbicie mega-komponentów) — to da największy ROI przy najmniejszym ryzyku.**
