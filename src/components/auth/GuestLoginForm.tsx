
import React, { useState } from "react";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import { GuestEmailForm } from "./GuestEmailForm";
import { GuestVerificationForm } from "./GuestVerificationForm";

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
  const { playSoundEffect } = useSoundEffects();
  const { t } = useI18n();

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

  if (guestStep === "verify") {
    return (
      <GuestVerificationForm 
        email={email}
        onBackToEmail={() => setGuestStep("email")}
        testModeEnabled={testModeEnabled}
      />
    );
  }

  return (
    <GuestEmailForm 
      email={email}
      setEmail={setEmail}
      isLoading={isLoading}
      onSubmit={handleEmailSubmit}
      testModeEnabled={testModeEnabled}
    />
  );
};
