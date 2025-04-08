
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Settings = () => {
  const handleSaveOrganizationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ustawienia organizacji zostały zapisane");
  };
  
  const handleSaveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ustawienia powiadomień zostały zapisane");
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
        
        <div className="grid gap-6">
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
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" form="organization-form">
                Zapisz zmiany
              </Button>
            </CardFooter>
          </Card>
          
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
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" form="notification-form">
                Zapisz ustawienia
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
