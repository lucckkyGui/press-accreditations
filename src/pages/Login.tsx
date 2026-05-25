
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QrCode, ArrowLeft } from "lucide-react";
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
    if (role === "guest" || role === "organizator") setActiveTab(role);
  }, [location.state]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">

      {/* ── Left panel — credential card + testimonial ─────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden p-12 grid-bg">
        {/* Aurora */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-glow">
              <QrCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold text-foreground tracking-tight">
              Press<span className="text-muted-foreground">/</span>Accreditations
            </span>
          </div>

          {/* Credential badge card */}
          <div className="mb-10">
            <div
              className="p-px rounded-xl shadow-glow"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
            >
              <div className="rounded-xl bg-[#080812] p-6 space-y-5 relative overflow-hidden">
                {/* Background glow inside card */}
                <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px]" />

                {/* Top row */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="chip chip-acc text-[10px] tracking-widest">
                    <span className="chip-dot" /> PRESS · 2026
                  </span>
                  <div className="h-5 w-5 rounded-full bg-primary shadow-glow" />
                </div>

                {/* Event */}
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] relative z-10">
                  Open Era Tour · Warszawa
                </div>

                {/* Journalist info */}
                <div className="relative z-10">
                  <div className="text-[22px] font-bold text-foreground leading-tight">
                    Krzysztof Wojciechowski
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Gazeta Wyborcza · Foto</div>
                </div>

                {/* Bottom row */}
                <div className="flex items-end justify-between relative z-10 pt-2">
                  <div className="font-mono text-[10px] text-muted-foreground">
                    <div className="text-muted-foreground/50 mb-0.5">ID</div>
                    <div className="text-foreground">A-0247 · RFID-8821</div>
                  </div>
                  <QrCode className="h-10 w-10 text-foreground/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="mb-8">
            <blockquote className="text-2xl font-bold text-foreground leading-snug mb-4">
              „Skróciliśmy akredytację
              <br />
              <em className="serif-italic text-primary not-italic">z trzech dni do trzech minut.</em>"
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[11px] font-bold shrink-0">
                AK
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Aleksandra Kruk</div>
                <div className="text-[11px] text-muted-foreground">Head of Press · Polsat Events</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="relative z-10 flex items-center gap-5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            SOC 2 Type II
          </span>
          <span>RODO</span>
          <span>ISO 27001</span>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative">
        {/* Subtle top-right glow on mobile */}
        <div className="lg:hidden pointer-events-none absolute -top-32 -right-32 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[80px]" />

        <div className="w-full max-w-md relative z-10">
          {/* Back link */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-8 -ml-2 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('common.backToHome')}
          </Button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Press Accreditations</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {activeTab === "organizator"
                ? organizerMode === "login" ? "Zaloguj się" : "Utwórz konto"
                : "Dostęp dla gości"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t('auth.systemDescription')}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-muted p-1 rounded-lg h-10">
              <TabsTrigger value="organizator" className="rounded-md text-sm font-medium">
                {t('auth.organizer')}
              </TabsTrigger>
              <TabsTrigger value="guest" className="rounded-md text-sm font-medium">
                {t('auth.guest')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="organizator">
              <Card className="rounded-lg border-border bg-card shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-[15px]">
                    {organizerMode === "login" ? t('auth.organizerLogin') : t('auth.createOrganizerAccount')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {organizerMode === "login"
                      ? t('auth.organizerLoginDescription')
                      : t('auth.createOrganizerAccountDescription')}
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
                  <OrganizerSignupForm onSwitchToLogin={() => setOrganizerMode("login")} />
                )}

                {organizerMode === "login" && (
                  <div className="px-6 pb-6">
                    <p className="text-center text-sm text-muted-foreground">
                      {t('auth.noAccountYet')}{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-primary font-medium"
                        onClick={() => setOrganizerMode("signup")}
                      >
                        {t('auth.createOrganizerAccount')}
                      </Button>
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="guest">
              <Card className="rounded-lg border-border bg-card shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-[15px]">
                    {guestStep === "email" ? t('auth.guestLogin') : t('auth.verification')}
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
      </div>

      <ResetPasswordDialog
        isOpen={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      />
    </div>
  );
};

export default Login;
