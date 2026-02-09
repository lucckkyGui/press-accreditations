import React from "react";
import { Calendar, Users, QrCode, Settings, BarChart3, Zap, Shield, Radio } from "lucide-react";
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

const navigation = [
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
    title: "Advanced Guests",
    url: "/advanced-guests",
    icon: Shield,
    isNew: true
  },
  {
    title: "Scanner",
    url: "/scanner",
    icon: QrCode,
  },
  {
    title: "RFID Scanner",
    url: "/rfid-scanner",
    icon: Radio,
    isNew: true
  },
  {
    title: "Opaski RFID",
    url: "/wristbands",
    icon: Radio,
    isNew: true
  },
  {
    title: "Enhanced Dashboard",
    url: "/enhanced-dashboard",
    icon: Zap,
    isNew: true
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
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
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.isNew && (
                        <span className="ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </Link>
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
