
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QrCode, ArrowLeft } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizerLoginForm } from "@/components/auth/OrganizerLoginForm";
import { GuestLoginForm } from "@/components/auth/GuestLoginForm";
import { ResetPasswordDialog } from "@/components/auth/ResetPasswordDialog";

const Login = () => {
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("organizator");
  const [guestStep, setGuestStep] = useState<"email" | "verify">("email");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = location.state?.role;
    if (role === "guest" || role === "organizator") {
      setActiveTab(role);
    }
  }, [location.state]);

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
              <OrganizerLoginForm onResetClick={() => setIsResetDialogOpen(true)} />
            </Card>
          </TabsContent>
          
          <TabsContent value="guest">
            <Card>
              <CardHeader>
                <CardTitle>
                  {guestStep === "email" ? "Logowanie dla gości" : "Weryfikacja"}
                </CardTitle>
                <CardDescription>
                  {guestStep === "email" 
                    ? "Wprowadź swój adres email, aby otrzymać kod weryfikacyjny."
                    : `Wprowadź kod weryfikacyjny, który został wysłany na adres ${email}`
                  }
                </CardDescription>
              </CardHeader>
              <GuestLoginForm
                email={email}
                setEmail={setEmail}
                guestStep={guestStep}
                setGuestStep={setGuestStep}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ResetPasswordDialog 
        isOpen={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      />
    </div>
  );
};

export default Login;
