
import React from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import HomePage from '@/pages/HomePage';

const Index = () => {
  const { isLoading, isAuthenticated, isOrganizer, rolesLoaded } = useAuth();

  // Wait until both auth state and roles are resolved
  if (isLoading || (isAuthenticated && !rolesLoaded)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size={12} />
          <p className="mt-4 text-muted-foreground">Ładowanie aplikacji...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Only organizers / admins land on the dashboard.
    // Guest users (press / attendees) go to the accreditation catalogue.
    return <Navigate to={isOrganizer ? "/dashboard" : "/accreditation-categories"} replace />;
  }

  return <HomePage />;
};

export default Index;
