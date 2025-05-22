
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { useWindowSize } from "@/hooks/useWindowSize";

const MainLayout: React.FC = () => {
  const { isMobile } = useWindowSize();

  return (
    <div className="min-h-screen flex w-full bg-gray-100 dark:bg-slate-900">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto w-full animate-fade-in">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
