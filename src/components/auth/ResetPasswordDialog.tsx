
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetPasswordDialog = ({ isOpen, onOpenChange }: ResetPasswordDialogProps) => {
  const [resetStep, setResetStep] = useState<"email" | "code" | "new-password">("email");
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (resetPasswordEmail) {
        toast.success("Wysłano kod resetowania hasła na podany adres email");
        setResetStep("code");
      } else {
        toast.error("Proszę podać adres email");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (resetCode.length === 6) {
        toast.success("Kod zweryfikowany pomyślnie");
        setResetStep("new-password");
      } else {
        toast.error("Niepoprawny kod resetowania");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (newPassword && newPassword === confirmPassword) {
        toast.success("Hasło zostało zmienione");
        onOpenChange(false);
        setResetStep("email");
        setNewPassword("");
        setConfirmPassword("");
        setResetCode("");
        setResetPasswordEmail("");
      } else if (!newPassword) {
        toast.error("Proszę podać nowe hasło");
      } else {
        toast.error("Hasła nie są identyczne");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setResetStep("email");
    setResetPasswordEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resetowanie hasła</DialogTitle>
          <DialogDescription>
            {resetStep === "email" && "Podaj email, na który zostanie wysłany link do resetowania hasła."}
            {resetStep === "code" && "Wpisz 6-cyfrowy kod, który otrzymałeś na adres email."}
            {resetStep === "new-password" && "Ustaw nowe hasło dla swojego konta."}
          </DialogDescription>
        </DialogHeader>
        
        {resetStep === "email" && (
          <form onSubmit={handleResetPasswordRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Adres email</Label>
              <Input 
                id="reset-email"
                type="email"
                placeholder="twoj@email.com"
                value={resetPasswordEmail}
                onChange={(e) => setResetPasswordEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wysyłanie...
                  </>
                ) : "Wyślij kod resetujący"}
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {resetStep === "code" && (
          <form onSubmit={handleVerifyResetCode} className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Label htmlFor="reset-code">Kod resetujący</Label>
              <div className="mt-4">
                <InputOTP 
                  maxLength={6} 
                  value={resetCode} 
                  onChange={setResetCode}
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
            
            <div className="text-center mt-2">
              <Button 
                type="button" 
                variant="link" 
                className="text-sm p-0 h-auto"
                onClick={() => setResetStep("email")}
              >
                Użyj innego adresu email
              </Button>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || resetCode.length < 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Weryfikacja...
                  </>
                ) : "Weryfikuj kod"}
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {resetStep === "new-password" && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nowe hasło</Label>
              <Input 
                id="new-password"
                type="password"
                placeholder="Wpisz nowe hasło"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Potwierdź hasło</Label>
              <Input 
                id="confirm-password"
                type="password"
                placeholder="Potwierdź nowe hasło"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !newPassword || newPassword !== confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Zapisywanie...
                  </>
                ) : "Zapisz nowe hasło"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
