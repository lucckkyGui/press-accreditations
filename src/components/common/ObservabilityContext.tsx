import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { setObservabilityRoute, setObservabilityUser } from "@/lib/observability";

const ObservabilityContext = () => {
  const location = useLocation();
  const { user, roles } = useAuth();

  useEffect(() => {
    setObservabilityRoute(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setObservabilityUser(null);
      return;
    }

    setObservabilityUser({
      id: user.id,
      email: user.email,
      roles,
    });
  }, [roles, user]);

  return null;
};

export default ObservabilityContext;
