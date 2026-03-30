
import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/auth";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import TrialBanner from "@/components/common/TrialBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Zap, Smartphone } from "lucide-react";
import RealTimeDashboard from "@/components/dashboard/RealTimeDashboard";
import SmartInvitationSystem from "@/components/invitations/SmartInvitationSystem";
import OfflineCheckinSystem from "@/components/scanner/OfflineCheckinSystem";

const Dashboard = () => {
  const { isOrganizer, isAdmin, isLoading } = useAuth();
  const [enhancedTab, setEnhancedTab] = useState("overview");
  usePageTitle("Dashboard");

  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isOrganizer || isAdmin) {
    return (
      <>
        <TrialBanner />
        <OnboardingWizard />
        <Tabs value={enhancedTab} onValueChange={setEnhancedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
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

          <TabsContent value="overview">
            <OrganizerDashboard />
          </TabsContent>
          <TabsContent value="realtime">
            <RealTimeDashboard />
          </TabsContent>
          <TabsContent value="invitations">
            <SmartInvitationSystem />
          </TabsContent>
          <TabsContent value="offline">
            <OfflineCheckinSystem />
          </TabsContent>
        </Tabs>
      </>
    );
  }

  return <GuestDashboard />;
};

export default Dashboard;
