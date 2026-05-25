# Design Audit — Linear/Vercel Redesign
**Data:** 2026-05-25 | **Audytor:** Claude (Sonnet 4.6)

---

## KRYTYCZNE: Brakujące tokeny w index.css / tailwind.config.ts

> **index.css i tailwind.config.ts NIE zostały jeszcze zaktualizowane.**
> Obecne pliki mają stary styl (Plus Jakarta Sans, fioletowe tony).
> `.bak` pliki są identyczne z bieżącymi wersjami.

### Tokeny wymagane przez specyfikację, których BRAKUJE:

| Token | Typ | Używany w REGUŁY jako |
|---|---|---|
| `--hairline-1`, `--hairline-2` | CSS var + Tailwind | `border-hairline-1`, `border-hairline-2` |
| `shadow-glow` | boxShadow | neon glow na CTA |
| `shadow-inner-hair` | boxShadow | subtelne wewnętrzne obwódki |
| `shadow-card` | boxShadow | obecny shadow-card ma stare rgba bez neonów |
| `bg-sidebar` | color token | sidebar background (tylko przez shadcn) |
| Geist Sans | font | domyślna czcionka (zamiast Plus Jakarta Sans) |
| Geist Mono | font | klasa `.mono` |
| Instrument Serif | font | klasa `.serif-italic` |

### Klasy pomocnicze z index.css wymagane przez spec, których BRAKUJE:

`.chip`, `.chip-ok`, `.chip-warn`, `.chip-bad`, `.chip-acc` — status pills  
`.kbd` — keyboard hint  
`.display` — gradient heading  
`.mono` — Geist Mono  
`.serif-italic` — Instrument Serif italic  
`.grid-bg`, `.grid-bg-sm` — atmosfera (subtle dot/line grid)  
`.glow-accent`, `.glow-ok` — focus glow  
`.skeleton` — loading shimmer  
`.pulse-live` — pulsująca kropka LIVE  
`.card-glow` — karta z radial accent  
`.hair`, `.hair-strong`, `.hair-t`, `.hair-b` — hairline borders  
`.scanner-laser` — jest, ale z `bg-red-500` (hardcoded)

### Wartości CSS wymagające zmiany w index.css:

