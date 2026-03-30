
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Settings, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useI18n } from "@/hooks/useI18n";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useSidebar } from "@/components/ui/sidebar";
import { useWindowSize } from "@/hooks/useWindowSize";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const Header: React.FC = () => {
  const { t } = useI18n();
  const { setOpenMobile } = useSidebar();
  const { isMobile } = useWindowSize();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  const toggleMobileSidebar = () => {
    // Fix: passing a boolean instead of a function
    setOpenMobile(true);
  };

  return (
    <header role="banner" className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-2 md:px-4">
        <div className="mr-4 hidden md:flex">
          <Link to="/dashboard" className="flex items-center space-x-2 font-semibold">
            <span className="hidden font-bold sm:inline-block">EventManager</span>
          </Link>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("navigation.toggleMenu")}</span>
        </Button>
        
        {/* Show compact logo on mobile */}
        <div className="md:hidden flex justify-center flex-1">
          <Link to="/dashboard" className="font-bold text-lg">EM</Link>
        </div>
        
        <div className="hidden md:flex flex-1" />
        
        <div className="flex items-center gap-1 md:gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher variant={isMobile ? "icon" : "full"} />
          <ThemeToggle />
          
          {/* On mobile, only show user menu button */}
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <UserCircle className="h-5 w-5" />
                  <span className="sr-only">{t("navigation.userMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 py-4">
                  <h2 className="font-semibold text-lg">{t("navigation.myProfile")}</h2>
                  <hr />
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/notifications">
                      <Bell className="h-4 w-4 mr-2" />
                      {t("navigation.notifications")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      {t("navigation.settings")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/profile">{t("navigation.profile")}</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>{t("navigation.logOut")}</Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <>
              <NotificationCenter />
              
              <Button variant="ghost" size="icon" asChild>
                <Link to="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t("navigation.settings")}</span>
                </Link>
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <UserCircle className="h-5 w-5" />
                    <span className="sr-only">{t("navigation.userMenu")}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 py-4">
                    <h2 className="font-semibold text-lg">{t("navigation.myProfile")}</h2>
                    <hr />
                    <Button variant="outline" asChild>
                      <Link to="/profile">{t("navigation.profile")}</Link>
                    </Button>
                    <Button variant="outline">{t("navigation.logOut")}</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
