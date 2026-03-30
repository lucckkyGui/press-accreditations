
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md p-6">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-2xl p-5">
            <QrCode className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-7xl font-extrabold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Strona nie została znaleziona</p>
        <p className="text-muted-foreground text-sm">
          Adres <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code> nie istnieje.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć
          </Button>
          <Button onClick={() => navigate("/")}>
            Strona główna
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
