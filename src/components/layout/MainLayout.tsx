
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
          <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
            <p>&copy; {new Date().getFullYear()} Press Acreditations. Wszystkie prawa zastrzeżone.</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
