import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { AppRole } from "@/hooks/auth/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isLoading, isAuthenticated, roles } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} />;
  }

  // If allowedRoles specified, check user has at least one
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = roles.some(role => allowedRoles.includes(role));
    if (!hasAccess) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
