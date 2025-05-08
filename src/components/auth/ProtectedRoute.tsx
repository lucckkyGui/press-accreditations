
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Nowy prop, który umożliwia opcjonalne wymaganie autentykacji
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Jeśli strona nadal się ładuje, pokaż spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // Jeśli wymagana jest autoryzacja i użytkownik nie jest zalogowany, przekieruj na stronę logowania
  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  // W przeciwnym razie renderuj zawartość
  return <>{children}</>;
};

export default ProtectedRoute;
