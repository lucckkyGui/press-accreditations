
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("organizator");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ustawiamy aktywną zakładkę na podstawie stanu z nawigacji
    const role = location.state?.role;
    if (role === "guest" || role === "organizator") {
      setActiveTab(role);
    }
  }, [location.state]);

  const handleLogin = (e: React.FormEvent, role: string) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Symulacja logowania dla MVP
    setTimeout(() => {
      if (role === "guest") {
        // Dla gościa wystarczy tylko email
        if (email) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", "guest");
          toast.success("Zalogowano jako gość");
          navigate("/scanner"); // Przekierowanie do skanera dla gości
        } else {
          toast.error("Proszę podać adres email");
        }
      } else {
        // Dla organizatora wymagane email i hasło
        if (email && password) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", "organizator");
          toast.success("Zalogowano jako organizator");
          navigate("/"); // Przekierowanie do dashboardu dla organizatora
        } else {
          toast.error("Proszę podać email i hasło");
        }
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
              <form onSubmit={(e) => handleLogin(e, "organizator")}>
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
            <Card>
              <CardHeader>
                <CardTitle>Logowanie dla gości</CardTitle>
                <CardDescription>
                  Wprowadź swój adres email, aby uzyskać dostęp do swojej akredytacji.
                </CardDescription>
              </CardHeader>
              <form onSubmit={(e) => handleLogin(e, "guest")}>
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
                    {isLoading ? "Logowanie..." : "Dostęp do akredytacji"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
