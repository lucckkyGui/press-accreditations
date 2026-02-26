
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QrCode, ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizerLoginForm } from "@/components/auth/OrganizerLoginForm";
import { OrganizerSignupForm } from "@/components/auth/OrganizerSignupForm";
import { GuestLoginForm } from "@/components/auth/GuestLoginForm";
import { ResetPasswordDialog } from "@/components/auth/ResetPasswordDialog";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("organizator");
  const [organizerMode, setOrganizerMode] = useState<"login" | "signup">("login");
  const [guestStep, setGuestStep] = useState<"email" | "verify">("email");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    const role = location.state?.role;
    if (role === "guest" || role === "organizator") {
      setActiveTab(role);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/8 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg shadow-primary/20">
                <QrCode className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 bg-accent rounded-full p-1">
                <Sparkles className="h-3 w-3 text-accent-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Press Acreditations</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('auth.systemDescription')}
          </p>
        </div>

        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToHome')}
        </Button>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-5 bg-muted/50 p-1 rounded-xl h-11">
            <TabsTrigger value="organizator" className="rounded-lg data-[state=active]:shadow-sm font-medium">
              {t('auth.organizer')}
            </TabsTrigger>
            <TabsTrigger value="guest" className="rounded-lg data-[state=active]:shadow-sm font-medium">
              {t('auth.guest')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizator">
            <Card className="rounded-2xl border-border/50 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/95">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">
                  {organizerMode === "login" ? t('auth.organizerLogin') : "Utwórz konto organizatora"}
                </CardTitle>
                <CardDescription className="text-sm">
                  {organizerMode === "login" 
                    ? t('auth.organizerLoginDescription')
                    : "Zarejestruj swoją organizację, aby zarządzać wydarzeniami i akredytacjami"}
                </CardDescription>
              </CardHeader>
              
              {organizerMode === "login" ? (
                <OrganizerLoginForm 
                  onResetClick={() => setIsResetDialogOpen(true)} 
                  defaultEmail="" 
                  defaultPassword=""
                  testModeEnabled={false}
                />
              ) : (
                <OrganizerSignupForm 
                  onSwitchToLogin={() => setOrganizerMode("login")}
                />
              )}
              
              {organizerMode === "login" && (
                <div className="px-6 pb-6">
                  <div className="text-center text-sm text-muted-foreground">
                    Nie masz jeszcze konta?{" "}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-primary font-medium"
                      onClick={() => setOrganizerMode("signup")}
                    >
                      Utwórz konto organizatora
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="guest">
            <Card className="rounded-2xl border-border/50 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/95">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">
                  {guestStep === "email" 
                    ? t('auth.guestLogin') 
                    : t('auth.verification')}
                </CardTitle>
                <CardDescription className="text-sm">
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
                testModeEnabled={false}
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
