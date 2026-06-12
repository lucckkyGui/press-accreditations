/**
 * CommandPalette.tsx — rozbudowana wersja zgodna z mockupem.
 *
 * Zmiany vs. poprzednia:
 *  - filter tabs (Wszystko / Wydarzenia / Goście / Akcje / Pomoc)
 *  - grupy wyników: Skocz do · Akcje · Pomoc
 *  - footer z keyboard hints (↑↓ nawigacja · ↵ wybierz · ⌘↵ w nowej karcie)
 *  - AI search indicator (pulsująca kropka akcentowa)
 *
 * Trigger: ⌘K / Ctrl+K (bez zmian)
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CalendarDays,
  FileText,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Newspaper,
  Plus,
  QrCode,
  Settings,
  Stethoscope,
  Upload,
  User,
  Users,
} from "lucide-react";

type ItemKind = "navigation" | "action" | "help";

interface PaletteItem {
  id: string;
  label: string;
  path?: string;
  onSelect?: () => void;
  description?: string;
  icon: React.ElementType;
  keywords?: string;
  kind: ItemKind;
  shortcut?: string;
}

const TABS: { id: "all" | "nav" | "action" | "help"; label: string }[] = [
  { id: "all", label: "Wszystko" },
  { id: "nav", label: "Skocz do" },
  { id: "action", label: "Akcje" },
  { id: "help", label: "Pomoc" },
];

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("all");
  const navigate = useNavigate();

  // ── Build items ────────────────────────────────────────────
  const items = useMemo<PaletteItem[]>(() => {
    const nav: PaletteItem[] = [
      { id: "n-dashboard",  label: "Pulpit",            path: "/dashboard",        icon: LayoutDashboard, keywords: "panel home dashboard", kind: "navigation", shortcut: "G D" },
      { id: "n-events",     label: "Wydarzenia",        path: "/events",           icon: CalendarDays,    keywords: "events kalendarz",     kind: "navigation", shortcut: "G E" },
      { id: "n-submissions", label: "Zgłoszenia mediów", path: "/guests",          icon: Users,           keywords: "media submissions zgłoszenia goście press", kind: "navigation", shortcut: "G M" },
      { id: "n-accreditations", label: "Akredytacje",   path: "/guests?filter=pending", icon: Newspaper,  keywords: "accreditation requests weryfikacja approval", kind: "navigation", shortcut: "G A" },
      { id: "n-scanner",    label: "Check-in QR",        path: "/scanner",          icon: QrCode,          keywords: "scanner check-in",     kind: "navigation", shortcut: "G S" },
      { id: "n-coverage",   label: "Coverage & raporty", path: "/post-event-report", icon: BarChart3,      keywords: "coverage reports raporty wartość medialna", kind: "navigation" },
      { id: "n-diag",       label: "Diagnostyka",       path: "/diagnostics",      icon: Stethoscope,     keywords: "offline sync manifest", kind: "navigation" },
      { id: "n-settings",   label: "Ustawienia",        path: "/settings",         icon: Settings,        keywords: "settings konfiguracja", kind: "navigation" },
      { id: "n-profile",    label: "Profil",            path: "/profile",          icon: User,            keywords: "profile konto",        kind: "navigation" },
    ];

    const action: PaletteItem[] = [
      { id: "a-new-event",  label: "Nowe wydarzenie",        path: "/events?new=1",  icon: Plus,    kind: "action", shortcut: "N" },
      { id: "a-import",     label: "Importuj zgłoszenia z CSV", path: "/guests?import=1", icon: Upload, kind: "action", shortcut: "I" },
      { id: "a-scanner",    label: "Otwórz skaner check-in",  path: "/scanner",       icon: QrCode,  kind: "action", shortcut: "S" },
      { id: "a-report",     label: "Nowy raport końcowy",     path: "/post-event-report", icon: BarChart3, kind: "action" },
    ];

    const help: PaletteItem[] = [
      { id: "h-help",   label: "Centrum pomocy",          path: "/help",          icon: HelpCircle, kind: "help" },
      { id: "h-press",  label: "Komunikaty prasowe",      path: "/press-releases", icon: FileText,  kind: "help" },
    ];

    return [...nav, ...action, ...help];
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    const map: Record<string, ItemKind> = { nav: "navigation", action: "action", help: "help" };
    return items.filter((it) => it.kind === map[tab]);
  }, [items, tab]);

  // ── Open with ⌘K / Ctrl+K ──────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      setOpen(false);
      if (item.onSelect) {
        item.onSelect();
      } else if (item.path) {
        navigate(item.path);
      }
    },
    [navigate],
  );

  const grouped: Record<ItemKind, PaletteItem[]> = useMemo(
    () => ({
      navigation: filtered.filter((i) => i.kind === "navigation"),
      action:     filtered.filter((i) => i.kind === "action"),
      help:       filtered.filter((i) => i.kind === "help"),
    }),
    [filtered],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      // CommandDialog z shadcn-ui już renderuje overlay i scale-in animację
    >
      {/* Gradient halo accent on top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

      <CommandInput placeholder="Szukaj stron, akcji, pomocy…" className="h-12 text-[15px]" />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1">
        {TABS.map((t) => {
          const active = t.id === tab;
          const count = t.id === "all" ? items.length :
                        t.id === "nav" ? items.filter(i => i.kind === "navigation").length :
                        t.id === "action" ? items.filter(i => i.kind === "action").length :
                        items.filter(i => i.kind === "help").length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
              <span className="mono text-[10.5px] text-muted-foreground/70">{count}</span>
            </button>
          );
        })}
      </div>

      <CommandList className="max-h-[480px]">
        <CommandEmpty>
          <div className="py-10 text-center">
            <div className="text-sm text-foreground font-medium">Brak wyników</div>
            <div className="text-[12px] text-muted-foreground mt-1">
              Sprawdź pisownię albo zmień filtr.
            </div>
          </div>
        </CommandEmpty>

        {grouped.navigation.length > 0 && (
          <CommandGroup heading="Skocz do">
            {grouped.navigation.map((it) => (
              <PaletteRow key={it.id} item={it} onSelect={handleSelect} />
            ))}
          </CommandGroup>
        )}

        {grouped.action.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Akcje">
              {grouped.action.map((it) => (
                <PaletteRow key={it.id} item={it} onSelect={handleSelect} />
              ))}
            </CommandGroup>
          </>
        )}

        {grouped.help.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pomoc">
              {grouped.help.map((it) => (
                <PaletteRow key={it.id} item={it} onSelect={handleSelect} />
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-background px-4 py-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span>
            <span className="ml-0.5">nawigacja</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">↵</span>
            <span>wybierz</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="kbd">⌘</span>
            <span className="kbd">↵</span>
            <span>w nowej karcie</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 mono">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow-soft" />
          AI Search · indeks świeży
        </span>
      </div>
    </CommandDialog>
  );
};

// ─── Row ──────────────────────────────────────────────────────
function PaletteRow({
  item,
  onSelect,
}: {
  item: PaletteItem;
  onSelect: (it: PaletteItem) => void;
}) {
  const Icon = item.icon;
  return (
    <CommandItem
      value={`${item.label} ${item.keywords ?? ""}`}
      onSelect={() => onSelect(item)}
      className="group/row gap-3 py-2.5"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground group-aria-selected/row:bg-primary/10 group-aria-selected/row:text-primary group-aria-selected/row:border-primary/30">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium text-foreground">{item.label}</div>
        {item.description && (
          <div className="truncate text-[11.5px] text-muted-foreground">{item.description}</div>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {item.shortcut?.split(" ").map((k, i) => (
          <span key={i} className="kbd">{k}</span>
        ))}
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-aria-selected/row:opacity-100 group-aria-selected/row:text-primary" />
      </div>
    </CommandItem>
  );
}

export default CommandPalette;
