
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";

interface GuestVerificationFormProps {
  email: string;
  onBackToEmail: () => void;
  testModeEnabled?: boolean;
}

export const GuestVerificationForm = ({ 
  email, 
  onBackToEmail,
  testModeEnabled = false
}: GuestVerificationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { playSoundEffect } = useSoundEffects();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

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
            const from = location.state?.from || "/dashboard";
            navigate(from, { replace: true });
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
        const from = location.state?.from || "/dashboard";
        navigate(from, { replace: true });
      } else {
        throw new Error(t('auth.invalidVerificationCode'));
      }
    } catch (error: unknown) {
      playSoundEffect("error", 0.4);
      
      if (testModeEnabled) {
        // In test mode, proceed to dashboard anyway
        toast.success(t('auth.testLoginSuccess'));
        const from = location.state?.from || "/dashboard";
        navigate(from, { replace: true });
      } else {
        toast.error(error.message || t('auth.verificationFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      if (testModeEnabled) {
        // Test mode resend code
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
    } catch (error: unknown) {
      playSoundEffect("error", 0.4);
      
      if (testModeEnabled) {
        // In test mode we ignore errors
        toast.info(t('auth.testModeInfo'));
      } else {
        toast.error(error.message || t('auth.emailSendFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerifyGuest}>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <label htmlFor="verification-code">{t('auth.verificationCode')}</label>
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
              onClick={onBackToEmail}
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
};
