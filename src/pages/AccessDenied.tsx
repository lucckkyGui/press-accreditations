import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

const AccessDenied = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-background px-4">
      <ShieldX className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold text-foreground">Brak dostępu</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Nie masz uprawnień do wyświetlenia tej strony. Skontaktuj się z administratorem, jeśli uważasz, że to błąd.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Wróć
        </Button>
        <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}>
          Strona główna
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
