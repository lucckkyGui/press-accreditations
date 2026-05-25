
import React from "react";
import {
  Calendar, Users, QrCode, Settings, BarChart3, Radio, Map,
  FileBarChart, Sparkles, ChevronRight, Bot, FileText, Ticket,
  Newspaper, LogOut, Brain, Plug, Shield, Paintbrush, Share2,
  Activity, ShoppingBag, FileSearch, Stethoscope, ChevronsUpDown,
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
import { features } from "@/config/features";

interface NavItemDef {
  title: string;
  url: string;
  icon: React.ElementType;
  shortcut?: string;
}

const mainNavigation: NavItemDef[] = [
  { title: "Dashboard",   url: "/dashboard", icon: BarChart3, shortcut: "G D" },
  { title: "Wydarzenia",  url: "/events",    icon: Calendar,  shortcut: "G E" },
  { title: "Goście",      url: "/guests",    icon: Users,     shortcut: "G G" },
  { title: "Skaner QR",   url: "/scanner",   icon: QrCode,    shortcut: "G S" },
  { title: "Diagnostyka", url: "/diagnostics", icon: Stethoscope },
  { title: "Bilety",      url: "/ticketing", icon: Ticket },
];

const operationsNavigation: NavItemDef[] = [
  ...(features.rfid        ? [{ title: "Skaner RFID",  url: "/rfid-scanner", icon: Radio }] : []),
  ...(features.wristbands  ? [{ title: "Opaski RFID",  url: "/wristbands",   icon: Radio }] : []),
  ...(features.rfid        ? [{ title: "Heatmapa stref", url: "/zone-heatmap", icon: Map }] : []),
  { title: "Media / Prasa", url: "/press-releases", icon: Newspaper },
];

const advancedNavigation: NavItemDef[] = [
  { title: "AI Dashboard",      url: "/ai-dashboard",   icon: Brain },
  { title: "Integracje",        url: "/integrations",   icon: Plug },
  { title: "Kreator raportów",  url: "/report-builder", icon: FileSearch },
  ...(features.marketplace ? [{ title: "Marketplace", url: "/marketplace", icon: ShoppingBag }] : []),
];

const reportsNavigation: NavItemDef[] = [
  { title: "Raport końcowy",    url: "/post-event-report", icon: FileBarChart },
  { title: "Raport sponsorski", url: "/sponsor-report",    icon: FileText },
];

const systemNavigation: NavItemDef[] = [
  { title: "AI Support",  url: "/ai-support",        icon: Bot },
  { title: "Monitoring",  url: "/admin/monitoring",  icon: Activity },
  { title: "Audyt & SSO", url: "/audit-trail",       icon: Shield },
  ...(features.whiteLabel ? [{ title: "White-Label", url: "/white-label", icon: Paintbrush }] : []),
  { title: "Affiliate",   url: "/affiliate",         icon: Share2 },
  { title: "Pomoc",       url: "/help",              icon: FileText },
  { title: "Ustawienia",  url: "/settings",          icon: Settings },
];

const allSections = [
  { label: "Główne",        items: mainNavigation },
  { label: "Operacje",      items: operationsNavigation },
  { label: "Zaawansowane",  items: advancedNavigation },
  { label: "Raporty",       items: reportsNavigation },
  { label: "System",        items: systemNavigation },
];

const NavItem = ({
  item,
  active,
  collapsed,
}: {
  item: NavItemDef;
  active: boolean;
  collapsed: boolean;
}) => {
  const inner = (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} className="p-0 h-auto">
        <Link
          to={item.url}
          onMouseEnter={() => {
            const routeMap: Record<string, () => Promise<unknown>> = {
              "/dashboard":  () => import("@/pages/Dashboard"),
              "/events":     () => import("@/pages/Events"),
              "/guests":     () => import("@/pages/Guests"),
              "/scanner":    () => import("@/pages/Scanner"),
              "/diagnostics":() => import("@/pages/Diagnostics"),
              "/settings":   () => import("@/pages/Settings"),
              "/notifications": () => import("@/pages/Notifications"),
            };
            routeMap[item.url]?.();
          }}
          className={[
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-150 group/item",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <item.icon
            className={[
              "h-4 w-4 shrink-0 transition-colors",
              active ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground",
            ].join(" ")}
          />
          {!collapsed && (
            <>
              <span className="text-[13px] font-medium flex-1 truncate leading-none">
                {item.title}
              </span>
              {item.shortcut && !active && (
                <span className="kbd hidden lg:inline-flex opacity-0 group-hover/item:opacity-100 transition-opacity">
                  {item.shortcut}
                </span>
              )}
              {active && (
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
          {item.shortcut && (
            <span className="text-[10px] text-muted-foreground ml-2">{item.shortcut}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
};

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, signOut } = useAuth();

  const orgName = profile?.organizationName || "Moja organizacja";
  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="py-2 px-2 gap-0">

        {/* ── Workspace switcher ─────────────────── */}
        <div className={`px-1 pt-3 pb-2 mb-1 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            className={[
              "flex items-center gap-2.5 w-full rounded-lg px-2 py-2",
              "text-foreground hover:bg-muted transition-colors duration-150 group",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-semibold truncate leading-none">{orgName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">Organizator</p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* ── Navigation sections ────────────────── */}
        <div className="hair-t mx-1 mb-2" />

        {allSections.map((section, idx) => (
          <React.Fragment key={section.label}>
            {idx > 0 && <div className="mx-1 my-1 hair-t" />}
            <SidebarGroup className="py-0">
              {!collapsed && section.label && (
                <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50 px-2.5 h-7 flex items-center">
                  {section.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {section.items.map((item) => (
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
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* ── Plan card + User footer ────────────── */}
      <SidebarFooter className="p-2 gap-2">
        {/* Plan card */}
        {!collapsed && (
          <div className="card-glow rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-foreground">Pro Plan</span>
              </div>
              <span className="chip chip-ok">
                <span className="chip-dot" />
                Aktywny
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>Goście</span>
              <span className="mono">340 / 500</span>
            </div>
            <div className="h-0.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[68%] bg-primary rounded-full" />
            </div>
          </div>
        )}

        {/* Hairline separator */}
        <div className="hair-t mx-0" />

        {/* User row */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center py-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
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
              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate text-foreground leading-none">
                {profile?.firstName || "Użytkownik"}{" "}
                {profile?.lastName || ""}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-none">
                {profile?.email || "v2.0.0"}
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
