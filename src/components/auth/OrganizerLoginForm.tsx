
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/hooks/useI18n";

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
  const { playSoundEffect } = useSoundEffects();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        playSoundEffect("error", 0.4);
        throw error;
      }
      
      playSoundEffect("success", 0.5);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-email">{t('auth.email')}</Label>
          <Input
            id="org-email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="org-password">{t('auth.password')}</Label>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-sm"
              onClick={(e) => {
                e.preventDefault();
                onResetClick();
              }}
            >
              {t('auth.forgotPassword')}
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
            {t('auth.orLoginWith')}
          </div>
          <SocialLoginButtons />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.loggingIn')}
            </>
          ) : t('auth.login')}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          {t('auth.noAccount')}{" "}
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto"
            onClick={() => navigate("/purchase")}
          >
            {t('auth.register')}
          </Button>
        </div>
      </CardFooter>
    </form>
  );
};
