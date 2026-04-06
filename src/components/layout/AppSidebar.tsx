
import React from "react";
import { Calendar, Users, QrCode, Settings, BarChart3, Radio, Map, FileBarChart, Sparkles, ChevronRight, Bot, FileText, Ticket, Newspaper, LogOut, Brain, Plug, Shield, Paintbrush, Share2, Activity, ShoppingBag, FileSearch } from "lucide-react";
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

interface NavItemDef {
  title: string;
  url: string;
  icon: React.ElementType;
  shortcut?: string;
}

const mainNavigation: NavItemDef[] = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3, shortcut: "⌘K" },
  { title: "Wydarzenia", url: "/events", icon: Calendar, shortcut: "⌘E" },
  { title: "Goście", url: "/guests", icon: Users, shortcut: "⌘G" },
  { title: "Skaner QR", url: "/scanner", icon: QrCode, shortcut: "⌘S" },
  { title: "Bilety", url: "/ticketing", icon: Ticket },
];

const operationsNavigation: NavItemDef[] = [
  { title: "Skaner RFID", url: "/rfid-scanner", icon: Radio },
  { title: "Opaski RFID", url: "/wristbands", icon: Radio },
  { title: "Heatmapa stref", url: "/zone-heatmap", icon: Map },
  { title: "Media / Prasa", url: "/press-releases", icon: Newspaper },
];

const advancedNavigation: NavItemDef[] = [
  { title: "AI Dashboard", url: "/ai-dashboard", icon: Brain },
  { title: "Integracje", url: "/integrations", icon: Plug },
  { title: "Kreator raportów", url: "/report-builder", icon: FileSearch },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
];

const reportsNavigation: NavItemDef[] = [
  { title: "Raport końcowy", url: "/post-event-report", icon: FileBarChart },
  { title: "Raport sponsorski", url: "/sponsor-report", icon: FileText },
];

const systemNavigation: NavItemDef[] = [
  { title: "AI Support", url: "/ai-support", icon: Bot },
  { title: "Monitoring", url: "/admin/monitoring", icon: Activity },
  { title: "Audyt & SSO", url: "/audit-trail", icon: Shield },
  { title: "White-Label", url: "/white-label", icon: Paintbrush },
  { title: "Affiliate", url: "/affiliate", icon: Share2 },
  { title: "Pomoc", url: "/help", icon: FileText },
  { title: "Ustawienia", url: "/settings", icon: Settings },
];

const allSections = [
  { label: "Główne", items: mainNavigation },
  { label: "Operacje", items: operationsNavigation },
  { label: "Zaawansowane", items: advancedNavigation },
  { label: "Raporty", items: reportsNavigation },
  { label: "System", items: systemNavigation },
];

const NavItem = ({ item, active, collapsed }: { item: NavItemDef; active: boolean; collapsed: boolean }) => {
  const content = (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} className="p-0 h-auto">
        <Link
          to={item.url}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item
            ${active
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-0.5'
            }
          `}
        >
          <div className={`
            flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 shrink-0
            ${active
              ? 'bg-primary-foreground/15'
              : 'bg-muted/60 group-hover/item:bg-primary/10 group-hover/item:text-primary group-hover/item:scale-110'
            }
          `}>
            <item.icon className="h-[16px] w-[16px]" />
          </div>
          {!collapsed && (
            <>
              <span className="font-semibold text-[13px] flex-1 truncate">{item.title}</span>
              {item.shortcut && !active && (
                <kbd className="hidden lg:inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity">
                  {item.shortcut}
                </kbd>
              )}
              {active && <ChevronRight className="h-4 w-4 opacity-60" />}
            </>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <p>{item.title}</p>
          {item.shortcut && <span className="text-[10px] text-muted-foreground ml-2">{item.shortcut}</span>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="py-3 px-2">
        {/* Logo / Brand */}
        <div className={`px-3 py-5 mb-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-foreground">Akredytacje</h2>
                <p className="text-[11px] text-muted-foreground font-medium">Panel organizatora</p>
              </div>
            )}
          </div>
        </div>

        {allSections.map((section, idx) => (
          <React.Fragment key={section.label}>
            {idx > 0 && <div className="mx-4 my-2 h-px bg-border/40" />}
            <SidebarGroup>
              {!collapsed && (
                <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50 px-3 mb-1">
                  {section.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
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

      {/* User footer */}
      <SidebarFooter className="border-t p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">{profile?.firstName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{profile?.firstName} {profile?.lastName}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile?.avatarUrl || undefined} />
              <AvatarFallback className="text-xs">{profile?.firstName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">
                {profile?.firstName || 'Użytkownik'} {profile?.lastName || ''}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">v2.0.0</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Wyloguj"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
