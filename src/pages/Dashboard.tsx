
import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";
import { DashboardSkeleton } from "@/components/common/PageSkeleton";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import TrialBanner from "@/components/common/TrialBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CalendarPlus, LayoutDashboard, QrCode, Smartphone, Zap } from "lucide-react";
import RealTimeDashboard from "@/components/dashboard/RealTimeDashboard";
import SmartInvitationSystem from "@/components/invitations/SmartInvitationSystem";
import SectionErrorBoundary from "@/components/common/SectionErrorBoundary";

const Dashboard = () => {
  const { isOrganizer, isAdmin, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [enhancedTab, setEnhancedTab] = useState("overview");
  usePageTitle("Dashboard");

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isOrganizer || isAdmin) {
    return (
      <div className="space-y-6">
        <TrialBanner />
        <OnboardingWizard />

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-md">Panel organizatora</Badge>
                  <span className="text-sm text-muted-foreground">
                    {profile?.firstName ? `Witaj, ${profile.firstName}` : "Witaj w panelu"}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                    Centrum operacyjne wydarzeń
                  </h1>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                    Monitoruj status eventów, gości, akredytacji i check-inu w jednym miejscu. Zacznij od przeglądu albo przejdź od razu do pracy w terenie.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
              <Button variant="outline" onClick={() => navigate("/scanner")} className="gap-2 rounded-lg">
                <QrCode className="h-4 w-4" />
                Skaner QR
              </Button>
              <Button onClick={() => navigate("/events")} className="gap-2 rounded-lg">
                <CalendarPlus className="h-4 w-4" />
                Nowe wydarzenie
              </Button>
            </div>
          </div>
        </section>

        <Tabs value={enhancedTab} onValueChange={setEnhancedTab} className="w-full">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase text-muted-foreground">Tryb pracy</h2>
              <p className="text-sm text-muted-foreground">Wybierz widok odpowiadający aktualnemu zadaniu.</p>
            </div>
            <TabsList className="grid w-full grid-cols-2 rounded-lg border border-border bg-muted/50 p-1 sm:w-auto sm:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Przegląd</span>
              <span className="sm:hidden">Panel</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span>Na żywo</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Zap className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Zaproszenia</span>
              <span className="sm:hidden">Zapr.</span>
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Smartphone className="h-4 w-4 shrink-0" />
              <span>Offline</span>
            </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <SectionErrorBoundary fallbackTitle="Błąd ładowania przeglądu">
              <OrganizerDashboard />
            </SectionErrorBoundary>
          </TabsContent>
          <TabsContent value="realtime">
            <SectionErrorBoundary fallbackTitle="Błąd dashboardu na żywo">
              <RealTimeDashboard />
            </SectionErrorBoundary>
          </TabsContent>
          <TabsContent value="invitations">
            <SectionErrorBoundary fallbackTitle="Błąd systemu zaproszeń">
              <SmartInvitationSystem />
            </SectionErrorBoundary>
          </TabsContent>
          <TabsContent value="offline">
            <SectionErrorBoundary fallbackTitle="Błąd systemu offline">
              <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Offline check-in</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pobieranie manifestu, lokalna walidacja QR i kolejka skanów są teraz w jednym skanerze.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/scanner")} className="gap-2 rounded-lg">
                    <QrCode className="h-4 w-4" />
                    Otwórz skaner QR
                  </Button>
                </div>
              </section>
            </SectionErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return <GuestDashboard />;
};

export default Dashboard;
