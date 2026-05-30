/**
 * navigation.ts — centralny config nawigacji PressOps by OSURMO.
 *
 * Moduły klasyfikowane są jako:
 *   core              — część głównego workflow sprzedażowego, widoczne w nav
 *   supporting        — wspierają core, widoczne w nawigacji dodatkowej
 *   frozen            — kod w repo, niedostępne przez nav (direct URL nadal działa)
 *   hidden-from-sales — istnieją technicznie, ale nie należą do demo/pilota
 */

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Brain,
  Calendar,
  FileBarChart,
  FileText,
  Globe,
  Plug,
  QrCode,
  Settings,
  Shield,
  Stethoscope,
  Users,
  Newspaper,
} from "lucide-react";

// ── Module scope types ──────────────────────────────────────────────────────

export type ModuleScope = "core" | "supporting" | "frozen" | "hidden-from-sales";

export interface NavItem {
  id: string;
  title: string;
  /** PressOps canonical label (EN) used in docs/tooltips */
  pressopsLabel: string;
  url: string;
  icon: LucideIcon;
  scope: ModuleScope;
  shortcut?: string;
  /** Show count badge from sidebarCounts query key */
  countQueryKey?: "events" | "guests" | "accreditations";
  /** Show LIVE chip when event is active */
  liveWhenActive?: boolean;
  /** Only show to admin role */
  adminOnly?: boolean;
}

// ── Core workflow nav ──────────────────────────────────────────────────────
// Matches: event → submissions → verification → approval → QR pass → check-in → coverage → report

export const coreNav: NavItem[] = [
  {
    id: "dashboard",
    title: "Pulpit",
    pressopsLabel: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    scope: "core",
    shortcut: "G D",
  },
  {
    id: "events",
    title: "Wydarzenia",
    pressopsLabel: "Events",
    url: "/events",
    icon: Calendar,
    scope: "core",
    shortcut: "G E",
    countQueryKey: "events",
  },
  {
    id: "submissions",
    title: "Zgłoszenia mediów",
    pressopsLabel: "Media Submissions",
    url: "/guests",
    icon: Users,
    scope: "core",
    shortcut: "G M",
    countQueryKey: "guests",
  },
  {
    id: "accreditations",
    title: "Akredytacje",
    pressopsLabel: "Accreditation Requests",
    url: "/guests?filter=pending",
    icon: Newspaper,
    scope: "core",
    shortcut: "G A",
    countQueryKey: "accreditations",
  },
  {
    id: "scanner",
    title: "Check-in QR",
    pressopsLabel: "QR Check-in",
    url: "/scanner",
    icon: QrCode,
    scope: "core",
    shortcut: "G S",
    liveWhenActive: true,
  },
];

// ── Supporting nav ─────────────────────────────────────────────────────────

export const supportingNav: NavItem[] = [
  {
    id: "media-crm",
    title: "Media CRM",
    pressopsLabel: "Media CRM",
    url: "/media-portal",
    icon: Globe,
    scope: "supporting",
  },
  {
    id: "coverage",
    title: "Coverage & Raporty",
    pressopsLabel: "Coverage & Reports",
    url: "/post-event-report",
    icon: FileBarChart,
    scope: "supporting",
  },
  {
    id: "press-releases",
    title: "Komunikaty prasowe",
    pressopsLabel: "Press Releases",
    url: "/press-releases",
    icon: FileText,
    scope: "supporting",
  },
];

// ── System nav ─────────────────────────────────────────────────────────────

export const systemNav: NavItem[] = [
  {
    id: "integrations",
    title: "Integracje",
    pressopsLabel: "Integrations",
    url: "/integrations",
    icon: Plug,
    scope: "supporting",
  },
  {
    id: "audit-trail",
    title: "Bezpieczeństwo",
    pressopsLabel: "Security & Audit",
    url: "/audit-trail",
    icon: Shield,
    scope: "supporting",
    adminOnly: true,
  },
  {
    id: "diagnostics",
    title: "Diagnostyka",
    pressopsLabel: "Diagnostics",
    url: "/diagnostics",
    icon: Stethoscope,
    scope: "supporting",
  },
  {
    id: "settings",
    title: "Ustawienia",
    pressopsLabel: "Settings",
    url: "/settings",
    icon: Settings,
    scope: "supporting",
  },
];

