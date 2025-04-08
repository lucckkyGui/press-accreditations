
import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Calendar, QrCode, Settings, Users, Mail, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    description: "Przegląd ogólny",
  },
  {
    title: "Wydarzenia",
    url: "/events",
    icon: Calendar,
    description: "Zarządzaj wydarzeniami",
  },
  {
    title: "Goście",
    url: "/guests",
    icon: Users,
    description: "Lista gości i akredytacje",
  },
  {
    title: "Zaproszenia",
    url: "/invitation-editor",
    icon: Mail,
    description: "Projektuj zaproszenia",
  },
  {
    title: "Powiadomienia",
    url: "/notifications",
    icon: Bell,
    description: "Zarządzaj powiadomieniami",
  },
  {
    title: "Skaner QR",
    url: "/scanner",
    icon: QrCode,
    description: "Skanuj kody QR",
  },
  {
    title: "Ustawienia",
    url: "/settings",
    icon: Settings,
    description: "Konfiguracja systemu",
  },
];

const AppSidebar = () => {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-6 py-5 border-b">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-1.5 rounded-md">
            <QrCode className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">
              Press Acreditations
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              System akredytacji prasowych
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive 
                          ? "text-primary font-medium bg-primary/10 border-l-2 border-primary" 
                          : "hover:bg-muted/50 transition-colors"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <div className="rounded-lg bg-primary/10 p-4 text-sm">
            <p className="font-medium text-primary">Wsparcie techniczne</p>
            <p className="text-muted-foreground mt-1">Potrzebujesz pomocy? Skontaktuj się z naszym zespołem.</p>
            <button className="mt-2 text-xs font-medium text-primary hover:underline">
              Uzyskaj pomoc →
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
