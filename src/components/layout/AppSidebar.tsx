/**
 * AppSidebar.tsx — slim wersja zgodna z mockupem.
 *
 * Zmiany vs. poprzednia:
 *  - 2 grupy zamiast 5 (Główne + Pozostałe) — reszta dostępna przez ⌘K
 *  - liczniki obok itemów (Wydarzenia · 14, Goście · 1 247) — pobierane z hooków lub mockowane
 *  - LIVE chip na Skanerze QR kiedy event aktywny
 *  - shortcuts widoczne zawsze (a nie tylko na hover)
 *  - workspace switcher + plan card + user footer — bez zmian
 */

import React from "react";
import {
  Sparkles,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Zap,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { coreNav, supportingNav, systemNav, type NavItem as NavItemDef } from "@/config/navigation";

// ─── Counts hook ──────────────────────────────────────────────
/**
 * Lekki hook: zlicza obiekty z tabel Supabase dla bieżącego usera.
 * Cache na 60s — wystarcza dla badge w sidebarze.
 * Jeśli zapytania nie istnieją w danym środowisku — zwraca undefined (badge się nie pokaże).
 */
function useSidebarCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ["sidebarCounts", userId],
    enabled: !!userId,
    staleTime: 60 * 1000,
    queryFn: async () => {
      if (!userId) return null;
      const [eventsRes, guestsRes, accRes] = await Promise.all([
        supabase.from("events").select("id, start_date, end_date", { count: "exact", head: false }).eq("organizer_id", userId),
        supabase.from("guests").select("id", { count: "exact", head: true }),
        // Single source of truth: pending media submissions (landing_page_submissions).
        // Not in generated types yet → cast. RLS scopes to the organizer's events.
        (supabase as any).from("landing_page_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const now = Date.now();
      const events = (eventsRes.data ?? []) as { id: string; start_date: string; end_date: string }[];
      const liveEvent = events.find((e) => {
        const s = new Date(e.start_date).getTime();
        const en = new Date(e.end_date).getTime();
        return s <= now && now <= en;
      });
      return {
        events: events.length,
        guests: guestsRes.count ?? 0,
        accreditations: accRes.count ?? 0,
        isLive: !!liveEvent,
      };
    },
  });
}

// ─── Nav definitions ──────────────────────────────────────────
// Source of truth: src/config/navigation.ts (core / supporting / system).
// Frozen & hidden-from-sales modules are intentionally NOT rendered here.
const mainNav = coreNav;

// ─── NavItem ──────────────────────────────────────────────────
const NavItem = ({
  item,
  active,
  collapsed,
  count,
  isLive,
}: {
  item: NavItemDef;
  active: boolean;
  collapsed: boolean;
  count?: number;
  isLive?: boolean;
}) => {
  const inner = (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} className="p-0 h-auto">
        <Link
          to={item.url}
          className={[
            "relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors duration-150 group/item",
            active
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          ].join(" ")}
        >
          {/* Active rail */}
          {active && (
            <span
              aria-hidden
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary shadow-glow"
            />
          )}
          <item.icon
            className={[
              "h-4 w-4 shrink-0 transition-colors",
              active ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground",
            ].join(" ")}
          />
          {!collapsed && (
            <>
              <span className="text-[13px] font-medium flex-1 truncate leading-none">{item.title}</span>

              {/* Right-side meta: LIVE chip > count > shortcut */}
              {item.liveWhenActive && isLive ? (
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success pulse-live" />
                  <span className="mono text-[10px] text-success">LIVE</span>
                </span>
              ) : typeof count === "number" && count > 0 ? (
                <span className="mono text-[10.5px] text-muted-foreground/70 tabular-nums">
                  {count.toLocaleString("pl-PL")}
                </span>
              ) : item.shortcut ? (
                <span className="kbd hidden xl:inline-flex">{item.shortcut}</span>
              ) : null}

              {active && !item.liveWhenActive && !count && (
                <ChevronRight className="h-3.5 w-3.5 text-primary opacity-50" />
              )}
            </>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <p>{item.title}</p>
          {item.shortcut && <span className="text-[10px] text-muted-foreground ml-2">{item.shortcut}</span>}
        </TooltipContent>
      </Tooltip>
    );
  }
  return inner;
};

// ─── Sidebar ──────────────────────────────────────────────────
const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, signOut, user, roles, isAdmin } = useAuth();
  const { data: counts } = useSidebarCounts(user?.id);

  // Secondary nav = supporting + system modules. adminOnly items hidden for non-admins.
  const secondaryNav = [...supportingNav, ...systemNav].filter(
    (item) => !item.adminOnly || isAdmin
  );

  const orgName = profile?.organizationName || "Moja organizacja";
  const initials =
    [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  const planUsedPct = 68; // można podłączyć useSubscription.usage

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="py-2 px-2 gap-0">
        {/* ── Workspace switcher ─────────────────── */}
        <div className={`px-1 pt-3 pb-2 mb-1 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            className={[
              "flex items-center gap-2.5 w-full rounded-md px-2 py-2 group",
              "text-foreground hover:bg-muted transition-colors duration-150",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <div className="h-6 w-6 rounded-md bg-gradient-accent flex items-center justify-center shrink-0 shadow-glow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-semibold truncate leading-none">{orgName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-none mono">workspace · pro</p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* ── Search hint (collapsed-friendly) ────── */}
        {!collapsed && (
          <button
            onClick={() =>
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
            }
            className="mx-1 mb-3 flex items-center gap-2 h-8 px-2 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm3.5-1.5L14 14" />
            </svg>
            <span className="text-[12px] flex-1 text-left">Szukaj lub przejdź…</span>
            <span className="kbd">⌘K</span>
          </button>
        )}

        {/* ── Main nav ────────────────────────────── */}
        <SidebarGroup className="py-0">
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50 px-2.5 h-7 flex items-center">
              Główne
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainNav.map((item) => (
                <NavItem
                  key={item.url}
                  item={item}
                  active={location.pathname === item.url || location.pathname.startsWith(item.url + "/")}
                  collapsed={collapsed}
                  count={item.countQueryKey ? counts?.[item.countQueryKey] : undefined}
                  isLive={item.liveWhenActive ? counts?.isLive : false}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Hairline ───────────────────────────── */}
        <div className="mx-1 my-2 hair-t" />

        {/* ── Secondary nav ──────────────────────── */}
        <SidebarGroup className="py-0">
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50 px-2.5 h-7 flex items-center">
              Pozostałe
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {secondaryNav.map((item) => (
                <NavItem
                  key={item.url}
                  item={item}
                  active={location.pathname === item.url}
                  collapsed={collapsed}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: plan card + user ───────────── */}
      <SidebarFooter className="p-2 gap-2">
        {!collapsed && (
          <div className="card-glow rounded-md p-3 relative">
            <div className="flex items-center justify-between mb-2 relative">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-foreground">Plan Pro</span>
              </div>
              <span className="chip chip-acc">
                <span className="chip-dot" />
                aktywny
              </span>
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-muted-foreground mb-1.5 relative mono">
              <span>Wydarzenia</span>
              <span>{Math.round(planUsedPct / 2)} / 50</span>
            </div>
            <div className="h-0.5 rounded-full bg-muted overflow-hidden relative">
              <div className="h-full bg-primary rounded-full" style={{ width: `${planUsedPct}%` }} />
            </div>
            <Link
              to="/settings"
              className="block mt-2 text-[11px] text-foreground/80 hover:text-foreground underline underline-offset-2 decoration-border relative"
            >
              Przejdź na Enterprise →
            </Link>
          </div>
        )}

        <div className="hair-t mx-0" />

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center py-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{initials}</AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{profile?.firstName} {profile?.lastName}</p>
              <p className="text-[10px] text-muted-foreground">{profile?.email}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={profile?.avatarUrl || undefined} />
              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate text-foreground leading-none">
                {profile?.firstName || "Użytkownik"} {profile?.lastName || ""}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-none mono">
                {roles[0] || "organizator"}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              aria-label="Wyloguj"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
