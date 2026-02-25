import React from "react";
import { Calendar, Users, QrCode, Settings, BarChart3, Zap, Shield, Radio, Map, Monitor, Tablet, FileBarChart, Presentation, Lock } from "lucide-react";
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

const coreNavigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Guests",
    url: "/guests",
    icon: Users,
  },
  {
    title: "Scanner",
    url: "/scanner",
    icon: QrCode,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const comingSoonNavigation = [
  {
    title: "Advanced Guests",
    icon: Shield,
  },
  {
    title: "RFID Scanner",
    icon: Radio,
  },
  {
    title: "Opaski RFID",
    icon: Radio,
  },
  {
    title: "Heatmapa stref",
    icon: Map,
  },
  {
    title: "Kiosk Check-In",
    icon: Tablet,
  },
  {
    title: "Dashboard TV",
    icon: Monitor,
  },
  {
    title: "Enhanced Dashboard",
    icon: Zap,
  },
  {
    title: "Raport po wydarzeniu",
    icon: FileBarChart,
  },
];
const AppSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Press Acreditations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    <span className="ml-auto bg-muted-foreground/20 text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                      SOON
                    </span>
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
