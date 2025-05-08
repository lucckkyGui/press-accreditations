import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2, SquareCode } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";

interface GuestLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  guestStep: "email" | "verify";
  setGuestStep: (step: "email" | "verify") => void;
  testModeEnabled?: boolean;
}

export const GuestLoginForm = ({ 
  email, 
  setEmail, 
  guestStep, 
  setGuestStep,
  testModeEnabled = false
}: GuestLoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { playSoundEffect } = useSoundEffects();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (testModeEnabled) {
        // Special case for "TEST" in test mode
        if (email === "TEST") {
          playSoundEffect("notification");
          setEmail("guest@example.com");
          toast.success(t('auth.verificationCodeSent'));
          setGuestStep("verify");
          setTimeout(() => setIsLoading(false), 300);
          return;
        }
        
        // Standard test guest email
        if (email === "guest@example.com") {
          playSoundEffect("notification");
          toast.success(t('auth.verificationCodeSent'));
          setGuestStep("verify");
          setTimeout(() => setIsLoading(false), 300);
          return;
        }
      }
      
      // Regular OTP flow for non-test mode
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // emailRedirectTo would be used in production
        }
      });
      
      if (error) throw error;
      
      playSoundEffect("notification");
      toast.success(t('auth.verificationCodeSent'));
      setGuestStep("verify");
    } catch (error: any) {
      playSoundEffect("error", 0.4);
      
      if (testModeEnabled) {
        // In test mode, proceed anyway
        toast.info(t('auth.testModeInfo'));
        setGuestStep("verify");
      } else {
        toast.error(error.message || t('auth.emailSendFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In test mode, accept any code
      if (testModeEnabled) {
        // Special handling for "TEST" code or any code in test mode
        if (verificationCode === "TEST" || 
            verificationCode.length === 6 || 
            email === "guest@example.com") {
          playSoundEffect("success");
          toast.success(t('auth.testLoginSuccess'));
          // Small delay to allow toast to be seen
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
          return;
        }
      }
      
      // For non-test mode
      if (verificationCode.length === 6) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: verificationCode,
          type: 'email'
        });
        
        if (error) throw error;
        
        playSoundEffect("success");
        toast.success(t('auth.loginSuccessful'));
        navigate("/dashboard");
      } else {
        throw new Error(t('auth.invalidVerificationCode'));
      }
    } catch (error: any) {
      playSoundEffect("error", 0.4);
      
      if (testModeEnabled) {
        // In test mode, proceed to dashboard anyway
        toast.success(t('auth.testLoginSuccess'));
        navigate("/dashboard");
      } else {
        toast.error(error.message || t('auth.verificationFailed'));
        setIsLoading(false);
      }
    } finally {
      if (isLoading) setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      if (testModeEnabled) {
        // Testowe ponowne wysłanie kodu
        playSoundEffect("notification");
        toast.success(t('auth.verificationCodeResent'));
        return;
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        email
      });
      
      if (error) throw error;
      
      playSoundEffect("notification");
      toast.success(t('auth.verificationCodeResent'));
    } catch (error: any) {
      playSoundEffect("error", 0.4);
      
      if (testModeEnabled) {
        // W trybie testowym ignorujemy błędy
        toast.info(t('auth.testModeInfo'));
      } else {
        toast.error(error.message || t('auth.emailSendFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (guestStep === "verify") {
    return (
      <form onSubmit={handleVerifyGuest}>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Label htmlFor="verification-code">{t('auth.verificationCode')}</Label>
            <div className="mt-4">
              <InputOTP 
                maxLength={6} 
                value={verificationCode} 
                onChange={setVerificationCode}
                pattern="^[0-9]+$"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          
          {testModeEnabled && (
            <div className="text-center mt-2 text-sm text-muted-foreground">
              <p>{t('auth.testCodeHint')}</p>
              <p className="mt-1">Lub wpisz "TEST" w pierwszych polach</p>
            </div>
          )}
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {t('auth.didntReceiveCode')}
            </p>
            <Button 
              type="button" 
              variant="link" 
              className="text-sm p-0 h-auto"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              {t('auth.resendCode')}
            </Button>
            <div className="mt-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => setGuestStep("email")}
                disabled={isLoading}
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                {t('auth.backToPreviousStep')}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || (verificationCode.length < 6 && verificationCode !== "TEST")}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.verifying')}
              </>
            ) : t('auth.verifyAndLogin')}
          </Button>
        </CardFooter>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guest-email">{t('auth.email')}</Label>
          <Input
            id="guest-email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('auth.enterInvitationEmail')}
        </p>
        
        {testModeEnabled && (
          <div className="text-center mt-2 text-sm text-muted-foreground">
            <p>Możesz wpisać "TEST" zamiast adresu email</p>
          </div>
        )}
        
        <div className="border-t border-border pt-4 mt-4">
          <div className="text-center text-sm text-muted-foreground mb-4">
            {t('auth.orScanQRCode')}
          </div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              playSoundEffect("notification");
              toast.info("QR scan unavailable");
            }}
          >
            <SquareCode className="h-4 w-4" />
            {t('auth.scanQRCode')}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.sendingCode')}
            </>
          ) : t('auth.sendVerificationCode')}
        </Button>
      </CardFooter>
    </form>
  );
};
