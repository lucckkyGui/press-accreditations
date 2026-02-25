
import React from "react";
import { useAuth } from "@/hooks/auth";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

const Dashboard = () => {
  const { isOrganizer, isAdmin, isLoading, roles } = useAuth();

  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show organizer dashboard for organizers and admins
  if (isOrganizer || isAdmin) {
    return (
      <>
        <OnboardingWizard />
        <OrganizerDashboard />
      </>
    );
  }

  // Show guest dashboard for regular users
  return <GuestDashboard />;
};

export default Dashboard;
