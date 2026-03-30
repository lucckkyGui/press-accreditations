
import React from "react";
import { Calendar, Users, QrCode, Settings, BarChart3, Shield, Radio, Map, Tablet, Monitor, Zap, FileBarChart, Sparkles, ChevronRight, Code, Clock, Bot, FileText } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const coreNavigation = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Wydarzenia", url: "/events", icon: Calendar },
  { title: "Goście", url: "/guests", icon: Users },
  { title: "Skaner QR", url: "/scanner", icon: QrCode },
  { title: "Widget embed", url: "/embed-widget", icon: Code },
  { title: "Waitlista", url: "/waitlist", icon: Clock },
  { title: "AI Support", url: "/ai-support", icon: Bot },
  { title: "Raport sponsorski", url: "/sponsor-report", icon: FileText },
  { title: "Ustawienia", url: "/settings", icon: Settings },
];

const comingSoonNavigation = [
  { title: "Zaawansowani goście", icon: Shield },
  { title: "Skaner RFID", icon: Radio },
  { title: "Opaski RFID", icon: Radio },
  { title: "Heatmapa stref", icon: Map },
  { title: "Kiosk Check-In", icon: Tablet },
  { title: "Dashboard TV", icon: Monitor },
  { title: "Dashboard+", icon: Zap },
  { title: "Raport końcowy", icon: FileBarChart },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent className="py-3 px-2">
        {/* Logo / Brand */}
        <div className="px-3 py-5 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-foreground">Akredytacje</h2>
              <p className="text-[11px] text-muted-foreground font-medium">Panel organizatora</p>
            </div>
          </div>
        </div>

        {/* Core navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50 px-3 mb-1">
            Menu główne
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {coreNavigation.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="p-0 h-auto"
                    >
                      <Link
                        to={item.url}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item
                          ${active
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        <div className={`
                          flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200
                          ${active
                            ? 'bg-primary-foreground/15'
                            : 'bg-muted/60 group-hover/item:bg-primary/10 group-hover/item:text-primary'
                          }
                        `}>
                          <item.icon className="h-[16px] w-[16px]" />
                        </div>
                        <span className="font-semibold text-[13px] flex-1">{item.title}</span>
                        {active && (
                          <ChevronRight className="h-4 w-4 opacity-60" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="mx-4 my-3 h-px bg-border/60" />

        {/* Coming soon */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50 px-3 mb-1">
            Wkrótce
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {comingSoonNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    disabled
                    className="px-3 py-2 rounded-xl opacity-35 cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted/40">
                      <item.icon className="h-[14px] w-[14px] text-muted-foreground" />
                    </div>
                    <span className="text-[12px] text-muted-foreground font-medium">{item.title}</span>
                    <Badge variant="secondary" className="ml-auto text-[8px] px-1.5 py-0 h-[18px] rounded-md bg-primary/8 text-primary/60 border-0 font-bold tracking-wider">
                      SOON
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
