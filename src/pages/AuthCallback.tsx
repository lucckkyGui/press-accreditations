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
        // Handle the hash fragment from email confirmation or OAuth
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // If we have tokens in the hash (email confirmation), set the session
        if (accessToken && refreshToken) {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setError) {
          }
        }
        
        const { data, error } = await supabase.auth.getSession();

        if (error) {
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
