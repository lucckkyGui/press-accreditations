
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Settings, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { t } = useI18n();
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/dashboard" className="flex items-center space-x-2 font-semibold">
            <span className="hidden font-bold sm:inline-block">EventManager</span>
          </Link>
        </div>
        
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("navigation.toggleMenu")}</span>
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher variant="icon" />
          
          <Button variant="ghost" size="icon" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">{t("navigation.notifications")}</span>
            </Link>
          </Button>
          
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
                <h2 className="font-semibold text-lg">{t("navigation.userProfile")}</h2>
                <hr />
                <Button variant="outline" asChild>
                  <Link to="/profile">{t("navigation.profile")}</Link>
                </Button>
                <Button variant="outline">{t("navigation.logOut")}</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
