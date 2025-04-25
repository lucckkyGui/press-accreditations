
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, User, Home } from "lucide-react";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  backTo = "/",
  backLabel = "Wróć do strony głównej"
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Press Acreditations</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" />
              Strona główna
            </Button>
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Mój profil
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && (
              <p className="mb-4 text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {showBackButton && (
            <Button variant="ghost" onClick={() => navigate(backTo)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          )}
        </div>
        
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 border-t">
        <div className="container text-center">
          <p className="text-muted-foreground">© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
