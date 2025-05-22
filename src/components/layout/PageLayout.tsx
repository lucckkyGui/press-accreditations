
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, User, Home } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useWindowSize } from "@/hooks/useWindowSize";

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
  backLabel
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isMobile } = useWindowSize();

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background p-2 md:p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            {!isMobile ? (
              <span className="text-lg md:text-xl font-bold">PressAccreditations</span>
            ) : (
              <span className="text-lg font-bold">Press</span>
            )}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={() => navigate("/")}>
              <Home className="h-4 w-4" />
              {!isMobile && <span className="ml-2">{t('common.home')}</span>}
            </Button>
            <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={() => navigate("/profile")}>
              <User className="h-4 w-4" />
              {!isMobile && <span className="ml-2">{t('navigation.myProfile')}</span>}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-4 md:py-8 px-3 md:px-6 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm md:text-base mb-2 md:mb-4 text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {showBackButton && (
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={() => navigate(backTo)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel || t('common.back')}
            </Button>
          )}
        </div>
        
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-4 md:py-6 border-t">
        <div className="container text-center text-sm">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} PressAccreditations. {t('components.footer.rightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
