import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ArrowLeft, Mail, SquareCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth, AuthData } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("organizator");
  const [guestStep, setGuestStep] = useState("email"); // "email" lub "verify"
  const [verificationCode, setVerificationCode] = useState("");
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "code" | "new-password">("email");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ustawiamy aktywną zakładkę na podstawie stanu z nawigacji
    const role = location.state?.role;
    if (role === "guest" || role === "organizator") {
      setActiveTab(role);
    }
  }, [location.state]);

  const handleLoginOrganizator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    if (!error) {
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userData: AuthData = {
      email,
      password,
      role: activeTab === "organizator" ? "organizer" : "guest"
    };

    await signUp(userData);
    setIsLoading(false);
  };

  const handleGuestEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Symulacja wysłania kodu weryfikacyjnego
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
    
    // Symulacja weryfikacji kodu
    setTimeout(() => {
      if (verificationCode.length === 6) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "guest");
        localStorage.setItem("userEmail", email);
        toast.success("Weryfikacja udana, zalogowano jako gość");
        navigate("/scanner"); // Przekierowanie do skanera dla gości
      } else {
        toast.error("Niepoprawny kod weryfikacyjny");
      }
      setIsLoading(false);
    }, 1000);
  };

  // Funkcje do obsługi resetowania hasła
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
        setIsResetDialogOpen(false);
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

  // Komponent dialogu resetowania hasła
  const resetPasswordDialog = (
    <Dialog open={isResetDialogOpen} onOpenChange={(open) => {
      setIsResetDialogOpen(open);
      if (!open) {
        setResetStep("email");
        setResetPasswordEmail("");
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
      }
    }}>
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

  // Komponent dla logowania przez media społecznościowe
  const SocialLoginButtons = () => (
    <div className="grid grid-cols-3 gap-3">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => toast.info("Logowanie przez Google będzie dostępne w pełnej wersji")}
      >
        <svg 
          viewBox="0 0 48 48" 
          className="h-5 w-5" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M47.532 24.553c0-1.632-.132-3.254-.401-4.857H24.265v9.2h13.08c-.558 3.033-2.28 5.615-4.843 7.326v6.063h7.842c4.588-4.22 7.23-10.434 7.23-17.732Z" fill="#4285F4"/>
          <path d="M24.265 48c6.553 0 12.032-2.149 16.039-5.816l-7.842-6.063c-2.169 1.464-4.951 2.325-8.197 2.325-6.33 0-11.686-4.264-13.596-9.994H2.516v6.255C6.488 42.452 14.709 48 24.265 48Z" fill="#34A853"/>
          <path d="M10.669 28.452c-.486-1.464-.761-3.034-.761-4.64 0-1.607.275-3.177.76-4.64v-6.256H2.517C.907 16.558 0 20.427 0 24.352c0 3.926.907 7.794 2.517 11.196l8.152-7.096Z" fill="#FBBC05"/>
          <path d="M24.265 9.719c3.567 0 6.768 1.221 9.28 3.635l6.953-6.926C36.436 2.478 30.957 0 24.266 0 14.71 0 6.488 5.547 2.516 13.292l8.153 6.256c1.91-5.73 7.266-9.829 13.596-9.829Z" fill="#EA4335"/>
        </svg>
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => toast.info("Logowanie przez Facebook będzie dostępne w pełnej wersji")}
      >
        <svg 
          className="h-5 w-5 text-[#1877F2]" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.286C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
        </svg>
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => toast.info("Logowanie przez LinkedIn będzie dostępne w pełnej wersji")}
      >
        <svg 
          className="h-5 w-5 text-[#0A66C2]" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <QrCode className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Press Acreditations</h1>
          <p className="text-muted-foreground mt-2">
            System zarządzania akredytacjami prasowymi
          </p>
        </div>

        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót do strony głównej
        </Button>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="organizator">Organizator</TabsTrigger>
            <TabsTrigger value="guest">Gość</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizator">
            <Card>
              <CardHeader>
                <CardTitle>Logowanie dla organizatora</CardTitle>
                <CardDescription>
                  Wprowadź swoje dane logowania, aby uzyskać dostęp do panelu organizatora.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginOrganizator}>
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
                          setIsResetDialogOpen(true);
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
            </Card>
          </TabsContent>
          
          <TabsContent value="guest">
            {guestStep === "email" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Logowanie dla gości</CardTitle>
                  <CardDescription>
                    Wprowadź swój adres email, aby otrzymać kod weryfikacyjny.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleGuestEmailSubmit}>
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
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Weryfikacja</CardTitle>
                  <CardDescription>
                    Wprowadź kod weryfikacyjny, który został wysłany na adres {email}
                  </CardDescription>
                </CardHeader>
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
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {resetPasswordDialog}
    </div>
  );
};

export default Login;
