
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Download, Lock, Settings2, User2, Users } from "lucide-react";
import UserManagement from "@/components/settings/UserManagement";
import ExportSettings from "@/components/settings/ExportSettings";

const Settings = () => {
  const handleSaveOrganizationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ustawienia organizacji zostały zapisane");
  };
  
  const handleSaveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ustawienia powiadomień zostały zapisane");
  };

  const handleSaveSecuritySettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ustawienia bezpieczeństwa zostały zapisane");
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ustawienia</h1>
          <p className="text-muted-foreground">
            Dostosuj ustawienia aplikacji Press Acreditations.
          </p>
        </div>
        
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="w-full border-b rounded-none justify-start">
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" /> 
              Organizacja
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Settings2 className="h-4 w-4" /> 
              Powiadomienia
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" /> 
              Bezpieczeństwo
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> 
              Użytkownicy
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" /> 
              Eksport
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Profil organizacji</CardTitle>
                <CardDescription>
                  Ustaw podstawowe informacje o Twojej organizacji, które będą widoczne dla gości.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="organization-form" onSubmit={handleSaveOrganizationSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization-name">Nazwa organizacji</Label>
                      <Input id="organization-name" placeholder="Nazwa Twojej organizacji" defaultValue="Press Acreditations" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization-email">Email kontaktowy</Label>
                      <Input id="organization-email" type="email" placeholder="contact@company.com" defaultValue="kontakt@pressacreditations.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organization-description">Opis</Label>
                    <Textarea
                      id="organization-description"
                      placeholder="Krótki opis Twojej organizacji"
                      defaultValue="Firma zajmująca się organizacją profesjonalnych wydarzeń korporacyjnych i obsługą gości."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization-website">Strona internetowa</Label>
                      <Input id="organization-website" type="url" placeholder="https://company.com" defaultValue="https://pressacreditations.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization-phone">Telefon</Label>
                      <Input id="organization-phone" placeholder="+48 123 456 789" defaultValue="+48 123 456 789" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organization-logo">Logo organizacji</Label>
                    <Input id="organization-logo" type="file" />
                    <p className="text-xs text-muted-foreground">
                      Zalecany format: PNG lub SVG. Maksymalny rozmiar: 2MB.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Adres</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input placeholder="Ulica i numer" defaultValue="ul. Przykładowa 123" />
                      <Input placeholder="Kod pocztowy" defaultValue="00-001" />
                      <Input placeholder="Miasto" defaultValue="Warszawa" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Media społecznościowe</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Link do Facebook" defaultValue="https://facebook.com/pressacreditations" />
                      <Input placeholder="Link do Twitter" defaultValue="https://twitter.com/pressacred" />
                      <Input placeholder="Link do LinkedIn" defaultValue="https://linkedin.com/company/pressacreditations" />
                      <Input placeholder="Link do Instagram" defaultValue="" />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="organization-form">
                  Zapisz zmiany
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia powiadomień</CardTitle>
                <CardDescription>
                  Skonfiguruj jak i kiedy chcesz otrzymywać powiadomienia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="notification-form" onSubmit={handleSaveNotificationSettings} className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-checkins" className="flex-1">
                        Powiadomienia email o wejściach gości
                        <p className="text-sm text-muted-foreground">
                          Otrzymuj email za każdym razem, gdy gość zostanie zeskanowany
                        </p>
                      </Label>
                      <Input
                        id="email-checkins"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={true}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-confirmations" className="flex-1">
                        Powiadomienia o potwierdzeniach udziału
                        <p className="text-sm text-muted-foreground">
                          Otrzymuj email, gdy gość potwierdzi lub odrzuci zaproszenie
                        </p>
                      </Label>
                      <Input
                        id="email-confirmations"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={true}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications" className="flex-1">
                        Powiadomienia push
                        <p className="text-sm text-muted-foreground">
                          Włącz powiadomienia push w przeglądarce
                        </p>
                      </Label>
                      <Input
                        id="push-notifications"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={false}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="summary-reports" className="flex-1">
                        Raporty podsumowujące
                        <p className="text-sm text-muted-foreground">
                          Otrzymuj tygodniowe raporty o działaniu systemu
                        </p>
                      </Label>
                      <Input
                        id="summary-reports"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={true}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="activity-notifications" className="flex-1">
                        Powiadomienia o aktywności
                        <p className="text-sm text-muted-foreground">
                          Otrzymuj powiadomienia gdy inni użytkownicy dokonują zmian
                        </p>
                      </Label>
                      <Input
                        id="activity-notifications"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={true}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-notifications" className="flex-1">
                        Powiadomienia systemowe
                        <p className="text-sm text-muted-foreground">
                          Otrzymuj informacje o aktualizacjach systemu i nowych funkcjach
                        </p>
                      </Label>
                      <Input
                        id="system-notifications"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="notification-form">
                  Zapisz ustawienia
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia bezpieczeństwa</CardTitle>
                <CardDescription>
                  Zarządzaj bezpieczeństwem swojego konta i danych.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="security-form" onSubmit={handleSaveSecuritySettings} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Hasło</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Obecne hasło</Label>
                        <Input id="current-password" type="password" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nowe hasło</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Potwierdź hasło</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    
                    <div className="border p-3 rounded-md bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        Hasło powinno zawierać co najmniej 8 znaków, w tym wielkie i małe litery, cyfry oraz znaki specjalne.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Uwierzytelnianie dwuskładnikowe</h3>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Status: <span className="text-red-500">Wyłączone</span></p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dodaj dodatkową warstwę zabezpieczeń dla swojego konta. 
                          Po włączeniu będziesz potrzebować kodu z aplikacji do logowania.
                        </p>
                      </div>
                      <Button variant="outline">Włącz 2FA</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sesje aktywne</h3>
                    
                    <div className="border rounded-md divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Chrome / Windows</p>
                          <p className="text-sm text-muted-foreground">Warszawa, Polska · Aktywna teraz</p>
                        </div>
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Aktualna</div>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Safari / iPhone</p>
                          <p className="text-sm text-muted-foreground">Warszawa, Polska · 2 dni temu</p>
                        </div>
                        <Button variant="outline" size="sm">Wyloguj</Button>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">Wyloguj ze wszystkich urządzeń</Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="security-form">
                  Zapisz ustawienia
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardContent className="pt-6">
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export">
            <ExportSettings />
          </TabsContent>
        </Tabs>
        
        <Card className="bg-red-50 border-red-100">
          <CardHeader>
            <CardTitle className="text-red-800">Strefa niebezpieczna</CardTitle>
            <CardDescription className="text-red-700">
              Wykonanie poniższych akcji może spowodować trwałą utratę danych.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-red-200 rounded-md bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-red-800">Usuń wszystkie dane z konta</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Ta akcja usunie wszystkie wydarzenia, gości, szablony zaproszeń i statystyki.
                    Jest to operacja nieodwracalna.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => toast.error("Funkcja dostępna w pełnej wersji")}
                >
                  Usuń dane
                </Button>
              </div>
            </div>
            
            <div className="p-4 border border-red-200 rounded-md bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-red-800">Zamknij konto</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Konto zostanie dezaktywowane i wszystkie Twoje dane zostaną usunięte.
                  </p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => toast.error("Funkcja dostępna w pełnej wersji")}
                >
                  Zamknij konto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
