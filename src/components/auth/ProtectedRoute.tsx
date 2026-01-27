
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  // If page is still loading, show spinner
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">
      <LoadingSpinner />
    </div>;
  }

  // If authentication is required and user is not logged in, redirect to login
  if (requireAuth && !isAuthenticated) {
    // Pass the current location to redirect back after login
    return <Navigate to="/auth/login" state={{ from: location.pathname }} />;
  }

  // Otherwise, render the content
  return <>{children}</>;
};

export default ProtectedRoute;
