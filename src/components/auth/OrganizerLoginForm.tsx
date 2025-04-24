
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useAuth } from "@/hooks/useAuth";

export const OrganizerLoginForm = ({ 
  onResetClick 
}: { 
  onResetClick: () => void 
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    if (!error) {
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-email">Email</Label>
          <Input
            id="org-email"
            type="email"
            placeholder="twoj@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="org-password">Hasło</Label>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-sm"
              onClick={(e) => {
                e.preventDefault();
                onResetClick();
              }}
            >
              Zapomniałeś hasła?
            </Button>
          </div>
          <Input
            id="org-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="pt-2">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Lub zaloguj się przez:
          </div>
          <SocialLoginButtons />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logowanie...
            </>
          ) : "Zaloguj się"}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          Nie masz jeszcze konta?{" "}
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto"
            onClick={() => navigate("/purchase")}
          >
            Zarejestruj się
          </Button>
        </div>
      </CardFooter>
    </form>
  );
};
