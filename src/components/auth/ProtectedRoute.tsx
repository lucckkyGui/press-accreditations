import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // If page is still loading, show spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // If authentication is required and user is not logged in, redirect to login
  if (requireAuth && !isAuthenticated) {
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // Otherwise, render the content
  return <>{children}</>;
};

export default ProtectedRoute;
