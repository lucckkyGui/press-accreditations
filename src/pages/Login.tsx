
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Symulacja logowania dla MVP
    setTimeout(() => {
      // Proste sprawdzanie dla MVP - w rzeczywistej aplikacji byłaby autentykacja
      if (email && password) {
        localStorage.setItem("isLoggedIn", "true");
        toast.success("Zalogowano pomyślnie");
        navigate("/");
      } else {
        toast.error("Nieprawidłowe dane logowania");
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

        <Card>
          <CardHeader>
            <CardTitle>Logowanie do panelu</CardTitle>
            <CardDescription>
              Wprowadź swoje dane logowania, aby kontynuować.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Hasło</Label>
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
                  id="password"
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
      </div>
    </div>
  );
};

export default Login;
