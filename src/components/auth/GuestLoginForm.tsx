
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2, SquareCode } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface GuestLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  guestStep: "email" | "verify";
  setGuestStep: (step: "email" | "verify") => void;
}

export const GuestLoginForm = ({ 
  email, 
  setEmail, 
  guestStep, 
  setGuestStep 
}: GuestLoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (email) {
        toast.success("Kod weryfikacyjny został wysłany na podany adres email");
        setGuestStep("verify");
      } else {
        toast.error("Proszę podać adres email");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyGuest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (verificationCode.length === 6) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "guest");
        localStorage.setItem("userEmail", email);
        toast.success("Weryfikacja udana, zalogowano jako gość");
      } else {
        toast.error("Niepoprawny kod weryfikacyjny");
      }
      setIsLoading(false);
    }, 1000);
  };

  if (guestStep === "verify") {
    return (
      <form onSubmit={handleVerifyGuest}>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Label htmlFor="verification-code">Kod weryfikacyjny</Label>
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
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Nie otrzymałeś kodu?
            </p>
            <Button 
              type="button" 
              variant="link" 
              className="text-sm p-0 h-auto"
              onClick={() => {
                toast.info("Kod został wysłany ponownie na podany adres email");
              }}
            >
              Wyślij ponownie
            </Button>
            <div className="mt-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => setGuestStep("email")}
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Wróć do poprzedniego kroku
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || verificationCode.length < 6}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Weryfikacja...
              </>
            ) : "Weryfikuj i zaloguj"}
          </Button>
        </CardFooter>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guest-email">Email</Label>
          <Input
            id="guest-email"
            type="email"
            placeholder="twoj@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Podaj adres email, na który otrzymałeś zaproszenie.
        </p>
        
        <div className="border-t border-border pt-4 mt-4">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Lub zeskanuj kod QR z zaproszenia:
          </div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => toast.info("Funkcja skanowania kodu QR będzie dostępna w pełnej wersji")}
          >
            <SquareCode className="h-4 w-4" />
            Zeskanuj kod QR
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wysyłanie kodu...
            </>
          ) : "Wyślij kod weryfikacyjny"}
        </Button>
      </CardFooter>
    </form>
  );
};
