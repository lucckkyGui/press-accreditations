
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="min-h-screen flex w-full bg-gray-100 dark:bg-slate-900">
          <Toaster />
          <Sonner />
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              <div className="max-w-7xl mx-auto w-full animate-fade-in">
                {children}
              </div>
            </main>
            <footer className="py-3 px-6 text-center text-sm text-muted-foreground border-t">
              <p>&copy; {new Date().getFullYear()} Press Acreditations. Wszystkie prawa zastrzeżone.</p>
            </footer>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
};

export default MainLayout;
