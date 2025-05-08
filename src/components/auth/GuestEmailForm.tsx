
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, SquareCode } from "lucide-react";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/hooks/useI18n";

interface GuestEmailFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  testModeEnabled?: boolean;
}

export const GuestEmailForm = ({ 
  email, 
  setEmail,
  isLoading,
  onSubmit,
  testModeEnabled = false
}: GuestEmailFormProps) => {
  const { playSoundEffect } = useSoundEffects();
  const { t } = useI18n();

  return (
    <form onSubmit={onSubmit}>
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
