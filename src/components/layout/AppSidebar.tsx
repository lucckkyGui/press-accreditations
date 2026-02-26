
import React from "react";
import { Calendar, Users, QrCode, Settings, BarChart3, Shield, Radio, Map, Tablet, Monitor, Zap, FileBarChart, Sparkles } from "lucide-react";
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
      <SidebarContent className="py-2">
        {/* Logo / Brand */}
        <div className="px-4 py-4 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground">Akredytacje</h2>
              <p className="text-[11px] text-muted-foreground">Panel organizatora</p>
            </div>
          </div>
        </div>

        {/* Core navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/70 px-4">
            Menu główne
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreNavigation.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`
                        mx-2 rounded-xl transition-all duration-200
                        ${active
                          ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className="h-[18px] w-[18px]" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Coming soon */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/70 px-4">
            Wkrótce
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    disabled
                    className="mx-2 rounded-xl opacity-40 cursor-not-allowed"
                  >
                    <item.icon className="h-[18px] w-[18px] text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.title}</span>
                    <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 font-semibold">
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
