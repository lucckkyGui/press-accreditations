import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("OAuth callback error:", error);
          toast({
            title: "Błąd logowania",
            description: error.message || "Wystąpił błąd podczas logowania przez OAuth.",
            variant: "destructive",
          });
          navigate("/auth/login", { replace: true });
          return;
        }

        if (data.session) {
          toast({
            title: "Zalogowano pomyślnie",
            description: "Witaj z powrotem!",
          });
          navigate("/dashboard", { replace: true });
        } else {
          toast({
            title: "Błąd logowania",
            description: "Nie udało się zalogować. Spróbuj ponownie.",
            variant: "destructive",
          });
          navigate("/auth/login", { replace: true });
        }
      } catch (err) {
        console.error("Unexpected error during OAuth callback:", err);
        toast({
          title: "Błąd",
          description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
          variant: "destructive",
        });
        navigate("/auth/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Trwa logowanie...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
