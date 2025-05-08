
import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Calendar, QrCode, Settings, Users, Mail, Bell, Award } from "lucide-react";
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
import { useI18n } from "@/hooks/useI18n";

const AppSidebar = () => {
  const { t } = useI18n();
  
  const menuItems = [
    {
      title: t('navigation.dashboard'),
      description: t('pages.dashboard.title'),
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: t('navigation.events'),
      description: t('pages.events.title'),
      url: "/events",
      icon: Calendar,
    },
    {
      title: t('navigation.guests'),
      description: t('pages.guests.title'),
      url: "/guests",
      icon: Users,
    },
    {
      title: t('pages.notifications.sendNotification'),
      description: t('pages.events.eventDetails'),
      url: "/invitation-editor",
      icon: Mail,
    },
    {
      title: t('navigation.notifications'),
      description: t('pages.notifications.title'),
      url: "/notifications",
      icon: Bell,
    },
    {
      title: t('accreditation.title'),
      description: t('accreditation.description'),
      url: "/accreditation-categories",
      icon: Award,
    },
    {
      title: t('pages.scanner.title'),
      description: t('pages.scanner.scanQrCode'),
      url: "/scanner",
      icon: QrCode,
    },
    {
      title: t('navigation.settings'),
      description: t('pages.settings.title'),
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="border-r bg-blue-500 text-white md:w-72">
      <SidebarHeader className="px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1.5 rounded-md">
            <QrCode className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">
              PressAccreditations
            </span>
            <p className="text-xs text-white/80 mt-0.5">
              {t('accreditation.description')}
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
            <p className="font-medium text-white">{t('pages.settings.title')}</p>
            <p className="text-white/80 mt-1">{t('common.description')}</p>
            <button className="mt-2 text-xs font-medium text-white hover:underline">
              {t('common.help')} →
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
