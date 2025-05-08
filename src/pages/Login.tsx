import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QrCode, ArrowLeft, Info } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizerLoginForm } from "@/components/auth/OrganizerLoginForm";
import { GuestLoginForm } from "@/components/auth/GuestLoginForm";
import { ResetPasswordDialog } from "@/components/auth/ResetPasswordDialog";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/hooks/useI18n";

const Login = () => {
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("organizator");
  const [guestStep, setGuestStep] = useState<"email" | "verify">("email");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const role = location.state?.role;
    if (role === "guest" || role === "organizator") {
      setActiveTab(role);
    }

    // Auto-fill test data if test mode enabled
    if (testModeEnabled) {
      if (activeTab === "organizator") {
        setEmail("admin@example.com");
      } else if (activeTab === "guest") {
        setEmail("guest@example.com");
      }
    }
  }, [location.state, activeTab, testModeEnabled]);

  const handleTestLogin = () => {
    // Directly navigate to dashboard in test mode
    if (activeTab === "organizator") {
      toast.success(t('auth.testLoginSuccess'));
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } else {
      setEmail("guest@example.com");
      setGuestStep("verify");
      toast.success(t('auth.testDataFilled'));
    }
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
            {t('auth.systemDescription')}
          </p>
        </div>

        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToHome')}
        </Button>

        {testModeEnabled && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>{t('auth.testModeTitle')}</AlertTitle>
            <AlertDescription>
              {t('auth.testModeDescription')}
            </AlertDescription>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={handleTestLogin}
              >
                TEST - {t('auth.loginAs')} {activeTab === "organizator" ? t('auth.organizer') : t('auth.guest')}
              </Button>
            </div>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="organizator">{t('auth.organizer')}</TabsTrigger>
            <TabsTrigger value="guest">{t('auth.guest')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizator">
            <Card>
              <CardHeader>
                <CardTitle>{t('auth.organizerLogin')}</CardTitle>
                <CardDescription>
                  {t('auth.organizerLoginDescription')}
                </CardDescription>
              </CardHeader>
              <OrganizerLoginForm 
                onResetClick={() => setIsResetDialogOpen(true)} 
                defaultEmail={testModeEnabled ? "admin@example.com" : ""} 
                defaultPassword={testModeEnabled ? "password123" : ""}
                testModeEnabled={testModeEnabled}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="guest">
            <Card>
              <CardHeader>
                <CardTitle>
                  {guestStep === "email" 
                    ? t('auth.guestLogin') 
                    : t('auth.verification')}
                </CardTitle>
                <CardDescription>
                  {guestStep === "email" 
                    ? t('auth.guestLoginDescription')
                    : t('auth.verificationDescription')}
                </CardDescription>
              </CardHeader>
              <GuestLoginForm
                email={email}
                setEmail={setEmail}
                guestStep={guestStep}
                setGuestStep={setGuestStep}
                testModeEnabled={testModeEnabled}
              />
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setTestModeEnabled(!testModeEnabled);
              toast.info(testModeEnabled 
                ? t('auth.testModeDisabled') 
                : t('auth.testModeEnabled'));
            }}
          >
            {testModeEnabled 
              ? t('auth.disableTestMode') 
              : t('auth.enableTestMode')}
          </Button>
        </div>
      </div>
      
      <ResetPasswordDialog 
        isOpen={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      />
    </div>
  );
};

export default Login;
