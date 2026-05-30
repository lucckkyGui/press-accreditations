
import React, { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Header from "./Header";
import Footer from "./Footer";
import MobileTabBar from "./MobileTabBar";
import { Outlet } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import PageTransition from "@/components/common/PageTransition";
import SkipToContent from "@/components/common/SkipToContent";

const MainLayout: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <SkipToContent />
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-6 overflow-auto" role="main">
            <div className="max-w-7xl mx-auto w-full animate-fade-in">
              <Suspense fallback={
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              }>
                <PageTransition>
                  <Outlet />
                </PageTransition>
              </Suspense>
            </div>
          </main>
          <Footer />
        </div>
      </SidebarProvider>
      <MobileTabBar />
    </div>
  );
};

export default MainLayout;
