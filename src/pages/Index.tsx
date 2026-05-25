
import React from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import HomePage from '@/pages/HomePage';

const Index = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
        <div className="text-center">
          <LoadingSpinner size={12} />
          <p className="mt-4 text-muted-foreground">Ładowanie aplikacji...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <HomePage />;
};

export default Index;
