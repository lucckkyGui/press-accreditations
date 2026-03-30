
import React, { useState } from "react";
import { useAuth } from "@/hooks/auth";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Zap, Smartphone } from "lucide-react";
import RealTimeDashboard from "@/components/dashboard/RealTimeDashboard";
import SmartInvitationSystem from "@/components/invitations/SmartInvitationSystem";
import OfflineCheckinSystem from "@/components/scanner/OfflineCheckinSystem";

const Dashboard = () => {
  const { isOrganizer, isAdmin, isLoading } = useAuth();
  const [enhancedTab, setEnhancedTab] = useState("overview");

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
        <OnboardingWizard />
        <Tabs value={enhancedTab} onValueChange={setEnhancedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Przegląd
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Na żywo
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Zaproszenia
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Offline
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
