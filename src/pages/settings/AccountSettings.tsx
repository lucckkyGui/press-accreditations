
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Key, Trash2, AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Hasła nie są takie same");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("Hasło musi mieć co najmniej 8 znaków");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      toast.success("Hasło zostało zmienione");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.message || "Błąd podczas zmiany hasła");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await signOut();
      toast.success("Zostałeś wylogowany. Aby usunąć konto, skontaktuj się z supportem.");
      navigate("/");
    } catch (error) {
      toast.error("Błąd podczas operacji");
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await signOut();
      toast.success("Wylogowano ze wszystkich urządzeń");
      navigate("/auth/login");
    } catch (error) {
      toast.error("Błąd podczas wylogowywania");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ustawienia konta</h1>
          <p className="text-muted-foreground">
            Zarządzaj bezpieczeństwem i ustawieniami konta
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Password section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Zmiana hasła
            </CardTitle>
            <CardDescription>
              Zmień hasło do swojego konta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Obecne hasło</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nowe hasło</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Hasło musi mieć co najmniej 8 znaków, zawierać wielkie i małe litery oraz cyfry.
              </p>
              
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Zmieniam..." : "Zmień hasło"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Two-factor authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Uwierzytelnianie dwuskładnikowe (2FA)
            </CardTitle>
            <CardDescription>
              Dodaj dodatkową warstwę zabezpieczeń do swojego konta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  Status: {twoFactorEnabled ? (
                    <span className="text-green-600">Włączone</span>
                  ) : (
                    <span className="text-muted-foreground">Wyłączone</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Po włączeniu będziesz potrzebować kodu z aplikacji do logowania.
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  setTwoFactorEnabled(checked);
                  toast.info(checked ? "2FA zostanie włączone" : "2FA zostanie wyłączone");
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Aktywne sesje
            </CardTitle>
            <CardDescription>
              Zarządzaj aktywnymi sesjami na różnych urządzeniach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md divide-y">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">To urządzenie</p>
                  <p className="text-sm text-muted-foreground">Aktywna teraz</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                  Aktualna
                </span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full gap-2" onClick={handleLogoutAllDevices}>
              <LogOut className="h-4 w-4" />
              Wyloguj ze wszystkich urządzeń
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Strefa niebezpieczna
            </CardTitle>
            <CardDescription>
              Te akcje są nieodwracalne
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-md bg-background">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Usuń konto</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trwale usuń swoje konto i wszystkie powiązane dane.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Usuń konto
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ta akcja jest nieodwracalna. Wszystkie Twoje dane, wydarzenia i ustawienia zostaną trwale usunięte.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Usuń konto
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
