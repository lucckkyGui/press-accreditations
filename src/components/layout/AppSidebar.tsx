
import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Calendar, QrCode, Settings, Users, Mail, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    description: "Przegląd ogólny",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Wydarzenia",
    description: "Zarządzaj wydarzeniami",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Goście",
    description: "Lista gości i akredytacje",
    url: "/guests",
    icon: Users,
  },
  {
    title: "Zaproszenia",
    description: "Projektuj zaproszenia",
    url: "/invitation-editor",
    icon: Mail,
  },
  {
    title: "Powiadomienia",
    description: "Zarządzaj powiadomieniami",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Skaner QR",
    description: "Skanuj kody QR",
    url: "/scanner",
    icon: QrCode,
  },
  {
    title: "Ustawienia",
    description: "Konfiguracja systemu",
    url: "/settings",
    icon: Settings,
  },
];

const AppSidebar = () => {
  return (
    <Sidebar className="border-r bg-blue-500 text-white md:w-72">
      <SidebarHeader className="px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1.5 rounded-md">
            <QrCode className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">
              Press Acreditations
            </span>
            <p className="text-xs text-white/80 mt-0.5">
              System akredytacji prasowych
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      isActive 
                        ? "text-white font-medium bg-white/20 border-l-2 border-white" 
                        : "hover:bg-white/10 text-white/90 transition-colors"
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span>{item.title}</span>
                      <span className="text-xs text-white/60">{item.description}</span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <div className="rounded-lg bg-white/10 p-4 text-sm">
            <p className="font-medium text-white">Wsparcie techniczne</p>
            <p className="text-white/80 mt-1">Potrzebujesz pomocy? Skontaktuj się z naszym zespołem.</p>
            <button className="mt-2 text-xs font-medium text-white hover:underline">
              Uzyskaj pomoc →
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
