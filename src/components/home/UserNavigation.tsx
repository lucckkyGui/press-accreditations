
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogIn, Moon, Sun, Ticket, BadgeCheck } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useTheme } from "next-themes";
import { useI18n } from "@/hooks/useI18n";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const UserNavigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const handleOrganizatorLogin = () => {
    navigate("/auth/login", { state: { role: "organizator" } });
  };

  const handleGuestLogin = () => {
    navigate("/auth/login", { state: { role: "guest" } });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };
  
  const handleTicketsClick = () => {
    navigate("/ticketing");
  };
  
  const handleAccreditationClick = () => {
    navigate("/accreditation-categories");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="space-x-4 flex items-center">
      <LanguageSwitcher variant="icon" />
      
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      
      <Button variant="ghost" onClick={handleTicketsClick} className="gap-2">
        <Ticket className="h-4 w-4" />
        {t("navigation.tickets")}
      </Button>
      
      <Button variant="ghost" onClick={handleAccreditationClick} className="gap-2">
        <BadgeCheck className="h-4 w-4" />
        {t("navigation.accreditation") || "Akredytacja"}
      </Button>
      
      {user ? (
        <>
          <Button variant="ghost" onClick={handleProfileClick} className="gap-2">
            <User className="h-4 w-4" />
            {t("navigation.myProfile")}
          </Button>
          <Button onClick={() => signOut()}>{t("navigation.logOut")}</Button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={handleGuestLogin}>{t("navigation.loginAsGuest")}</Button>
          <Button onClick={handleOrganizatorLogin}>{t("navigation.loginAsOrganizer")}</Button>
        </>
      )}
    </div>
  );
};

export default UserNavigation;