// ── Frozen / hidden-from-sales modules ────────────────────────────────────
// Code remains in repo. Not visible in nav. Direct URL still works.

export const frozenModules: Array<{
  id: string;
  pressopsLabel: string;
  url: string;
  scope: ModuleScope;
  reason: string;
}> = [
  {
    id: "ticketing",
    pressopsLabel: "Ticketing",
    url: "/ticketing",
    scope: "frozen",
    reason: "Out of PressOps core scope — generic event ticketing, not press accreditation",
  },
  {
    id: "rfid-scanner",
    pressopsLabel: "RFID Scanner",
    url: "/rfid-scanner",
    scope: "frozen",
    reason: "Hardware dependency, not part of 8-week pilot",
  },
  {
    id: "wristbands",
    pressopsLabel: "Wristband Management",
    url: "/wristbands",
    scope: "frozen",
    reason: "Hardware dependency, not part of 8-week pilot",
  },
  {
    id: "marketplace",
    pressopsLabel: "Event Marketplace",
    url: "/marketplace",
    scope: "frozen",
    reason: "E-commerce / discovery layer — post-pilot roadmap",
  },
  {
    id: "cart",
    pressopsLabel: "Cart & Checkout",
    url: "/cart",
    scope: "frozen",
    reason: "E-commerce not in PressOps core scope",
  },
  {
    id: "ai-dashboard",
    pressopsLabel: "AI Dashboard",
    url: "/ai-dashboard",
    scope: "hidden-from-sales",
    reason: "Full AI dashboard is post-pilot; basic analytics stay in Reports",
  },
  {
    id: "digital-pass",
    pressopsLabel: "Digital Pass (Apple/Google Wallet)",
    url: "/digital-pass",
    scope: "hidden-from-sales",
    reason: "Not productionised yet — wallet integration is post-MVP",
  },
  {
    id: "white-label",
    pressopsLabel: "White Label",
    url: "/white-label",
    scope: "hidden-from-sales",
    reason: "Enterprise tier feature, not part of initial pilot",
  },
  {
    id: "report-builder",
    pressopsLabel: "Report Builder",
    url: "/report-builder",
    scope: "hidden-from-sales",
    reason: "Advanced builder — Coverage & Reports page covers MVP needs",
  },
  {
    id: "face-recognition",
    pressopsLabel: "Face Recognition",
    url: "/biometric-verification",
    scope: "frozen",
    reason: "GDPR complexity + hardware dependency — post-pilot",
  },
];

// ── All nav groups (for CommandPalette, sitemap, etc.) ────────────────────

export const allVisibleNav: NavItem[] = [
  ...coreNav,
  ...supportingNav,
  ...systemNav,
];

// ── Route breadcrumb labels (PressOps terminology) ─────────────────────────

export const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  events: "Events",
  guests: "Media Submissions",
  scanner: "QR Check-in",
  "media-portal": "Media CRM",
  "post-event-report": "Coverage & Reports",
  "press-releases": "Press Releases",
  "sponsor-report": "Sponsor Report",
  integrations: "Integracje",
  "audit-trail": "Security & Audit",
  diagnostics: "Diagnostyka",
  settings: "Ustawienia",
  profile: "Profil",
  notifications: "Powiadomienia",
  "ai-support": "AI Support",
  help: "Pomoc",
  orders: "Zamówienia",
  purchase: "Zakup",
  account: "Konto",
  "invitation-editor": "Edytor akredytacji",
  "embed-widget": "Widget embed",
  waitlist: "Lista oczekujących",
  // frozen — still accessible via direct URL
  ticketing: "Bilety",
  "rfid-scanner": "Skaner RFID",
  wristbands: "Opaski RFID",
  "ai-dashboard": "AI Dashboard",
  "digital-pass": "Digital Pass",
  "white-label": "White Label",
  "report-builder": "Report Builder",
};
