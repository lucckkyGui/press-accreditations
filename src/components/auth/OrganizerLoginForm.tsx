
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, Lock } from "lucide-react";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/hooks/useI18n";

export const OrganizerLoginForm = ({ 
  onResetClick,
  defaultEmail = "",
  defaultPassword = "",
  testModeEnabled = false
}: { 
  onResetClick: () => void;
  defaultEmail?: string;
  defaultPassword?: string;
  testModeEnabled?: boolean;
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { playSoundEffect } = useSoundEffects();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (testModeEnabled) {
        if (email === "TEST" || (email === "admin@example.com" && password === "password123")) {
          playSoundEffect("success", 0.5);
          toast.success(t('auth.testLoginSuccess'));
          setTimeout(() => {
            const from = location.state?.from || "/dashboard";
            navigate(from, { replace: true });
          }, 500);
          return;
        }
      }
      
      const result = await signIn(email, password);
      
      if (result && result.error) {
        throw result.error;
      }
      
      playSoundEffect("success", 0.5);
      toast.success(t('auth.loginSuccessful'));
      
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="org-email" className="text-sm font-medium">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              id="org-email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary/40 transition-colors"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="org-password" className="text-sm font-medium">{t('auth.password')}</Label>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-primary/80 hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                onResetClick();
              }}
            >
              {t('auth.forgotPassword')}
            </Button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              id="org-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary/40 transition-colors"
              required
            />
          </div>
        </div>
        
        <div className="pt-1">
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-card px-3 text-xs text-muted-foreground">
              {t('auth.orLoginWith')}
            </span>
          </div>
          <SocialLoginButtons />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3 pt-2">
        <Button type="submit" className="w-full h-11 rounded-xl font-medium shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all" disabled={isLoading}>
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
            className="p-0 h-auto text-primary font-medium"
            onClick={() => navigate("/purchase")}
          >
            {t('auth.register')}
          </Button>
        </div>
      </CardFooter>
    </form>
  );
};
