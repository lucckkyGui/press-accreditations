
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("organizator");
  const [guestStep, setGuestStep] = useState("email"); // "email" lub "verify"
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ustawiamy aktywną zakładkę na podstawie stanu z nawigacji
    const role = location.state?.role;
    if (role === "guest" || role === "organizator") {
      setActiveTab(role);
    }
  }, [location.state]);

  const handleLoginOrganizator = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Symulacja logowania dla MVP
    setTimeout(() => {
      if (email && password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "organizator");
        toast.success("Zalogowano jako organizator");
        navigate("/"); // Przekierowanie do dashboardu dla organizatora
      } else {
        toast.error("Proszę podać email i hasło");
      }
      setIsLoading(false);
    }, 1000);
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
                      <a
                        href="#"
                        className="text-sm text-primary hover:text-primary/80"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info("Funkcja resetowania hasła będzie dostępna w pełnej wersji");
                        }}
                      >
                        Zapomniałeś hasła?
                      </a>
                    </div>
                    <Input
                      id="org-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logowanie..." : "Zaloguj się"}
                  </Button>
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
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Wysyłanie kodu..." : "Wyślij kod weryfikacyjny"}
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
                      {isLoading ? "Weryfikacja..." : "Weryfikuj i zaloguj"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