| Zmienna | Obecna wartość | Wymagana |
|---|---|---|
| `--background` (dark) | `250 15% 9%` (granatowy) | `0 0% 0%` (#000) |
| `--primary` | fioletowy `250 50% 74%` | niebieski→cyjan `~217 91% 60%` |
| `--radius` | `0.75rem` (12px) | `0.5rem` (8px) |
| `font-family` body | Plus Jakarta Sans | Geist Sans |

---

## FAZA 1 — Priorytety wdrożenia

### A) Pliki konfiguracyjne (BLOKERY — bez nich nic nie zadziała poprawnie)

| Plik | Problem | Co zmienić |
|---|---|---|
| `src/index.css` | Brak Geist, brak klas pomocniczych, złe kolory dark | Pełna podmiana wg specyfikacji |
| `tailwind.config.ts` | Brak `shadow-glow`, `shadow-inner-hair`, nowych keyframes | Rozszerzyć extend.boxShadow, extend.animation |
| `src/main.tsx` | Brak `dark` class na `documentElement` | Dodać 1 linię przed `render` |

---

## FAZA 1 — Shell / Layout

### B) `src/components/layout/AppSidebar.tsx`

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| `rounded-2xl` na logo (line 154) | Logo div | → `rounded-lg` |
| Brak workspace switcher na górze | Całość | Dodać sekcję workspace |
| Brak plan card na dole | SidebarFooter | Dodać plan/limit chip |
| `bg-gradient-to-br from-primary to-primary/70` na logo | line 154 | → semantic tokens |
| `kbd` renderowany inline bez klasy `.kbd` | line 115 | → `<span className="kbd">` |
| `hover:translate-x-0.5` — drobny UX detal ok | line 98 | zostawić |

### C) `src/components/layout/Header.tsx` → Topbar

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| Brak breadcrumbs | Całość | Dodać `<AppBreadcrumbs />` |
| Search button bez stylu `.kbd` | line 83 | → `<span className="kbd">⌘K</span>` |
| Brak chip LIVE | Całość | Dodać `.pulse-live` + "LIVE" chip |
| `ThemeToggle` obecny — **usunąć** z topbara | line 71 | Dark jest default, toggle niepotrzebny |
| `LanguageSwitcher` — zostawić | line 69 | ok |

---

## FAZA 2 — Landing + Auth

### D) `src/components/home/HeroSection.tsx`

| Problem | Naprawa |
|---|---|
| Brak `grid-bg` klasy w tle | Dodać `className="grid-bg"` do wrappera |
| Brak aurora glows (radial gradients) | Dodać absolutnie pozycjonowane blury z `bg-primary/20` |
| Heading bez klasy `.display` | Dodać gradient heading |
| Brak Instrument Serif dla frazy hero | Dodać `<em className="serif-italic">` |
| Hardcoded fioletowe gradienty (`from-primary/5`) | → bg-background + grid-bg |

### E) `src/components/home/FeaturesSection.tsx`

| Problem | Naprawa |
|---|---|
| Karty bez `.card-glow` | Dodać klasę |
| Zaokrąglenia `rounded-2xl` | → `rounded-lg` |
| Hardcoded `text-gray-*` możliwe | → `text-muted-foreground` |

### F) `src/pages/Login.tsx`

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| Brak split layout 50/50 | Całość | Przerobić na dwa panele |
| `rounded-2xl` na Card (line 52, 86, 130) | Multiple | → `rounded-lg` |
| `bg-gradient-to-br from-primary to-primary/80` na ikonie (line 52) | Logo | → semantic |
| Brak lewego panela z credential card + cytatem | — | Nowy panel |
| Brak OAuth Google + GitHub widocznego | — | Dodać `<SocialLoginButtons />` prominentnie |

---

## FAZA 3 — Core App

### G) `src/pages/Dashboard.tsx` + `src/components/dashboard/OrganizerDashboard.tsx`

| Problem | Naprawa |
|---|---|
| Brak Sparkline komponentu | Stworzyć `src/components/ui/sparkline.tsx` |
| Brak live activity feed | Dodać do OrganizerDashboard |
| Brak AI suggestion card | Dodać |
| `bg-green-500` w RealTimeDashboard (line 89) | → `bg-success` |
| `rounded-2xl` w EventsTabContent, CheckInActivityChart, ResourceMonitor, SubscriptionCard, TicketTypeStatsCard | → `rounded-lg` |

### H) `src/pages/Events.tsx`

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| `rounded-2xl` w DialogContent (line 169) | → `rounded-lg` |
| `rounded-2xl bg-primary/10` empty state (line 247-248) | → `rounded-lg` + `.skeleton` klasa |
| Brak progress barów w tabeli | Dodać `<Progress />` dla capacity |
| Brak segment tabs i keyboard shortcuts | Dodać |

### I) `src/pages/Guests.tsx`

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| `rounded-2xl` na empty state + card (line 85, 98) | → `rounded-lg` |
| Brak avatarów z gradient | Dodać do tabeli gości |
| Brak RFID column | Dodać kolumnę |
| Brak quick stats strip | Dodać |

### J) `src/pages/EventDetails.tsx`

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| `bg-white p-4 rounded-md` + `bg-gray-200` (line 284-285) | **Hardcoded!** | → `bg-card` / `bg-muted` |
| Brak hero card z aurora | Całość | Przerobić header eventu |
| Brak tabs i timeline | — | Dodać |

---

## FAZA 4 — Scanner + Formularz publiczny

### K) `src/components/scanner/UnifiedQRScanner.tsx`

| Problem | Naprawa |
|---|---|
| `.scanner-laser` z `bg-red-500` (index.css) | → `bg-primary` lub `bg-cyan-400` |
| `.scanner-corners` z `border-white/40` (hardcoded) | → `border-border` |
| Brak corner brackets w nowym stylu | Przerobić |
| Brak last-scan card po prawej | Dodać kolumnę |
| Brak log z live tail | Dodać |

### L) `src/pages/AccreditationRequest.tsx`

| Problem | Naprawa |
|---|---|
| Brak steppers 1-4 | Dodać |
| Brak prawej kolumny z podsumowaniem eventu | Przerobić na 2-kolumnowy layout |
| Możliwe hardcoded kolory | Sprawdzić przy implementacji |

### M) `src/pages/PublicAccreditationPage.tsx` — **TRYB LIGHT**

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| `bg-gray-50` (line 140) | → owinąć w `<div className="light">` |
| `bg-white` na formach (line 218, 224) | → `bg-card` |
| `text-gray-*` wszędzie (lines 159-369) | → `text-foreground` / `text-muted-foreground` |
| `bg-gray-50 rounded-lg` (line 327) | → `bg-muted rounded-lg` |
| Emoji 📍 (line 195) | Usunąć lub zastąpić ikoną |

### N) `src/pages/EmbedRegisterForm.tsx` — **TRYB LIGHT**

| Problem | Naprawa |
|---|---|
| `bg-gray-50` wszędzie (lines 114, 122, 133, 152) | → owinąć w `<div className="light">` + `bg-background` |
| `bg-white` na Card (line 155) | → `bg-card` |
| `text-gray-*` (lines 136, 139, 160, 161, 163, 180-267) | → semantic tokens |

---

## FAZA 5 — Nowe Komponenty

### O) `src/components/common/CommandPalette.tsx`

| Stan | Naprawa |
|---|---|
| Plik istnieje, ale wymaga weryfikacji cmdk i stylu | Przerobić na nowy styl |

### P) `src/components/common/PageSkeleton.tsx`

| Stan | Naprawa |
|---|---|
| Istnieje, wymaga klasy `.skeleton` i nowej struktury | Przerobić |

### Q) `src/components/common/EmptyState.tsx`

| Problem | Lokalizacja | Naprawa |
|---|---|---|
| `rounded-2xl` (line 22) | → `rounded-lg` |
| Brak 3 wariantów (title/description/illustration/actions) | Przerobić komponent |

---

## Komponenty z hardcoded kolorami poza głównym zakresem (niższy priorytet)

Pliki wymagające sweep po głównych fazach:

- `src/components/accreditation/AccreditationStatus.tsx` — `bg-gray-100 text-gray-800`
- `src/components/analytics/MediaAnalyticsDashboard.tsx` — `text-gray-600`
- `src/components/badges/BadgeGenerator.tsx` — `bg-white`, `bg-gray-*`, `text-gray-*`
- `src/components/calendar/CalendarIntegration.tsx` — `bg-gray-100`, `text-gray-*`
- `src/components/checkin/CheckInSystem.tsx` — `text-gray-*`
- `src/components/common/StatusBadge.tsx` — `bg-gray-100 text-gray-800`
- `src/components/common/TrialBanner.tsx` — `rounded-2xl`
- `src/components/communication/MediaCommunicationTool.tsx` — `text-gray-*`
- `src/components/database/DatabaseSchema.tsx` — `bg-slate-50`, `bg-slate-100`
- `src/components/documents/DocumentUploader.tsx` — `text-gray-400`
- `src/components/guests/GuestDetails.tsx`, `GuestForm.tsx`, `GuestsTable.tsx` — różne
- `src/components/home/CTASection.tsx`, `FAQSection.tsx`, `PricingSection.tsx`, `TestimonialsSection.tsx`, `ValuePropositionSection.tsx`
- `src/components/invitations/*` — multiple
- `src/components/notifications/*` — various
- `src/components/press/*` — various
- `src/components/scanner/StatsCards.tsx`, `ScanHistoryList.tsx` — various
- `src/components/security/BiometricVerification.tsx` — `bg-gray-100`, `text-gray-*`
- `src/components/settings/ExportSettings.tsx` — `bg-white`
- `src/pages/Settings.tsx` — `border-red-200 bg-white`
- `src/pages/UserProfile.tsx` — `bg-white`
- `src/pages/InvitationEditor.tsx` — `bg-white`, `text-gray-*`
- `src/pages/AIChatSupport.tsx`, `AIDashboard.tsx` — `rounded-2xl`
- `src/pages/About.tsx` — `rounded-2xl`
- `src/pages/LiveDashboard.tsx` — `text-white/60`, `bg-white/5` (kontekstowe, może być ok)
- `src/pages/AccreditationCategories.tsx` — `bg-slate-600`
- `src/pages/Onboarding.tsx` — `rounded-2xl`
- `src/pages/Orders.tsx`, `OrderDetails.tsx` — various
- `src/pages/RfidScanner.tsx` — various
- `src/pages/WristbandManagement.tsx` — various
- `src/pages/guest-management/GuestsInvitationManager.tsx` — `bg-white`
- `src/pages/products/Products.tsx` — `rounded-2xl`

**Łącznie: ~195 naruszeń w ~60 plikach**

---

## Podsumowanie ilościowe

| Kategoria | Pliki | Naruszenia |
|---|---|---|
| Hardcoded `text-gray-*` / `text-black` | ~35 | ~90 |
| `bg-white` / `bg-gray-*` / `bg-slate-*` | ~25 | ~60 |
| `rounded-2xl` / `rounded-3xl` | ~20 | ~45 |
| Brakujące klasy pomocnicze | — | Do stworzenia |
| Brakujące tokeny w CSS/Tailwind | — | BLOKERY |
| Geist fonts nie załadowane | `index.css` | BLOKER |

---

## Kolejność implementacji (wg specyfikacji)

1. **[BLOKER]** Aktualizacja `src/index.css` — nowe tokeny, kolory, fonty Geist, klasy pomocnicze
2. **[BLOKER]** Aktualizacja `tailwind.config.ts` — `shadow-glow`, `shadow-inner-hair`, nowe animacje
3. `src/main.tsx` — dodać `dark` class
4. `src/components/layout/AppSidebar.tsx` — pełny redesign
5. `src/components/layout/Header.tsx` → Topbar z breadcrumbs + ⌘K + LIVE
6. Fazy 2-5 wg kolejności w specyfikacji
